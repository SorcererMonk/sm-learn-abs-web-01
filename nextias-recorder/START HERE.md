# NextIAS Recorder — start here

This records the sound of the **NEXT IAS app** on your Mac and turns it into transcripts. Lectures mix English, Hindi and Hinglish, and that's fine.

It replaces the browser extension for lectures you watch in the app. The extension still works for lectures in Arc.

## How it works (in one minute)

1. **NextIAS Recorder** (an app) records only the NEXT IAS app's sound, not your whole Mac. It saves the audio as files in **Documents › NextIAS Recordings**.
2. A **transcriber** runs quietly in the background. Every few minutes it turns the new audio into text in **Documents › NextIAS Transcripts**:
   - `… — timestamps.txt`: every line has its time.
   - `… — continuous.txt`: the same words as paragraphs, without times.
   - `… — subtitles.srt`: a subtitle file.
3. **The audio is kept.** You never need to watch a lecture again to get a better transcript. NEXT IAS limits each lecture to 2× its length in viewing time, so this matters. You can re-transcribe any saved lecture later with a better engine.

## Install (once)

1. Double-click **Install.command**. If macOS says it can't be opened, right-click it → **Open** → **Open**.
2. If it asks to install Apple's **Command Line Tools**, click **Install**. When that finishes, double-click Install.command again.
3. When it finishes, **NextIAS Recorder** opens. It is kept in the *Applications* folder inside your home folder.

## Record a lecture

1. Open the lecture in the NEXT IAS app.
2. In NextIAS Recorder, type the lecture name. You can also type a few subject words, such as *Polity, Preamble, Ambedkar*; they help with spelling.
3. Check **Record sound from** shows **NEXT IAS** (it is picked automatically when the app is open).
4. Click **● Start recording**, then press Play in the lecture at **1×**.
   - The first time, macOS asks to let NextIAS Recorder record audio. Click **Allow**.
   - Keep the lecture's volume up **inside the app**. Your Mac's own volume and headphones don't matter.
5. When the lecture ends, click **Stop & save**.

The transcript grows while you record, about 5–10 minutes behind. When it's ready, the recording shows **Open transcript**.

**If the lecture stops or the app sends you back Home:** reopen the lecture, go back to where it stopped, then click **Continue recording into this transcript** on that lecture's row. The new audio joins the same transcript.

## Recording more than one lecture at a time

- Each recording follows one **app**. All windows of the NEXT IAS app share one sound output, so **only one lecture per app** can be recorded at a time.
- You can record a second lecture from another app at the same time. For example: one in the NEXT IAS app plus one in Arc. Choose **Arc** as the source for the second recording. Two lectures playing at once in one browser mix together, though.
- Tick **Silence it on my speakers while recording** so you don't hear two lectures at once. The recording still gets the sound.
- NEXT IAS's rules may log you out when you're signed in on two "devices". Try it once and check that both keep playing.
- Recording is light on memory, but the on-Mac transcriber can only work on one piece of audio at a time. With two lectures it falls behind and catches up later, for example overnight. Nothing is lost.

## Better accuracy (Hinglish)

The free on-Mac engine (Whisper large-v3) makes mistakes when teachers switch between Hindi and English mid-sentence. For the most accurate transcripts, double-click **Choose Transcription Engine.command** and pick a cloud engine:

| Engine | Best for | Cost and privacy |
|---|---|---|
| On this Mac (default) | Free, private | Slower; most Hinglish errors |
| **Sarvam Saaras v3 "codemix"** (recommended for Hinglish) | Built for Indian code-mixed speech: Hindi in देवनागरी, English words in English | Paid per minute of audio. The audio is sent to Sarvam AI (India). Needs an API key from dashboard.sarvam.ai |
| ElevenLabs Scribe v2 | Strong on mixed Hindi-English; keeps English words in English | Paid per minute. The audio is sent to ElevenLabs. Needs an API key |

After switching, the same script can re-transcribe earlier lectures. The new files have the engine's name in brackets, so you can compare.

No engine is perfect. Names, numbers and very fast speech can still be wrong. Lines marked **(?)** are where the engine was unsure.

## If something goes wrong

| What you see | What to do |
|---|---|
| "macOS is giving the recorder pure silence" | Open **System Settings → Privacy & Security → Screen & System Audio Recording**. Under **System Audio Recording Only**, turn **NextIAS Recorder** on. Then Stop and Start again. |
| Still silent with permission on | The NEXT IAS app may be protecting its sound. Try the source **Everything playing on this Mac**. Double-click **Inspect NextIAS App.command** and send Claude the report it saves in Documents. |
| "No sound is arriving yet" | The lecture is paused, or muted inside the app. |
| Transcriber says it isn't running | Double-click **Transcribe Now.command** and leave the window open. |
| The Mac went to sleep | The recorder stops your Mac from idle-sleeping while recording, but closing the lid still stops it. Use **Continue recording**. |

## Remove

Double-click **Uninstall.command**. Your recordings and transcripts in Documents are kept.
