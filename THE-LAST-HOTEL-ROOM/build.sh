#!/bin/sh
# THE LAST HOTEL ROOM — one command: sh build.sh   (Lemo-Opuscar, Liminal Found Footage, 1080×1920)
# Needs the Lemo library with the core, voice and music tiers, Node 20+, ffmpeg 7+ (here: $HOME/opt/ffmpeg7/bin).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}; export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
[ -x "$HOME/opt/ffmpeg7/bin/ffmpeg" ] && export PATH="$HOME/opt/ffmpeg7/bin:$PATH"
export HF_HUB_DISABLE_XET=1
PY="$LIB/.venv/bin/python"; SIZE=1080x1920; OUT=${OUT:-$HERE}
sh "$HERE/tools/fonts.sh"
cd "$LIB"
[ -f "$HERE/voices/v1.wav" ] && [ -z "$VOICE" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"      # Kokoro Hindi voices
"$PY" core/tts/asr_check.py "$HERE/lines.json" "$HERE/voices" --lang hi --model small                            # Whisper check (Hindi)
node core/render/events.mjs "$HERE" --size $SIZE
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --size $SIZE --fps 24 --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$OUT/THE-LAST-HOTEL-ROOM.mp4" 24 0
python3 -c "import json;E=json.load(open('$HERE/events.json'));json.dump([{'t0':e['t'],'t1':e['t1'],'text':e['text']} for e in E['ev'] if e['type']=='cap'],open('$HERE/out/cues.json','w'))"
"$PY" core/render/srt.py "$HERE/out/cues.json" "$OUT/THE-LAST-HOTEL-ROOM.srt"
node core/render/still.mjs "$HERE" 28.2 --size $SIZE --q nosub=1 --out "$HERE/out/still" --prefix p_
cp "$HERE/out/still/p_28.2.jpg" "$OUT/poster.jpg"
echo "done: $OUT/THE-LAST-HOTEL-ROOM.mp4"
