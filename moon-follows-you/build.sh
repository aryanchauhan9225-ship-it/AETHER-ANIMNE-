#!/bin/sh
# WHY DOES THE MOON FOLLOW YOU? — vertical reel, 1080×1920, 24 fps: sh build.sh   (Lemo-Opuscar core + voice + music tiers, three.js 0.170, ffmpeg 7)
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB HF_HUB_DISABLE_XET=1
[ -x "$HOME/opt/ffmpeg7/bin/ffmpeg" ] && export PATH="$HOME/opt/ffmpeg7/bin:$PATH"
PY="$LIB/.venv/bin/python"; FPS=24
mkdir -p "$HERE/out" "$HERE/fonts"
GF=https://raw.githubusercontent.com/google/fonts/main/ofl
[ -s "$HERE/fonts/CormorantGaramond.ttf" ] || curl -fsSL -o "$HERE/fonts/CormorantGaramond.ttf" "$GF/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf"
[ -s "$HERE/fonts/CormorantGaramond-Italic.ttf" ] || curl -fsSL -o "$HERE/fonts/CormorantGaramond-Italic.ttf" "$GF/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf"
[ -s "$HERE/fonts/NotoSerifDevanagari.ttf" ] || curl -fsSL -o "$HERE/fonts/NotoSerifDevanagari.ttf" "$GF/notoserifdevanagari/NotoSerifDevanagari%5Bwdth%2Cwght%5D.ttf"
cd "$LIB"
[ -f "$HERE/voices/m10.wav" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
node core/render/events.mjs "$HERE" --size 1080x1920
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps $FPS --workers ${WORKERS:-4} --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/Why_Does_The_Moon_Follow_You_Final.mp4" $FPS 0
echo "done: $HERE/out/Why_Does_The_Moon_Follow_You_Final.mp4"
