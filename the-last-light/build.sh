#!/bin/sh
# आखिरी रोशनी — 10 s test: sh build.sh   (Lemo-Opuscar Watercolor Brush, 1920×1080, 60 fps; core + voice + music tiers, ffmpeg 7+)
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB HF_HUB_DISABLE_XET=1
[ -x "$HOME/opt/ffmpeg7/bin/ffmpeg" ] && export PATH="$HOME/opt/ffmpeg7/bin:$PATH"
PY="$LIB/.venv/bin/python"; FPS=60
[ -f "$HERE/paper.jpg" ] || (cd "$HERE" && "$PY" paper.py)
mkdir -p "$HERE/fonts"; [ -s "$HERE/fonts/NotoSerifDevanagari.ttf" ] || curl -fsSL -o "$HERE/fonts/NotoSerifDevanagari.ttf" \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifdevanagari/NotoSerifDevanagari%5Bwdth%2Cwght%5D.ttf"
cd "$LIB"
[ -f "$HERE/voices/n1.wav" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
node core/render/events.mjs "$HERE"
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps $FPS --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/the-last-light-test-10s.mp4" $FPS 0
echo "done: $HERE/the-last-light-test-10s.mp4"
