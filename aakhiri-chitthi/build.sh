#!/bin/sh
# आखिरी चिट्ठी / The Last Letter — complete film: sh build.sh   (Lemo-Opuscar · Watercolor Brush, 1920×1080, 60 fps)
# Needs the library's core + voice + music tiers (Kokoro, VSCO 2 CE, Salamander piano) and ffmpeg 7.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB HF_HUB_DISABLE_XET=1
[ -x "$HOME/opt/ffmpeg7/bin/ffmpeg" ] && export PATH="$HOME/opt/ffmpeg7/bin:$PATH"
PY="$LIB/.venv/bin/python"; FPS=60
mkdir -p "$HERE/out" "$HERE/fonts"
[ -f "$HERE/paper.jpg" ] || (cd "$HERE" && "$PY" paper.py)
GF=https://raw.githubusercontent.com/google/fonts/main/ofl
[ -s "$HERE/fonts/NotoSerifDevanagari.ttf" ] || curl -fsSL -o "$HERE/fonts/NotoSerifDevanagari.ttf" "$GF/notoserifdevanagari/NotoSerifDevanagari%5Bwdth%2Cwght%5D.ttf"
[ -s "$HERE/fonts/Kalam-Regular.ttf" ] || curl -fsSL -o "$HERE/fonts/Kalam-Regular.ttf" "$GF/kalam/Kalam-Regular.ttf"
[ -s "$HERE/fonts/Kalam-Bold.ttf" ] || curl -fsSL -o "$HERE/fonts/Kalam-Bold.ttf" "$GF/kalam/Kalam-Bold.ttf"
cd "$LIB"
[ -f "$HERE/voices/f3.wav" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
"$PY" core/tts/asr_check.py "$HERE/lines.json" "$HERE/voices" --lang hi --model small || true
node core/render/events.mjs "$HERE"
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps $FPS --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/Aakhiri_Chitthi_Final.mp4" $FPS 0
echo "done: $HERE/out/Aakhiri_Chitthi_Final.mp4"
