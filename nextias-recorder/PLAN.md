# NextIAS lectures moving to the Mac app — plan and design

*29 October 2026*

## Problem

The browser extension captured a tab's audio (`tabCapture`). The NEXT IAS lectures are moving to a native Mac app, which a browser extension cannot see. We still need raw English/Hindi/Hinglish transcripts, ideally for more than one lecture at a time.

## What is known about the app

- The App Store listing for NEXT IAS (id1527559034, "Made Easy Education", v8.21, 18 Oct 2026) is an iPhone/iPad app. Apple-silicon Macs can run such apps, so the "Mac app" is probably this iPad app running on macOS. **Not yet confirmed.** `Inspect NextIAS App.command` checks this and reports content-protection libraries.
- NEXT IAS rules: recorded lectures can be watched for at most **2× their length**; there is a two-device limit, and one login at a time. Re-watching to re-transcribe uses up that quota, so the design **keeps the audio permanently** and transcribes from the saved audio.

## Approach

**Capture: Core Audio process taps** (`AudioHardwareCreateProcessTap`, macOS 14.2+; we require 14.4).
- This records the output of one app's processes only. No virtual audio driver (BlackHole) is installed, and no system settings change apart from a one-time permission prompt.
- Helper processes inside the app bundle are grouped with it (iPad-app `Wrapper/` and Electron helpers). WebKit's shared audio process is offered as its own source.
- The tap is rebuilt automatically if the app restarts, the output device changes (headphones) or audio stops arriving. Short gaps are filled with silence, so transcript times stay equal to "time since Start".
- **Risk: content protection.** If the app plays FairPlay-protected streams, macOS may hand the tap silence. The recorder detects this: Core Audio reports the app playing, but every sample is zero. It then tells the user to check the permission or to try the "Everything playing on this Mac" source. If both are silent, the audio is protected. Then the options are the web player (if NEXT IAS keeps it) with the existing extension, or asking NEXT IAS for transcripts/subtitles. Breaking DRM is deliberately out of scope.

**Storage.** 16 kHz mono 16-bit WAV, in parts of about 5 minutes, cut at a quiet point. That is about 115 MB per hour. The WAV header is refreshed every 5 s, so a crash loses at most a few seconds. `recording.json` describes the sessions, parts and notes. "Continue recording" adds a new session to the same lecture.

**Transcription is separate from recording.** A background LaunchAgent watches the recordings folder. Each part it finishes updates three outputs (timestamped, continuous and SRT). Recording costs almost no CPU, so several lectures can be captured at once while one transcription queue catches up. Lectures recorded at the same time are processed in turn (round-robin), so every transcript grows.

**Engines.** Outputs from different engines sit side by side and never overwrite each other.
- `local`: mlx-whisper large-v3 8-bit, the same model already installed for the extension (reused if found). Silence is skipped with energy detection. Chunks are at most 28 s and cut at quiet points. A mixed-script style prompt plus subject words plus the previous chunk's text guide wording. `condition_on_previous_text=False` prevents loops. Hindi that Whisper misdetects as Urdu is re-run as Hindi. Known hallucination lines ("Subtitles by Amara.org…") are dropped, repeats are collapsed, and low-confidence lines are marked `(?)`.
- `sarvam`: Saaras v3 `codemix` through the synchronous REST API, with chunks of at most 28 s and 3 requests in parallel. It writes Hindi in Devanagari and English in Latin script.
- `elevenlabs`: Scribe v2. Each part is sent whole, and word timings are grouped into lines.
- Cloud engines are **opt-in only**, because the audio leaves the Mac and costs money. The earlier handoff recorded that cloud use was never authorised by default.

## Accuracy, honestly

Nothing gives a "perfect" transcript of code-switched lectures. Public 2026 benchmarks put the best Hindi systems (Sarvam, Gemini 3 Pro, ElevenLabs Scribe v2) at roughly 5–15 % word error. Whisper large-v3 does noticeably worse on Hinglish. Keeping lossless audio lets every lecture be re-run with whichever engine proves best on *these* teachers.

Recommended next step: record one lecture, transcribe 10 minutes with all three engines and compare them by ear.

## Multiple simultaneous lectures

- One recording per **app**, because every window of one app shares one sound output. Two lectures in the same app cannot be separated.
- In parallel you can run: the NEXT IAS app plus a browser (one lecture per browser), or several different browsers. Playback rules on NEXT IAS's side (one login at a time) may still stop this; it has to be tested.
- On the 8 GB Mac: recording two streams is fine. Transcribing them happens one after another (the backlog clears later).

## Verification status (29 Oct 2026)

- Transcriber: 14 automated tests pass. They cover chunking, crash-damaged WAV, two sessions, simultaneous recordings, a corrupt part, Whisper decision logic with a fake model, and the Sarvam/ElevenLabs request format against a local fake server.
- **Not yet run on a Mac.** The Swift recorder could not be compiled in the cloud environment, which is Linux with no Apple SDK. The first `Install.command` run is the first compile. Any compiler error is saved to `build-errors.txt`.
- The real Whisper model, the real Sarvam/ElevenLabs services, and the NEXT IAS app's audio have not been tested yet.
