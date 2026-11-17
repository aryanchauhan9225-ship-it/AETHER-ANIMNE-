#!/bin/sh
# THE STARS ARE ALREADY DEAD? — complete film: sh build.sh   (Lemo-Opuscar; 1920×1080, 24 fps; core + voice + music tiers, ffmpeg 7)
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
[ -f "$HERE/voices/v13.wav" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
node core/render/events.mjs "$HERE"
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps $FPS --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/The_Stars_Are_Already_Dead_Final.mp4" $FPS 0
echo "done: $HERE/out/The_Stars_Are_Already_Dead_Final.mp4"
