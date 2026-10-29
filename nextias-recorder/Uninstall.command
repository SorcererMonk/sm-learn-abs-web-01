#!/bin/bash
# Removes the app and the background transcriber. Recordings and transcripts in
# Documents are NOT deleted.
launchctl bootout "gui/$(id -u)/local.nextias.transcriber" >/dev/null 2>&1
rm -f "$HOME/Library/LaunchAgents/local.nextias.transcriber.plist"
osascript -e 'tell application "NextIAS Recorder" to quit' >/dev/null 2>&1
rm -rf "$HOME/Applications/NextIAS Recorder.app"
echo "Removed the app and background transcriber. Your recordings and transcripts in Documents are untouched."
echo "(Settings and the speech engine remain in ~/Library/Application Support/NextIASRecorder; delete that folder to remove them too.)"
read -r -p "Press Return to close." _
