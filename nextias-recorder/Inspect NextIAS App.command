#!/bin/bash
# Read-only check of the NEXT IAS app: what it is built with and whether it uses
# content protection. Changes nothing. Saves a report to Documents to send to Claude.
OUT="$HOME/Documents/NextIAS App Report.txt"
{
echo "NextIAS app report — $(date)"
echo "macOS $(sw_vers -productVersion) ($(uname -m)), $(( $(sysctl -n hw.memsize) / 1073741824 )) GB memory"
echo
APPS="$( (mdfind "kMDItemContentType == 'com.apple.application-bundle'" 2>/dev/null; ls -d /Applications/*.app "$HOME/Applications"/*.app 2>/dev/null) \
        | grep -i -E 'next ?ias' | sort -u)"
if [ -z "$APPS" ]; then echo "No app with 'Next IAS' in its name was found."; fi
echo "$APPS" | while IFS= read -r app; do
  [ -z "$app" ] && continue
  echo "=== $app"
  plist="$app/Contents/Info.plist"
  [ -f "$plist" ] || plist="$(find "$app" -maxdepth 3 -name Info.plist | head -1)"
  for k in CFBundleIdentifier CFBundleShortVersionString CFBundleExecutable LSMinimumSystemVersion; do
    printf "%s: %s\n" "$k" "$(/usr/libexec/PlistBuddy -c "Print :$k" "$plist" 2>/dev/null)"
  done
  [ -d "$app/Wrapper" ] && echo "Type: iPhone/iPad app running on the Mac (Wrapper folder present)"
  [ -d "$app/WrappedBundle" ] && echo "Type: iPhone/iPad app running on the Mac (WrappedBundle present)"
  ls "$app/Contents/Frameworks" 2>/dev/null | sed 's/^/  framework: /' | head -40
  find "$app" -maxdepth 6 -name '*.framework' 2>/dev/null | sed 's|.*/||' | sort -u | sed 's/^/  bundled: /' | head -60
  [ -d "$app/Contents/Frameworks/Electron Framework.framework" ] && echo "Built with: Electron (a web page inside an app)"
  find "$app" -maxdepth 6 -name 'Flutter.framework' | grep -q . && echo "Built with: Flutter"
  echo "-- signing / entitlements"
  codesign -dv "$app" 2>&1 | grep -E 'Identifier|TeamIdentifier|Authority' | head -5
  codesign -d --entitlements - --xml "$app" 2>/dev/null | plutil -convert xml1 -o - - 2>/dev/null | grep -E '<key>' | sed 's/^/  /' | head -30
  echo "-- protection-related words inside the app (counts only)"
  bin="$(find "$app" -type f -perm -111 -size +1M 2>/dev/null | head -5)"
  for word in FairPlay AVContentKeySession contentKeySession isCaptured sharingType setContentProtection \
              Widevine VdoCipher vdocipher Bitmovin THEOplayer ExoPlayer AVPlayer WKWebView ScreenCapture \
              screenCaptureDetected UIScreenCapturedDidChange; do
    n=0
    for b in $bin; do c=$(strings -a "$b" 2>/dev/null | grep -c -i "$word"); n=$((n + c)); done
    [ "$n" -gt 0 ] && echo "  $word: $n"
  done
done
echo
echo "=== Running processes that look like the NEXT IAS app"
ps -axo pid,comm | grep -i -E 'next ?ias' | grep -v grep
} > "$OUT" 2>&1
cat "$OUT"
echo
echo "Saved to: $OUT   — send this file (or paste its text) to Claude."
read -r -p "Press Return to close." _
