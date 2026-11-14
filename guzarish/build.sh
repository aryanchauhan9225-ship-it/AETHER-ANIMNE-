#!/bin/sh
# GUZARISH — Satinder Sartaaj, 02:10–02:59 — animated music video (Lemo-Opuscar · Gilded Illumination, 1920×1080, 30 fps)
#   sh build.sh /path/to/song-excerpt.mp3
# The soundtrack is the supplied excerpt itself, muxed untouched (no loudness processing, no added sound).
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
[ -x "$HOME/opt/ffmpeg7/bin/ffmpeg" ] && export PATH="$HOME/opt/ffmpeg7/bin:$PATH"
SRC=${1:-"$HERE/audio/source.mp3"}; FPS=30; FRAMES=1471
mkdir -p "$HERE/out" "$HERE/audio" "$HERE/fonts"
GF=https://raw.githubusercontent.com/google/fonts/main/ofl/imfellenglish
[ -s "$HERE/fonts/IMFellEnglish.ttf" ] || curl -sSL -o "$HERE/fonts/IMFellEnglish.ttf" "$GF/IMFeENrm28P.ttf"
[ -s "$HERE/fonts/IMFellEnglish-Italic.ttf" ] || curl -sSL -o "$HERE/fonts/IMFellEnglish-Italic.ttf" "$GF/IMFeENit28P.ttf"
ffmpeg -v error -y -i "$SRC" -ar 48000 "$HERE/audio/seg.wav"
cd "$LIB"
node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --fps $FPS --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
# pad the 49.032 s excerpt by a millisecond of silence to the 1471-frame picture; AAC 320k; nothing else touches the audio
ffmpeg -v error -y -i "$HERE/out/video.mp4" -i "$HERE/audio/seg.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -af apad -t $(echo "$FRAMES/$FPS" | bc -l) -movflags +faststart "$HERE/guzarish-music-video.mp4"
echo "done: $HERE/guzarish-music-video.mp4"
