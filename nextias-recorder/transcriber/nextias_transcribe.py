#!/usr/bin/env python3
"""NextIAS transcriber.

Turns the audio saved by NextIAS Recorder (Documents/NextIAS Recordings) into
timestamped, continuous and subtitle transcripts (Documents/NextIAS Transcripts).

Engines
  local       Whisper large-v3 on this Mac (mlx-whisper). Free, private, slower,
              weakest on Hinglish.
  sarvam      Sarvam AI Saaras v3 "codemix" (cloud, paid, needs an API key).
              Built for Indian code-mixed speech: Hindi in Devanagari, English in Latin.
  elevenlabs  ElevenLabs Scribe v2 (cloud, paid, needs an API key). Keeps English
              words in Latin script inside Hindi speech.

Audio is never deleted, so any lecture can be transcribed again later with a
different engine without watching it again.

Usage
  nextias_transcribe.py watch                 keep running; transcribe new audio as it appears
  nextias_transcribe.py once                  transcribe everything pending, then exit
  nextias_transcribe.py redo FOLDER [--engine E]   transcribe one recording again
  nextias_transcribe.py status                show what is pending
"""

from __future__ import annotations

import argparse
import datetime as dt
import fcntl
import io
import json
import math
import os
import re
import sys
import threading
import time
import traceback
import urllib.error
import urllib.request
import uuid
import wave
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np

VERSION = "1.0.0"
SAMPLE_RATE = 16000
HOME = Path.home()
RECORDINGS = Path(os.environ.get("NEXTIAS_RECORDINGS", HOME / "Documents" / "NextIAS Recordings"))
TRANSCRIPTS = Path(os.environ.get("NEXTIAS_TRANSCRIPTS", HOME / "Documents" / "NextIAS Transcripts"))
SUPPORT = Path(os.environ.get("NEXTIAS_SUPPORT", HOME / "Library" / "Application Support" / "NextIASRecorder"))
SETTINGS_FILE = SUPPORT / "settings.json"
STATUS_FILE = RECORDINGS / ".transcriber-status.json"

DEFAULT_SETTINGS = {
    "engine": "local",
    "localModel": "mlx-community/whisper-large-v3-mlx-8bit",
    "language": "auto",            # auto (Hindi or English per chunk) | hi | en
    "sarvamApiKey": "",
    "sarvamMode": "codemix",       # codemix | transcribe | translit
    "elevenlabsApiKey": "",
    "hfHubCache": "",
}

ENGINE_LABELS = {"local": "Whisper large-v3 (this Mac)", "sarvam": "Sarvam Saaras v3", "elevenlabs": "ElevenLabs Scribe v2", "dummy": "test engine"}
FILE_SUFFIX = {"local": "", "sarvam": " (Sarvam)", "elevenlabs": " (ElevenLabs)", "dummy": " (test)"}

# Shown to Whisper before every chunk: teaches the mixed-script style (Hindi in Devanagari,
# English terms in English) without inserting any content of its own.
STYLE_PROMPT = ("यह UPSC की lecture है। आज हम Indian Constitution, Fundamental Rights और "
                "Directive Principles को discuss करेंगे, जैसे Article 21 और Supreme Court के judgements।")

KNOWN_HALLUCINATIONS = [
    "subtitles by the amara.org community", "thanks for watching", "thank you for watching",
    "please subscribe", "like and subscribe", "सब्सक्राइब", "कृपया सब्सक्राइब करें",
    "उपशीर्षक", "धन्यवाद देखने के लिए",
]

STALE_SECONDS = 180
IDLE_UNLOAD_SECONDS = 600
MAX_PART_FAILURES = 3


# ----------------------------------------------------------------------------- utilities

def log(*args):
    print(dt.datetime.now().strftime("%H:%M:%S"), *args, flush=True)


def load_settings() -> dict:
    settings = dict(DEFAULT_SETTINGS)
    try:
        settings.update(json.loads(SETTINGS_FILE.read_text("utf-8")))
    except FileNotFoundError:
        pass
    except Exception as exc:  # broken settings must not stop transcription
        log("Could not read settings.json:", exc)
    settings["sarvamApiKey"] = os.environ.get("SARVAM_API_KEY", settings.get("sarvamApiKey", ""))
    settings["elevenlabsApiKey"] = os.environ.get("ELEVENLABS_API_KEY", settings.get("elevenlabsApiKey", ""))
    return settings


def write_atomic(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f".{path.name}.{uuid.uuid4().hex[:8]}.tmp")
    tmp.write_text(text, "utf-8")
    os.replace(tmp, path)


def write_json(path: Path, obj):
    write_atomic(path, json.dumps(obj, ensure_ascii=False, indent=2))


def clock(seconds: float) -> str:
    s = max(0, int(seconds))
    return f"{s // 3600:02d}:{(s // 60) % 60:02d}:{s % 60:02d}"


def srt_time(seconds: float) -> str:
    ms = max(0, int(round(seconds * 1000)))
    return f"{ms // 3600000:02d}:{(ms // 60000) % 60:02d}:{(ms // 1000) % 60:02d},{ms % 1000:03d}"


def safe_name(text: str) -> str:
    cleaned = re.sub(r'[/\\:?%*|"<>\n\r\t]+', "-", text).strip()
    return (cleaned or "Lecture")[:80]


def parse_iso(text: str | None) -> dt.datetime | None:
    if not text:
        return None
    try:
        return dt.datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None


def read_wav(path: Path) -> np.ndarray:
    """Reads a 16 kHz mono 16-bit WAV as float32. Uses the real file size, so a part
    whose header was not finalised (crash) still reads completely."""
    data = path.read_bytes()
    pos, offset, channels, rate, bits = 12, None, 1, SAMPLE_RATE, 16
    while pos + 8 <= len(data):
        cid, size = data[pos:pos + 4], int.from_bytes(data[pos + 4:pos + 8], "little")
        if cid == b"fmt ":
            channels = int.from_bytes(data[pos + 10:pos + 12], "little")
            rate = int.from_bytes(data[pos + 12:pos + 16], "little")
            bits = int.from_bytes(data[pos + 22:pos + 24], "little")
        if cid == b"data":
            offset = pos + 8
            break
        pos += 8 + size + (size & 1)
    if offset is None or bits != 16:
        raise ValueError(f"{path.name} is not a 16-bit WAV file")
    raw = data[offset:]
    raw = raw[: len(raw) // (2 * channels) * 2 * channels]
    audio = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    if channels > 1:
        audio = audio.reshape(-1, channels).mean(axis=1)
    if rate != SAMPLE_RATE:
        # Recorder always writes 16 kHz; linear resampling is only a fallback for other files.
        n = int(len(audio) * SAMPLE_RATE / rate)
        audio = np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio).astype(np.float32)
    return audio


def wav_bytes(audio: np.ndarray) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes())
    return buf.getvalue()


# ----------------------------------------------------------------------------- chunking

FRAME = 1600  # 100 ms


def frame_db(audio: np.ndarray) -> np.ndarray:
    n = len(audio) // FRAME
    if n == 0:
        return np.zeros(0)
    frames = audio[: n * FRAME].reshape(n, FRAME).astype(np.float64)
    rms = np.sqrt((frames ** 2).mean(axis=1))
    return 20 * np.log10(np.maximum(rms, 1e-7))


def plan_chunks(audio: np.ndarray, max_seconds: float = 28.0, silence_db: float = -50.0,
                min_gap: float = 1.5, pad: float = 0.25) -> list[tuple[float, float]]:
    """Splits audio into speech chunks no longer than max_seconds.

    Only clearly silent stretches (paused lecture, digital silence) are skipped. Long speech
    is cut at the quietest 100 ms frame near the limit, so words are rarely split."""
    db = frame_db(audio)
    if len(db) == 0:
        return []
    loud = db > silence_db
    total = len(audio) / SAMPLE_RATE
    regions, start, quiet_run = [], None, 0
    gap_frames = int(min_gap * 10)
    for i, is_loud in enumerate(loud):
        if is_loud:
            if start is None:
                start = i
            quiet_run = 0
        elif start is not None:
            quiet_run += 1
            if quiet_run >= gap_frames:
                regions.append((start, i - quiet_run + 1))
                start, quiet_run = None, 0
    if start is not None:
        regions.append((start, len(loud) - quiet_run))

    chunks = []
    max_frames = int(max_seconds * 10)
    for a, b in regions:
        while b - a > max_frames:
            window_lo = a + max(10, max_frames - 80)
            cut = window_lo + int(np.argmin(db[window_lo:a + max_frames]))
            chunks.append((a, cut))
            a = cut
        if b - a >= 3:
            chunks.append((a, b))
    out = []
    for a, b in chunks:
        s = max(0.0, a / 10 - pad)
        e = min(total, b / 10 + pad)
        out.append((round(s, 2), round(e, 2)))
    return out


# ----------------------------------------------------------------------------- text clean-up

def collapse_repeats(text: str) -> tuple[str, bool]:
    """Whisper sometimes loops ("the the the the ..."). Keep two copies and flag it."""
    flagged = False
    for n in (1, 2, 3, 4):
        pattern = re.compile(r"((?:\S+\s+){%d})\1{3,}" % n)
        new = pattern.sub(lambda m: m.group(1) * 2, text + " ").strip()
        if new != text.strip():
            flagged = True
            text = new
    return text, flagged


def is_hallucination(text: str) -> bool:
    t = re.sub(r"[^\w\s.]", "", text.lower()).strip()
    return any(t == h or (len(t) < len(h) + 12 and h in t) for h in KNOWN_HALLUCINATIONS)


def clean_segment(seg: dict) -> dict | None:
    text = re.sub(r"\s+", " ", seg.get("text", "")).strip()
    if not text or is_hallucination(text):
        return None
    text, looped = collapse_repeats(text)
    seg = dict(seg, text=text)
    if looped:
        seg["flag"] = "unclear"
    return seg


# ----------------------------------------------------------------------------- engines

class LocalWhisper:
    name = "local"
    chunk_seconds = 28.0

    def __init__(self, settings: dict):
        self.model = settings["localModel"]
        self.language = settings.get("language", "auto")
        if settings.get("hfHubCache"):
            os.environ.setdefault("HF_HUB_CACHE", settings["hfHubCache"])
        import mlx_whisper  # noqa: F401  (fails early with a clear message if not installed)
        self.last_used = time.time()

    @property
    def model_label(self):
        return self.model

    def _run(self, audio, language, prompt):
        import mlx_whisper
        return mlx_whisper.transcribe(
            audio, path_or_hf_repo=self.model, language=language, task="transcribe",
            initial_prompt=prompt, condition_on_previous_text=False,
            temperature=(0.0, 0.2, 0.4, 0.6, 0.8, 1.0), compression_ratio_threshold=2.4,
            logprob_threshold=-1.0, no_speech_threshold=0.6, fp16=True, verbose=None)

    def transcribe_part(self, audio: np.ndarray, subject: str, progress) -> list[dict]:
        segments, previous = [], ""
        chunks = plan_chunks(audio, self.chunk_seconds)
        for i, (s, e) in enumerate(chunks):
            progress(i, len(chunks))
            piece = audio[int(s * SAMPLE_RATE):int(e * SAMPLE_RATE)]
            prompt = " ".join(x for x in (STYLE_PROMPT, subject, previous[-160:]) if x)
            language = None if self.language == "auto" else self.language
            result = self._run(piece, language, prompt)
            if self.language == "auto" and result.get("language") not in ("hi", "en"):
                # Whisper often mistakes Hindi for Urdu (Arabic script); Hindi is the safe choice.
                result = self._run(piece, "hi", prompt)
            chunk_text = []
            for seg in result.get("segments", []):
                if seg.get("no_speech_prob", 0) > 0.6 and seg.get("avg_logprob", 0) < -0.8:
                    continue
                item = {"start": round(s + seg["start"], 2), "end": round(min(e, s + seg["end"]), 2), "text": seg["text"]}
                if seg.get("avg_logprob", 0) < -1.0 or seg.get("compression_ratio", 0) > 2.4:
                    item["flag"] = "unclear"
                item = clean_segment(item)
                if item:
                    segments.append(item)
                    if "flag" not in item:
                        chunk_text.append(item["text"])
            previous = " ".join(chunk_text) or previous
        self.last_used = time.time()
        return segments

    def unload(self):
        try:
            from mlx_whisper import transcribe as t
            t.ModelHolder.model = None
            t.ModelHolder.model_path = None
            import mlx.core as mx
            (getattr(mx, "clear_cache", None) or mx.metal.clear_cache)()
        except Exception:
            pass


def http_post_multipart(url: str, headers: dict, fields: dict, file_field: str, file_name: str,
                        file_bytes: bytes, timeout: int = 300) -> dict:
    boundary = "----nextias" + uuid.uuid4().hex
    body = io.BytesIO()
    for key, value in fields.items():
        values = value if isinstance(value, list) else [value]
        for v in values:
            body.write(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{key}\"\r\n\r\n{v}\r\n".encode())
    body.write(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{file_field}\"; filename=\"{file_name}\"\r\n"
               "Content-Type: audio/wav\r\n\r\n".encode())
    body.write(file_bytes)
    body.write(f"\r\n--{boundary}--\r\n".encode())
    request = urllib.request.Request(url, data=body.getvalue(), method="POST",
                                     headers={**headers, "Content-Type": f"multipart/form-data; boundary={boundary}"})
    delay = 3
    for attempt in range(6):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")[:500]
            if exc.code in (401, 403):
                raise RuntimeError(f"The API key was refused ({exc.code}). Check it in settings. {detail}")
            if exc.code in (408, 409, 429, 500, 502, 503, 504) and attempt < 5:
                time.sleep(delay)
                delay *= 2
                continue
            raise RuntimeError(f"Service error {exc.code}: {detail}")
        except (urllib.error.URLError, TimeoutError, ConnectionError) as exc:
            if attempt < 5:
                time.sleep(delay)
                delay *= 2
                continue
            raise RuntimeError(f"Could not reach the service: {exc}")
    raise RuntimeError("unreachable")


class Sarvam:
    name = "sarvam"
    chunk_seconds = 28.0   # the synchronous API accepts up to 30 s per request
    url = "https://api.sarvam.ai/speech-to-text"

    def __init__(self, settings: dict):
        self.key = settings.get("sarvamApiKey", "")
        self.mode = settings.get("sarvamMode", "codemix")
        if not self.key:
            raise RuntimeError("No Sarvam API key. Run “Choose Transcription Engine.command”.")
        self.model_label = f"saaras:v3 ({self.mode})"

    def _one(self, piece: np.ndarray) -> str:
        result = http_post_multipart(
            self.url, {"api-subscription-key": self.key},
            {"model": "saaras:v3", "mode": self.mode, "language_code": "hi-IN"},
            "file", "chunk.wav", wav_bytes(piece), timeout=120)
        return result.get("transcript", "") or ""

    def transcribe_part(self, audio: np.ndarray, subject: str, progress) -> list[dict]:
        chunks = plan_chunks(audio, self.chunk_seconds)
        done = [0]
        lock = threading.Lock()

        def work(chunk):
            s, e = chunk
            text = self._one(audio[int(s * SAMPLE_RATE):int(e * SAMPLE_RATE)])
            with lock:
                done[0] += 1
                progress(done[0], len(chunks))
            return {"start": s, "end": e, "text": text}

        with ThreadPoolExecutor(max_workers=3) as pool:
            results = list(pool.map(work, chunks))
        return [seg for seg in (clean_segment(r) for r in results) if seg]

    def unload(self):
        pass


class ElevenLabs:
    name = "elevenlabs"
    url = "https://api.elevenlabs.io/v1/speech-to-text"

    def __init__(self, settings: dict):
        self.key = settings.get("elevenlabsApiKey", "")
        if not self.key:
            raise RuntimeError("No ElevenLabs API key. Run “Choose Transcription Engine.command”.")
        self.model_label = "scribe_v2"

    def transcribe_part(self, audio: np.ndarray, subject: str, progress) -> list[dict]:
        progress(0, 1)
        if not plan_chunks(audio):
            return []
        result = http_post_multipart(
            self.url, {"xi-api-key": self.key},
            {"model_id": "scribe_v2", "timestamps_granularity": "word", "tag_audio_events": "false",
             "diarize": "false"},
            "file", "part.wav", wav_bytes(audio), timeout=900)
        progress(1, 1)
        return words_to_segments(result.get("words") or [], result.get("text", ""))

    def unload(self):
        pass


def words_to_segments(words: list[dict], fallback_text: str) -> list[dict]:
    """Groups word timestamps into readable lines: break on pauses, sentence ends or length."""
    segments, current = [], []

    def flush():
        if current:
            text = "".join(w["text"] for w in current).strip()
            seg = clean_segment({"start": round(current[0]["start"], 2), "end": round(current[-1]["end"], 2), "text": text})
            if seg:
                segments.append(seg)
            current.clear()

    for w in words:
        kind = w.get("type", "word")
        if kind == "audio_event" or w.get("start") is None:
            continue
        if kind == "spacing":
            if current:
                current.append({"text": " ", "start": w["start"], "end": current[-1]["end"]})
            continue
        if current:
            gap = w["start"] - current[-1]["end"]
            length = w["end"] - current[0]["start"]
            ends_sentence = current[-1]["text"].strip()[-1:] in ".?!।"
            if gap > 0.8 or length > 20 or (ends_sentence and length > 6):
                flush()
        current.append({"text": w["text"], "start": w["start"], "end": w["end"]})
    flush()
    if not segments and fallback_text.strip():
        segments.append({"start": 0.0, "end": 0.0, "text": fallback_text.strip()})
    return segments


class Dummy:
    """Used by the automated tests: reports each speech chunk without recognising words."""
    name = "dummy"
    model_label = "dummy"

    def __init__(self, settings):
        pass

    def transcribe_part(self, audio, subject, progress):
        return [{"start": s, "end": e, "text": f"speech {s:.1f}-{e:.1f}"} for s, e in plan_chunks(audio)]

    def unload(self):
        pass


ENGINES = {"local": LocalWhisper, "sarvam": Sarvam, "elevenlabs": ElevenLabs, "dummy": Dummy}


# ----------------------------------------------------------------------------- recordings

class RecordingFolder:
    def __init__(self, folder: Path):
        self.folder = folder
        self.meta = json.loads((folder / "recording.json").read_text("utf-8"))

    @property
    def title(self):
        return self.meta.get("title") or self.folder.name

    @property
    def is_stale(self) -> bool:
        if self.meta.get("status") != "recording":
            return False
        updated = parse_iso(self.meta.get("updatedAt"))
        return updated is None or (dt.datetime.now(dt.timezone.utc) - updated).total_seconds() > STALE_SECONDS

    @property
    def finished(self) -> bool:
        return self.meta.get("status") in ("finished", "interrupted") or self.is_stale

    def parts(self) -> list[dict]:
        parts = sorted(self.meta.get("parts", []), key=lambda p: p.get("start", 0))
        if self.is_stale:   # recorder crashed: the last part is as complete as it will get
            parts = [dict(p, complete=True) for p in parts]
        return parts

    def result_dir(self, engine: str) -> Path:
        return self.folder / "transcript" / engine

    def result_path(self, engine: str, part: dict) -> Path:
        return self.result_dir(engine) / (Path(part["file"]).stem + ".json")

    def pending(self, engine: str) -> list[dict]:
        out = []
        for p in self.parts():
            if p.get("complete") and not self.result_path(engine, p).exists() and (self.folder / p["file"]).exists():
                out.append(p)
        return out


def list_recordings() -> list[RecordingFolder]:
    found = []
    if not RECORDINGS.exists():
        return found
    for folder in sorted(RECORDINGS.iterdir()):
        if (folder / "recording.json").exists():
            try:
                found.append(RecordingFolder(folder))
            except Exception as exc:
                log("Skipping", folder.name, "-", exc)
    found.sort(key=lambda r: r.meta.get("createdAt", ""))
    return found


def output_base(rec: RecordingFolder, engine: str) -> str:
    created = parse_iso(rec.meta.get("createdAt"))
    date = created.astimezone().strftime("%Y-%m-%d") if created else "undated"
    return f"{safe_name(rec.title)} — {date} — {rec.meta.get('id', 'x')[:8]}{FILE_SUFFIX.get(engine, ' (' + engine + ')')}"


def assemble(rec: RecordingFolder, engine: str) -> dict:
    """Writes the three transcript files from whatever parts are done so far."""
    parts = rec.parts()
    total_seconds = sum(p.get("duration", 0) for p in parts)
    sessions = {s.get("index"): s for s in rec.meta.get("sessions", [])}
    lines, plain_paragraphs, srt = [], [], []
    done = missing = 0
    current_session, paragraph, last_end = None, [], None
    unclear = 0
    engine_models = set()

    for p in parts:
        if p.get("session") != current_session:
            if current_session is not None:
                s = sessions.get(p.get("session"), {})
                lines.append(f"\n[— recording continued at {clock(p.get('start', 0))}"
                             f"{' from ' + s.get('sourceName') if s.get('sourceName') else ''} —]\n")
                if paragraph:
                    plain_paragraphs.append(" ".join(paragraph))
                    paragraph = []
                plain_paragraphs.append("[— recording continued —]")
            current_session = p.get("session")
        path = rec.result_path(engine, p)
        if not path.exists():
            missing += 1
            lines.append(f"[{clock(p.get('start', 0))}] [… this part ({clock(p.get('duration', 0))} of audio) is not transcribed yet …]")
            continue
        result = json.loads(path.read_text("utf-8"))
        engine_models.add(result.get("model", ""))
        done += 1
        if result.get("error"):
            lines.append(f"[{clock(p.get('start', 0))}] [transcription failed for this part: {result['error']}]")
            continue
        for seg in result.get("segments", []):
            start, end = p["start"] + seg["start"], p["start"] + seg["end"]
            mark = " (?)" if seg.get("flag") else ""
            unclear += 1 if mark else 0
            lines.append(f"[{clock(start)}] {seg['text']}{mark}")
            srt.append((start, max(end, start + 0.5), seg["text"] + mark))
            if last_end is not None and start - last_end > 3.0 and paragraph:
                plain_paragraphs.append(" ".join(paragraph))
                paragraph = []
            paragraph.append(seg["text"] + mark)
            last_end = end
    if paragraph:
        plain_paragraphs.append(" ".join(paragraph))

    final = rec.finished and missing == 0
    status = ("complete" if rec.meta.get("status") == "finished" else "interrupted — audio up to the cut-off is included") if final \
        else ("recording still in progress" if not rec.finished else "transcription in progress")
    created = parse_iso(rec.meta.get("createdAt"))
    header = [
        rec.title,
        "=" * min(78, max(10, len(rec.title))),
        f"Subject words: {rec.meta.get('subject')}" if rec.meta.get("subject") else None,
        f"Recorded from: {rec.meta.get('sourceName') or 'unknown'}",
        f"Recording started: {created.astimezone().strftime('%d %b %Y, %H:%M') if created else 'unknown'}",
        f"Audio length: {clock(total_seconds)}",
        f"Transcript status: {status} ({done} of {len(parts)} audio parts done)",
        f"Engine: {ENGINE_LABELS.get(engine, engine)}{' — ' + ', '.join(sorted(m for m in engine_models if m)) if engine_models else ''}",
        "Times are measured from when you pressed Start recording (not the lecture player's own clock).",
        "Silence (paused lecture) is skipped. (?) marks wording the engine was unsure of — check the audio.",
        "This is a raw machine transcript, not a translation or summary.",
    ]
    notes = rec.meta.get("notes", [])
    if notes:
        header.append("Recording notes:")
        header.extend(f"  • {n}" for n in notes[-20:])
    header = "\n".join(h for h in header if h is not None)

    base = output_base(rec, engine)
    TRANSCRIPTS.mkdir(parents=True, exist_ok=True)
    timestamps = TRANSCRIPTS / f"{base} — timestamps.txt"
    continuous = TRANSCRIPTS / f"{base} — continuous.txt"
    subtitles = TRANSCRIPTS / f"{base} — subtitles.srt"
    write_atomic(timestamps, header + "\n\n" + "\n".join(lines) + "\n")
    write_atomic(continuous, header + "\n\n" + "\n\n".join(plain_paragraphs) + "\n")
    write_atomic(subtitles, "\n".join(f"{i}\n{srt_time(a)} --> {srt_time(b)}\n{t}\n" for i, (a, b, t) in enumerate(srt, 1)))
    state = {"engine": engine, "doneParts": done, "totalParts": len(parts), "final": final,
             "unclearLines": unclear, "timestampsFile": str(timestamps), "continuousFile": str(continuous),
             "subtitlesFile": str(subtitles), "updatedAt": time.time()}
    write_json(rec.folder / "transcript" / "state.json", state)
    return state


# ----------------------------------------------------------------------------- worker

class Transcriber:
    def __init__(self, engine_name: str | None = None):
        self.settings = load_settings()
        self.engine_name = engine_name or self.settings.get("engine", "local")
        if self.engine_name not in ENGINES:
            raise SystemExit(f"Unknown engine {self.engine_name!r}. Choose one of: {', '.join(ENGINES)}")
        self.engine = None

    def get_engine(self):
        if self.engine is None:
            self.engine = ENGINES[self.engine_name](self.settings)
        return self.engine

    def status(self, message: str, working: bool):
        try:
            write_json(STATUS_FILE, {"updatedAt": time.time(), "state": "working" if working else "idle",
                                     "engine": self.engine_name, "message": message, "version": VERSION})
        except Exception:
            pass

    def queue(self) -> list[tuple[RecordingFolder, dict]]:
        items = []
        for rec in list_recordings():
            for p in rec.pending(self.engine_name):
                items.append((rec, p))
        items.sort(key=lambda it: (it[0].meta.get("createdAt", ""), it[1].get("start", 0)))
        # Round-robin between lectures recorded at the same time, so each transcript grows.
        by_rec: dict[str, list] = {}
        for rec, p in items:
            by_rec.setdefault(rec.folder.name, []).append((rec, p))
        ordered = []
        while any(by_rec.values()):
            for key in list(by_rec):
                if by_rec[key]:
                    ordered.append(by_rec[key].pop(0))
        return ordered

    def process_part(self, rec: RecordingFolder, part: dict, queue_seconds: float):
        engine = self.get_engine()
        label = f"“{rec.title}” {clock(part['start'])}–{clock(part['start'] + part.get('duration', 0))}"
        backlog = f" — {int(queue_seconds // 60)} min of audio waiting" if queue_seconds > 60 else ""
        self.status(f"transcribing {label}{backlog}", True)
        log("Transcribing", label)
        error_path = rec.result_dir(self.engine_name) / (Path(part["file"]).stem + ".errors.json")
        started = time.time()
        try:
            audio = read_wav(rec.folder / part["file"])

            def progress(i, n):
                self.status(f"transcribing {label} ({min(i + 1, n)}/{n}){backlog}", True)

            segments = engine.transcribe_part(audio, rec.meta.get("subject", ""), progress)
            result = {"part": part["file"], "engine": self.engine_name, "model": engine.model_label,
                      "createdAt": dt.datetime.now().isoformat(timespec="seconds"),
                      "audioSeconds": round(len(audio) / SAMPLE_RATE, 2),
                      "processingSeconds": round(time.time() - started, 1), "segments": segments}
            write_json(rec.result_path(self.engine_name, part), result)
            if error_path.exists():
                error_path.unlink()
            log(f"  done in {time.time() - started:.0f}s, {len(segments)} lines")
        except Exception as exc:
            failures = 1
            if error_path.exists():
                failures = json.loads(error_path.read_text("utf-8")).get("failures", 0) + 1
            log("  failed:", exc)
            traceback.print_exc()
            if failures >= MAX_PART_FAILURES or isinstance(exc, ValueError):
                write_json(rec.result_path(self.engine_name, part),
                           {"part": part["file"], "engine": self.engine_name, "model": getattr(engine, "model_label", ""),
                            "error": str(exc)[:300], "segments": []})
                if error_path.exists():
                    error_path.unlink()
            else:
                write_json(error_path, {"failures": failures, "lastError": str(exc)[:500], "at": time.time()})
                raise
        assemble(rec, self.engine_name)

    def refresh_outputs(self):
        """Rewrites transcripts whose recording status changed (e.g. finished) without new parts."""
        for rec in list_recordings():
            state_path = rec.folder / "transcript" / "state.json"
            try:
                state = json.loads(state_path.read_text("utf-8")) if state_path.exists() else None
            except Exception:
                state = None
            done = sum(1 for p in rec.parts() if rec.result_path(self.engine_name, p).exists())
            if done == 0 and not rec.finished:
                continue
            if state is None or state.get("engine") != self.engine_name or \
                    (not state.get("final") and rec.finished and not rec.pending(self.engine_name)):
                if rec.parts():
                    assemble(rec, self.engine_name)

    def run_once(self) -> int:
        processed = 0
        while True:
            items = self.queue()
            if not items:
                break
            queue_seconds = sum(p.get("duration", 0) for _, p in items)
            rec, part = items[0]
            try:
                self.process_part(rec, part, queue_seconds)
            except Exception:
                return processed   # retried later
            processed += 1
        self.refresh_outputs()
        return processed

    def watch(self):
        log(f"NextIAS transcriber {VERSION} watching {RECORDINGS} with engine {self.engine_name}")
        idle_since = time.time()
        while True:
            try:
                n = self.run_once()
                if n:
                    idle_since = time.time()
                waiting = self.queue()
                if waiting:
                    self.status("waiting to retry after an error; will try again shortly", False)
                    time.sleep(60)
                else:
                    self.status("all transcripts are up to date", False)
                if self.engine and time.time() - idle_since > IDLE_UNLOAD_SECONDS:
                    self.engine.unload()
                    self.engine = None
            except Exception as exc:
                log("Unexpected error:", exc)
                traceback.print_exc()
                time.sleep(30)
            time.sleep(10)


def acquire_lock():
    SUPPORT.mkdir(parents=True, exist_ok=True)
    handle = open(SUPPORT / "transcriber.lock", "w")
    try:
        fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("The transcriber is already running in the background. Its progress is shown in NextIAS Recorder.")
        sys.exit(0)
    return handle


def find_recording(arg: str) -> RecordingFolder:
    path = Path(arg).expanduser()
    if not path.is_absolute():
        path = RECORDINGS / arg
    if not (path / "recording.json").exists():
        matches = [r for r in list_recordings() if arg.lower() in r.folder.name.lower() or arg.lower() in r.title.lower()]
        if len(matches) == 1:
            return matches[0]
        raise SystemExit(f"Could not find one recording matching {arg!r}.")
    return RecordingFolder(path)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Transcribe NextIAS Recorder audio.")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("watch")
    p_once = sub.add_parser("once")
    p_once.add_argument("--engine")
    p_redo = sub.add_parser("redo")
    p_redo.add_argument("recording")
    p_redo.add_argument("--engine")
    sub.add_parser("status")
    args = parser.parse_args(argv)

    if args.command == "status":
        t = Transcriber()
        items = t.queue()
        print(f"Engine: {ENGINE_LABELS.get(t.engine_name, t.engine_name)}")
        print(f"Audio parts waiting: {len(items)} ({sum(p.get('duration', 0) for _, p in items) / 60:.0f} min)")
        for rec, p in items[:20]:
            print(f"  {rec.title}: {p['file']}")
        return
    lock = acquire_lock()  # noqa: F841  (held for the life of the process)
    if args.command == "watch":
        Transcriber().watch()
    elif args.command == "once":
        t = Transcriber(args.engine)
        n = t.run_once()
        print(f"Transcribed {n} audio part(s). Transcripts are in {TRANSCRIPTS}")
    elif args.command == "redo":
        rec = find_recording(args.recording)
        t = Transcriber(args.engine)
        result_dir = rec.result_dir(t.engine_name)
        if result_dir.exists():
            for f in result_dir.glob("*.json"):
                f.unlink()
        for p in rec.pending(t.engine_name):
            t.process_part(rec, p, 0)
        state = assemble(rec, t.engine_name)
        print("Wrote", state["timestampsFile"])


if __name__ == "__main__":
    main()
