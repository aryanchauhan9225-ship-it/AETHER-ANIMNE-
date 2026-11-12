# THE LAST HOTEL ROOM — production report

## Deliverables (this folder)
| File | What |
|---|---|
| `THE-LAST-HOTEL-ROOM.mp4` | Master: 1080×1920 (9:16), 24 fps, 44.0 s (1,056 frames), H.264 + AAC 256k, −14.5 LUFS, true peak −1.1 dB, 158 MB |
| `THE-LAST-HOTEL-ROOM_reels.mp4` | Same film re-encoded for upload (CRF 23, grain-tuned), 70 MB |
| `THE-LAST-HOTEL-ROOM.srt` | Captions (9 cues) |
| `poster.jpg` | Poster frame (the table for two, 28.2 s) |
| `TREATMENT.md` · `SHOT-LIST.md` · `SCRIPT-HI.md` · `ASSETS.md` · `SOUND-DESIGN.md` · `CREDITS` | Planning and reference documents |
| `build.sh` + source (`main.js`, `world.js`, `tex.js`, `story.js`, `subs.js`, `vhs.js`, `osd.js`, `mix.py`, `lines.json`) | One-command rebuild |

## How it was made (Lemo-Opuscar, actual supported methods)
- Style **Liminal Found Footage** (`backrooms`), followed per AGENTS.md: treatment first → demo engine studied →
  look proven with stills → production → review → one fix round. The original library was not modified; engine files
  were copied into this folder (MIT).
- Picture: three.js 3D scene (540×960) → Lemo `core/three/post.js` (GTAO, physical depth of field driving the
  autofocus hunts, bloom) → the style's VHS camcorder shader (adapted to fill a 9:16 frame) → 1080×1920; captions and
  title on an overlay. Rendered frame by frame by Lemo `core/render/video.mjs` (headless Chromium, 4 workers).
- Voice: Kokoro Hindi (`hm_omega`, `hm_psi`) through Lemo `core/tts/tts.py`; checked by Lemo `asr_check.py --lang hi`
  (0 mismatches) and again on the final mix.
- Sound: Lemo `core/audio/sfx.py` + `sampler.py` (CC0 strings/harp for the in-world waltz), all timed from the page's
  `events.json`; mastered by Lemo `core/render/mux.sh` (two-pass loudnorm).

## Decisions where the brief and the style met
| Brief | Style rule | What we did |
|---|---|---|
| 9:16 vertical | 4:3 inside 16:9 | Frame size changed to 1080×1920 (a size change; everything else in STYLE.md kept) |
| Suspense music | No score | Rising low drone + an in-world waltz on a radio that dies with the phone + 1.35 s of digital silence |
| Consistent guard, his reaction | First-person; primitive figures read as toys | The guard *is* the camera: one voice, one breath, one torch, one gait. His reaction is the held breath, the tremor and the turn |
| Exterior, title card | Interiors; title at the start | The camcorder films the façade in the rain; the title uses the camcorder's own title generator after REC off |

## Review and fix round
- Checks run on the final file: frame count 1,056 ✓, duration 44.000 s ✓, 1080×1920 ✓, audio present ✓,
  loudness −14.5 LUFS ✓, black frames only where intended (tape roll-in 0–0.42 s, title card on black) ✓,
  the voice transcribes correctly from the final mix ✓, no LemoLab sign-off in the film ✓.
- Fixes found by the review and applied: exterior too dark (camera moved closer, façade washed with cold city light,
  tilt-up before the window lights); lobby too dark (camera closer, torch power); rain streaks wrapping into long lines
  (fixed per streak); a torch glare bar on the marble desk (matte desk top; lobby frames 173–326 re-rendered with a
  `?from/to` span and spliced, then re-mastered).

## Honest limitations
- **Not photorealistic.** No image or video generator was available (Codex CLI not installed by the user's decision),
  so this is real-time 3D under a 1990s camcorder look. The VHS treatment, low render resolution and darkness hide CG
  cleanliness, which is the style's intent, but it is not live-action-photoreal.
- **The guard is never seen.** Showing him would have meant a code-built figure that reads as a toy.
- **The voices are synthetic** (Kokoro Hindi). They are intelligible (verified by Whisper), but how natural and
  emotional they sound is a judgement for a human listener. Human recordings can replace them: drop `g1.wav`,
  `g2.wav`, `v1.wav` into `voices/` and run `sh build.sh`.
- Render time on this CPU-only machine: ~34 minutes for the full film (software WebGL), plus ~5 minutes for the fix.

## Rebuild
`sh build.sh` (needs the Lemo library with core/voice/music tiers and ffmpeg 7+; set `LIB` if the library is elsewhere).
