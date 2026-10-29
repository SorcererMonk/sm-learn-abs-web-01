#!/bin/bash
# Choose how lectures are transcribed, and optionally re-transcribe one lecture.
SUPPORT="$HOME/Library/Application Support/NextIASRecorder"
PY="$(cat "$SUPPORT/python-path.txt" 2>/dev/null)"
if [ -z "$PY" ] || [ ! -x "$PY" ]; then echo "Please run Install.command first."; read -r -p "Press Return to close." _; exit 1; fi

cat <<'EOF'
How should lectures be transcribed?

  1  On this Mac — Whisper large-v3 (free, private, slower; makes more mistakes with Hinglish)
  2  Sarvam AI — Saaras v3 “codemix” (cloud, paid per minute; built for Hindi-English mixing:
     Hindi in Devanagari, English words in English). Needs an API key from dashboard.sarvam.ai
  3  ElevenLabs — Scribe v2 (cloud, paid per minute; keeps English words in English inside Hindi).
     Needs an API key from elevenlabs.io → Developers → API keys

Cloud engines send the lecture audio to that company for transcription.
EOF
read -r -p "Type 1, 2 or 3 and press Return: " choice
engine=""; key=""
case "$choice" in
  1) engine="local" ;;
  2) engine="sarvam"; read -r -s -p "Paste your Sarvam API key (it will not be shown) and press Return: " key; echo ;;
  3) engine="elevenlabs"; read -r -s -p "Paste your ElevenLabs API key (it will not be shown) and press Return: " key; echo ;;
  *) echo "Nothing changed."; read -r -p "Press Return to close." _; exit 0 ;;
esac

"$PY" - "$SUPPORT/settings.json" "$engine" "$key" <<'EOF'
import json, os, sys
path, engine, key = sys.argv[1:4]
try:
    settings = json.load(open(path))
except Exception:
    settings = {}
settings["engine"] = engine
if key:
    settings["sarvamApiKey" if engine == "sarvam" else "elevenlabsApiKey"] = key.strip()
json.dump(settings, open(path, "w"), indent=2)
os.chmod(path, 0o600)
EOF
launchctl kickstart -k "gui/$(id -u)/local.nextias.transcriber" >/dev/null 2>&1
echo "Saved. New audio will now be transcribed with this engine."
echo
echo "To transcribe an EARLIER lecture again with this engine, type part of its name"
read -r -p "(or just press Return to skip): " name
if [ -n "$name" ]; then
  launchctl bootout "gui/$(id -u)/local.nextias.transcriber" >/dev/null 2>&1
  "$PY" "$SUPPORT/nextias_transcribe.py" redo "$name" --engine "$engine"
  launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/local.nextias.transcriber.plist" >/dev/null 2>&1
  echo "The new transcript has the engine name in its file name, so the earlier one is kept for comparison."
fi
read -r -p "Press Return to close." _
