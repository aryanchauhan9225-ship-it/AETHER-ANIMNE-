#!/bin/sh
# One command: "The Unscheduled Train" (10 s Lemo-Opuscar evaluation, 80s Cel Anime)
#   sh build.sh       → out/video.mp4, out/mix.wav, the-unscheduled-train.mp4, poster.jpg
# Needs: Lemo library (setup.sh, core tier), Node 20+, ffmpeg 7+ on PATH (here: $HOME/opt/ffmpeg7/bin).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
[ -x "$HOME/opt/ffmpeg7/bin/ffmpeg" ] && export PATH="$HOME/opt/ffmpeg7/bin:$PATH"
cd "$LIB"
node core/render/events.mjs "$HERE"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/the-unscheduled-train.mp4" 24 2
node core/render/still.mjs "$HERE" 7.2 --out "$HERE/out/still" --prefix p_
cp "$HERE/out/still/p_7.2.jpg" "$HERE/poster.jpg"
echo "done: $HERE/the-unscheduled-train.mp4"
