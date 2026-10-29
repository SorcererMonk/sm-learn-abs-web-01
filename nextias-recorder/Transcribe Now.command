#!/bin/bash
# Transcribes all waiting audio now, in this window (useful if the background
# transcriber is not running). Close the window to stop; nothing is lost.
SUPPORT="$HOME/Library/Application Support/NextIASRecorder"
PY="$(cat "$SUPPORT/python-path.txt" 2>/dev/null)"
if [ -z "$PY" ] || [ ! -x "$PY" ]; then
  echo "Please run Install.command first."
  read -r -p "Press Return to close." _
  exit 1
fi
"$PY" "$SUPPORT/nextias_transcribe.py" status
echo
"$PY" "$SUPPORT/nextias_transcribe.py" once
echo
read -r -p "Press Return to close." _
