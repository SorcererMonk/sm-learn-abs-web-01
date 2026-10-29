"""Tests for the NextIAS transcriber. Run:  python3 -m unittest discover -s tests -v

They use generated audio, a fake Whisper module and a local fake HTTP server, so they
need no model download, no API key and no internet."""

import datetime as dt
import importlib
import json
import math
import os
import struct
import sys
import tempfile
import threading
import types
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "transcriber"))
SR = 16000


def swift_style_header(data_bytes: int) -> bytes:
    """Same 44-byte header that WavWriter.header() in the Swift recorder writes."""
    return (b"RIFF" + struct.pack("<I", 36 + data_bytes) + b"WAVE" + b"fmt " +
            struct.pack("<IHHIIHH", 16, 1, 1, SR, SR * 2, 2, 16) + b"data" + struct.pack("<I", data_bytes))


def tone(seconds, freq=220.0, level=0.3):
    t = np.arange(int(seconds * SR)) / SR
    # Amplitude-modulated so it looks like syllables, but never drops into "silence".
    return (level * np.sin(2 * math.pi * freq * t) * (0.6 + 0.4 * np.sin(2 * math.pi * 3 * t))).astype(np.float32)


def silence(seconds):
    return np.zeros(int(seconds * SR), dtype=np.float32)


def write_part(path: Path, audio: np.ndarray, header_bytes=None):
    pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(swift_style_header(len(pcm) if header_bytes is None else header_bytes) + pcm)


class Env:
    """Fresh temporary Recordings/Transcripts/Support folders and a re-imported module."""

    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory()
        base = Path(self.tmp.name)
        self.recordings, self.transcripts, self.support = base / "rec", base / "tr", base / "sup"
        os.environ.update(NEXTIAS_RECORDINGS=str(self.recordings), NEXTIAS_TRANSCRIPTS=str(self.transcripts),
                          NEXTIAS_SUPPORT=str(self.support))
        sys.modules.pop("nextias_transcribe", None)
        self.nt = importlib.import_module("nextias_transcribe")

    def make_recording(self, name, parts, status="finished", sessions=None, updated=None, title="Polity Lecture 05"):
        folder = self.recordings / name
        meta_parts, start = [], 0.0
        for i, (audio, session, complete, header) in enumerate(parts, 1):
            file = f"audio/part-{i:04d}.wav"
            write_part(folder / file, audio, header)
            meta_parts.append({"file": file, "session": session, "start": start,
                               "duration": len(audio) / SR, "complete": complete})
            start += len(audio) / SR
        now = dt.datetime.now(dt.timezone.utc)
        meta = {"format": 1, "id": "12345678-aaaa-bbbb-cccc-1234567890ab", "title": title, "subject": "Preamble",
                "sourceName": "NEXT IAS", "createdAt": now.isoformat(), "updatedAt": (updated or now).isoformat(),
                "status": status, "sampleRate": SR, "recorderVersion": "1.0.0",
                "sessions": sessions or [{"index": 1, "startedAt": now.isoformat(), "audioStart": 0, "sourceName": "NEXT IAS"}],
                "parts": meta_parts, "notes": ["No audio arrived for 5 s near 00:01:00; that stretch is silent in the recording."]}
        (folder / "recording.json").write_text(json.dumps(meta))
        return folder

    def close(self):
        self.tmp.cleanup()


class ChunkingTests(unittest.TestCase):
    def setUp(self):
        self.env = Env()
        self.nt = self.env.nt

    def tearDown(self):
        self.env.close()

    def test_silence_is_skipped_and_speech_kept(self):
        audio = np.concatenate([silence(5), tone(4), silence(10), tone(3), silence(2)])
        chunks = self.nt.plan_chunks(audio)
        self.assertEqual(len(chunks), 2)
        (a1, b1), (a2, b2) = chunks
        self.assertAlmostEqual(a1, 4.75, delta=0.2)
        self.assertAlmostEqual(b1, 9.25, delta=0.2)
        self.assertAlmostEqual(a2, 18.75, delta=0.2)

    def test_long_speech_is_split_below_limit_at_quiet_points(self):
        pieces = []
        for _ in range(12):           # 12 × (9.7 s speech + 0.3 s dip) = 120 s, no long silences
            pieces += [tone(9.7), tone(0.3, level=0.002)]
        audio = np.concatenate(pieces)
        chunks = self.nt.plan_chunks(audio, max_seconds=28)
        self.assertGreaterEqual(len(chunks), 5)
        for a, b in chunks:
            self.assertLessEqual(b - a, 28.6)
        covered = sum(b - a for a, b in chunks)
        self.assertGreater(covered, 118)          # nothing dropped
        # Cuts land on the quiet dips (every 10 s), not in the middle of "words".
        for a, _ in chunks[1:]:
            self.assertLess(abs((a + 0.25) % 10 - 9.85) if (a + 0.25) % 10 > 5 else (a + 0.25) % 10, 0.5)

    def test_all_silence_gives_no_chunks(self):
        self.assertEqual(self.nt.plan_chunks(silence(30)), [])

    def test_stale_wav_header_still_reads_all_audio(self):
        path = self.env.recordings / "x.wav"
        write_part(path, tone(3), header_bytes=0)   # header never patched (crash)
        audio = self.nt.read_wav(path)
        self.assertEqual(len(audio), 3 * SR)

    def test_repeat_and_hallucination_cleanup(self):
        text, flagged = self.nt.collapse_repeats("यह बहुत बहुत बहुत बहुत बहुत बहुत important है")
        self.assertTrue(flagged)
        self.assertEqual(text, "यह बहुत बहुत important है")
        self.assertIsNone(self.nt.clean_segment({"start": 0, "end": 1, "text": " Subtitles by the Amara.org community"}))
        kept = self.nt.clean_segment({"start": 0, "end": 1, "text": "Article 21 का मतलब है right to life"})
        self.assertEqual(kept["text"], "Article 21 का मतलब है right to life")
        self.assertNotIn("flag", kept)

    def test_words_to_segments_breaks_on_pauses(self):
        words = [{"text": "आज", "start": 0.0, "end": 0.3, "type": "word"},
                 {"text": " ", "start": 0.3, "end": 0.35, "type": "spacing"},
                 {"text": "Preamble", "start": 0.35, "end": 0.9, "type": "word"},
                 {"text": "(laughs)", "start": 1.0, "end": 1.2, "type": "audio_event"},
                 {"text": "देखेंगे", "start": 3.0, "end": 3.5, "type": "word"}]
        segs = self.nt.words_to_segments(words, "")
        self.assertEqual([s["text"] for s in segs], ["आज Preamble", "देखेंगे"])
        self.assertEqual(segs[1]["start"], 3.0)


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.env = Env()
        self.nt = self.env.nt

    def tearDown(self):
        self.env.close()

    def run_once(self, engine="dummy"):
        return self.nt.Transcriber(engine).run_once()

    def test_two_sessions_offsets_and_progressive_output(self):
        folder = self.env.make_recording(
            "2026-10-29 1000 — Polity", status="recording",
            sessions=[{"index": 1, "sourceName": "NEXT IAS"}, {"index": 2, "sourceName": "NEXT IAS"}],
            parts=[(np.concatenate([silence(1), tone(4)]), 1, True, None),
                   (np.concatenate([silence(2), tone(3)]), 2, True, None),
                   (tone(2), 2, False, None)])           # still being recorded
        self.assertEqual(self.run_once(), 2)
        state = json.loads((folder / "transcript" / "state.json").read_text())
        self.assertEqual((state["doneParts"], state["totalParts"], state["final"]), (2, 3, False))
        text = Path(state["timestampsFile"]).read_text()
        self.assertIn("Polity Lecture 05", text)
        self.assertIn("recording continued", text)
        self.assertIn("not transcribed yet", text)
        self.assertIn("[00:00:00] speech 0.8-5.0", text)
        self.assertIn("[00:00:06] speech 1.8-5.0", text)     # part 2 starts at 5 s
        self.assertIn("No audio arrived", text)              # recorder notes are carried over
        continuous = Path(state["continuousFile"]).read_text()
        self.assertNotIn("[00:", continuous)
        srt = Path(state["subtitlesFile"]).read_text()
        self.assertIn("00:00:06,750 --> 00:00:10,000", srt)

        # Recorder finishes: last part becomes complete, status finished.
        meta = json.loads((folder / "recording.json").read_text())
        meta["parts"][2]["complete"] = True
        meta["status"] = "finished"
        (folder / "recording.json").write_text(json.dumps(meta))
        self.assertEqual(self.run_once(), 1)
        state = json.loads((folder / "transcript" / "state.json").read_text())
        self.assertTrue(state["final"])
        self.assertIn("Transcript status: complete", Path(state["timestampsFile"]).read_text())
        self.assertEqual(self.run_once(), 0)                 # idempotent: nothing redone

    def test_crashed_recording_is_finished_from_what_exists(self):
        old = dt.datetime.now(dt.timezone.utc) - dt.timedelta(minutes=10)
        folder = self.env.make_recording("crashed", status="recording", updated=old,
                                         parts=[(tone(3), 1, False, 0)])
        self.assertEqual(self.run_once(), 1)
        state = json.loads((folder / "transcript" / "state.json").read_text())
        self.assertTrue(state["final"])

    def test_simultaneous_recordings_are_interleaved_and_kept_separate(self):
        a = self.env.make_recording("A", parts=[(tone(2), 1, True, None)] * 3, title="Lecture A")
        b = self.env.make_recording("B", parts=[(tone(2), 1, True, None)] * 2, title="Lecture B")
        order = [rec.title for rec, _ in self.nt.Transcriber("dummy").queue()]
        self.assertEqual(order[:4], ["Lecture A", "Lecture B", "Lecture A", "Lecture B"])
        self.run_once()
        files = sorted(p.name for p in self.env.transcripts.iterdir())
        self.assertEqual(len(files), 6)
        self.assertTrue(any(f.startswith("Lecture A") for f in files))
        self.assertTrue(any(f.startswith("Lecture B") for f in files))
        for folder in (a, b):
            self.assertTrue(json.loads((folder / "transcript" / "state.json").read_text())["final"])

    def test_corrupt_part_does_not_block_others(self):
        folder = self.env.make_recording("bad", parts=[(tone(2), 1, True, None), (tone(2), 1, True, None)])
        (folder / "audio" / "part-0001.wav").write_bytes(b"not a wav")
        self.run_once()
        state = json.loads((folder / "transcript" / "state.json").read_text())
        self.assertEqual(state["doneParts"], 2)
        self.assertIn("transcription failed for this part", Path(state["timestampsFile"]).read_text())


class FakeWhisperTests(unittest.TestCase):
    def setUp(self):
        self.env = Env()
        self.nt = self.env.nt
        self.calls = []
        fake = types.ModuleType("mlx_whisper")

        def transcribe(audio, **kw):
            self.calls.append(kw)
            n = len(self.calls)
            if kw["language"] is None and n == 1:
                return {"language": "ur", "segments": [{"start": 0, "end": 1, "text": "اردو"}]}
            return {"language": kw["language"] or "en", "segments": [
                {"start": 0.0, "end": 1.5, "text": f" संविधान का Preamble {n}", "avg_logprob": -0.3,
                 "compression_ratio": 1.2, "no_speech_prob": 0.01},
                {"start": 1.5, "end": 2.0, "text": " thanks for watching", "avg_logprob": -0.3,
                 "compression_ratio": 1.0, "no_speech_prob": 0.1},
                {"start": 2.0, "end": 2.5, "text": " hmm", "avg_logprob": -1.5,
                 "compression_ratio": 1.0, "no_speech_prob": 0.9},
                {"start": 2.5, "end": 3.0, "text": " अस्पष्ट", "avg_logprob": -1.3,
                 "compression_ratio": 1.0, "no_speech_prob": 0.1}]}

        fake.transcribe = transcribe
        sys.modules["mlx_whisper"] = fake

    def tearDown(self):
        sys.modules.pop("mlx_whisper", None)
        self.env.close()

    def test_local_engine_language_fallback_prompt_and_filters(self):
        engine = self.nt.LocalWhisper(dict(self.nt.DEFAULT_SETTINGS))
        audio = np.concatenate([silence(2), tone(4), silence(3), tone(4)])
        segs = engine.transcribe_part(audio, "Preamble, Ambedkar", lambda i, n: None)
        # First chunk: detected Urdu → re-run forced Hindi. Second chunk: auto.
        self.assertEqual([c["language"] for c in self.calls], [None, "hi", None])
        for c in self.calls:
            self.assertFalse(c["condition_on_previous_text"])
            self.assertEqual(c["task"], "transcribe")
            self.assertIn("Preamble, Ambedkar", c["initial_prompt"])
        self.assertIn("संविधान का Preamble 2", self.calls[2]["initial_prompt"])   # previous chunk as context
        self.assertNotIn("अस्पष्ट", self.calls[2]["initial_prompt"])              # unclear text not fed forward
        texts = [s["text"] for s in segs]
        self.assertNotIn("thanks for watching", texts)
        self.assertNotIn("hmm", texts)
        self.assertEqual(texts.count("अस्पष्ट"), 2)
        self.assertTrue(all(s.get("flag") == "unclear" for s in segs if s["text"] == "अस्पष्ट"))
        self.assertAlmostEqual(segs[0]["start"], 1.75, delta=0.2)   # offset by the skipped silence


class Handler(BaseHTTPRequestHandler):
    requests = []

    def do_POST(self):
        body = self.rfile.read(int(self.headers["Content-Length"]))
        Handler.requests.append((self.path, {k.lower(): v for k, v in self.headers.items()}, body))
        if self.path == "/sarvam":
            reply = {"transcript": "आज हम Preamble पढ़ेंगे", "language_code": "hi-IN"}
        else:
            reply = {"text": "आज Preamble", "words": [
                {"text": "आज", "start": 0.2, "end": 0.5, "type": "word"},
                {"text": " ", "start": 0.5, "end": 0.55, "type": "spacing"},
                {"text": "Preamble", "start": 0.55, "end": 1.1, "type": "word"}]}
        data = json.dumps(reply, ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


class CloudEngineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), Handler)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        self.env = Env()
        self.nt = self.env.nt
        Handler.requests = []

    def tearDown(self):
        self.env.close()

    def test_sarvam_sends_codemix_chunks_with_offsets(self):
        engine = self.nt.Sarvam(dict(self.nt.DEFAULT_SETTINGS, sarvamApiKey="k-123"))
        engine.url = self.base + "/sarvam"
        audio = np.concatenate([silence(3), tone(5), silence(4), tone(40)])
        segs = engine.transcribe_part(audio, "", lambda i, n: None)
        self.assertEqual(len(Handler.requests), 3)              # 5 s chunk + 40 s split in two
        path, headers, body = Handler.requests[0]
        self.assertEqual(headers["api-subscription-key"], "k-123")
        for field in (b'name="model"\r\n\r\nsaaras:v3', b'name="mode"\r\n\r\ncodemix', b'name="language_code"\r\n\r\nhi-IN', b"RIFF"):
            self.assertIn(field, body)
        self.assertEqual([round(s["start"]) for s in segs][0], 3)
        self.assertTrue(all(s["text"] == "आज हम Preamble पढ़ेंगे" for s in segs))

    def test_elevenlabs_whole_part_with_word_times(self):
        engine = self.nt.ElevenLabs(dict(self.nt.DEFAULT_SETTINGS, elevenlabsApiKey="xi"))
        engine.url = self.base + "/eleven"
        segs = engine.transcribe_part(tone(6), "", lambda i, n: None)
        _, headers, body = Handler.requests[0]
        self.assertEqual(headers["xi-api-key"], "xi")
        self.assertIn(b'name="model_id"\r\n\r\nscribe_v2', body)
        self.assertEqual(segs, [{"start": 0.2, "end": 1.1, "text": "आज Preamble"}])

    def test_missing_key_gives_clear_message(self):
        with self.assertRaises(RuntimeError) as ctx:
            self.nt.Sarvam(dict(self.nt.DEFAULT_SETTINGS))
        self.assertIn("API key", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
