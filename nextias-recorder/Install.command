#!/bin/bash
# Installs NextIAS Recorder (the app) and the background transcriber.
# Safe to run again: it rebuilds the app and restarts the transcriber, keeping
# all recordings, transcripts and settings.
set -u
cd "$(dirname "$0")"
PKG="$(pwd)"
SUPPORT="$HOME/Library/Application Support/NextIASRecorder"
APP="$HOME/Applications/NextIAS Recorder.app"
AGENT_LABEL="local.nextias.transcriber"
AGENT="$HOME/Library/LaunchAgents/$AGENT_LABEL.plist"
OLD_VENV_PY="$HOME/Library/Application Support/NextIASCaptions/.venv/bin/python"

say() { printf "\n\033[1m%s\033[0m\n" "$*"; }
fail() { printf "\n\033[31mProblem: %s\033[0m\n" "$*"; echo; read -r -p "Press Return to close this window." _; exit 1; }

say "NextIAS Recorder — installation"

# 1. macOS version and chip
OS="$(sw_vers -productVersion)"
MAJOR="${OS%%.*}"; REST="${OS#*.}"; MINOR="${REST%%.*}"
if [ "$MAJOR" -lt 14 ] || { [ "$MAJOR" -eq 14 ] && [ "${MINOR:-0}" -lt 4 ]; }; then
  fail "This Mac has macOS $OS. Recording another app's sound needs macOS 14.4 (Sonoma) or newer. Update in System Settings → General → Software Update, then run this again."
fi
[ "$(uname -m)" = "arm64" ] || echo "Note: this is not an Apple-silicon Mac. Recording works, but the free on-Mac transcriber needs Apple silicon; use a cloud engine instead."

# 2. Apple's command line tools (provide the Swift compiler)
if ! xcode-select -p >/dev/null 2>&1 || ! command -v swiftc >/dev/null 2>&1; then
  say "Apple's free Command Line Tools are needed once to build the app."
  xcode-select --install >/dev/null 2>&1
  fail "A window has opened asking to install the Command Line Tools. Click Install, wait for it to finish (5–15 minutes), then double-click Install.command again."
fi

# 3. Build the app
say "Building the app…"
BUILD="$PKG/build/NextIAS Recorder.app"
rm -rf "$PKG/build"
mkdir -p "$BUILD/Contents/MacOS" "$BUILD/Contents/Resources"
cp "$PKG/recorder/Info.plist" "$BUILD/Contents/Info.plist"
if ! swiftc -O -parse-as-library -swift-version 5 -target "$(uname -m)-apple-macos14.4" \
     "$PKG/recorder/NextIASRecorder.swift" -o "$BUILD/Contents/MacOS/NextIAS Recorder" 2> "$PKG/build-errors.txt"; then
  cat "$PKG/build-errors.txt"
  fail "The app did not build. The error is shown above and saved in build-errors.txt — send that file to Claude."
fi
rm -f "$PKG/build-errors.txt"
codesign --force --sign - "$BUILD" >/dev/null 2>&1 || true
mkdir -p "$HOME/Applications"
if pgrep -f "NextIAS Recorder.app/Contents/MacOS" >/dev/null; then
  osascript -e 'tell application "NextIAS Recorder" to quit' >/dev/null 2>&1
  sleep 2
fi
rm -rf "$APP"
cp -R "$BUILD" "$APP"
echo "App installed: $APP"

# 4. Python for the transcriber
say "Setting up the transcriber…"
mkdir -p "$SUPPORT/logs"
cp "$PKG/transcriber/nextias_transcribe.py" "$SUPPORT/nextias_transcribe.py"
PY=""
if [ -x "$OLD_VENV_PY" ] && "$OLD_VENV_PY" -c "import mlx_whisper, numpy" >/dev/null 2>&1; then
  PY="$OLD_VENV_PY"
  echo "Re-using the speech engine already installed for the browser extension (nothing in it is changed)."
else
  if [ ! -x "$SUPPORT/venv/bin/python" ]; then
    python3 -m venv "$SUPPORT/venv" || fail "Could not create a Python environment."
  fi
  "$SUPPORT/venv/bin/python" -m pip install --quiet --upgrade pip >/dev/null 2>&1
  "$SUPPORT/venv/bin/python" -m pip install --quiet "mlx-whisper" numpy \
    || fail "Could not install the speech engine (needs internet). Check the connection and run Install.command again."
  PY="$SUPPORT/venv/bin/python"
fi
echo "$PY" > "$SUPPORT/python-path.txt"

# 5. Settings (kept if they already exist). Re-use an already downloaded model if found.
if [ ! -f "$SUPPORT/settings.json" ]; then
  CACHE=""
  for dir in "$HOME/Library/Application Support/NextIASCaptions" "$HOME/.cache/huggingface"; do
    found="$(find "$dir" -maxdepth 6 -type d -name 'models--mlx-community--whisper-large-v3-mlx-8bit' 2>/dev/null | head -1)"
    if [ -n "$found" ]; then CACHE="$(dirname "$found")"; break; fi
  done
  "$PY" - "$SUPPORT/settings.json" "$CACHE" <<'EOF'
import json, sys
path, cache = sys.argv[1], sys.argv[2]
json.dump({"engine": "local", "localModel": "mlx-community/whisper-large-v3-mlx-8bit", "language": "auto",
           "sarvamApiKey": "", "sarvamMode": "codemix", "elevenlabsApiKey": "", "hfHubCache": cache},
          open(path, "w"), indent=2)
EOF
  chmod 600 "$SUPPORT/settings.json"
  [ -n "$CACHE" ] && echo "Found the already-downloaded Whisper model; it will be re-used."
fi

# 6. Background transcriber (starts at login, restarts if it stops)
cat > "$AGENT" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$AGENT_LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$PY</string>
    <string>$SUPPORT/nextias_transcribe.py</string>
    <string>watch</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ProcessType</key><string>Background</string>
  <key>Nice</key><integer>5</integer>
  <key>StandardOutPath</key><string>$SUPPORT/logs/transcriber.log</string>
  <key>StandardErrorPath</key><string>$SUPPORT/logs/transcriber.log</string>
</dict>
</plist>
EOF
launchctl bootout "gui/$(id -u)/$AGENT_LABEL" >/dev/null 2>&1
sleep 1
launchctl bootstrap "gui/$(id -u)" "$AGENT" >/dev/null 2>&1 || { sleep 2; launchctl bootstrap "gui/$(id -u)" "$AGENT" >/dev/null 2>&1; }
if launchctl print "gui/$(id -u)/$AGENT_LABEL" >/dev/null 2>&1; then
  echo "Background transcriber is running."
else
  echo "The background transcriber could not be started automatically. You can still use “Transcribe Now.command”."
fi

mkdir -p "$HOME/Documents/NextIAS Recordings" "$HOME/Documents/NextIAS Transcripts"

say "Done."
cat <<'EOF'
• The app is in your Applications folder (inside your home folder) as “NextIAS Recorder”. It opens now.
• The first time you press Start recording, macOS asks to allow it to record audio — click Allow.
  macOS may also ask whether NextIAS Recorder and “python” may access your Documents folder — click Allow.
• Recordings: Documents › NextIAS Recordings     Transcripts: Documents › NextIAS Transcripts
EOF
if launchctl print "gui/$(id -u)/com.nextias.local-captions" >/dev/null 2>&1 && [ "$(sysctl -n hw.memsize)" -le 8589934592 ]; then
  cat <<'EOF'

Memory tip for this 8 GB Mac: the older browser-extension engine is also running. If you are not using the
browser extension, double-click “Disable Automatic Engine.command” in the old NextIAS Lecture Captions folder,
so the two speech engines do not compete for memory.
EOF
fi
open "$APP"
echo
read -r -p "Press Return to close this window." _
