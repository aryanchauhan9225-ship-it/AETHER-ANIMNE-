# AETHER Ep01 — Production Checklist

Tick items as they are completed and commit the file. Nothing below has been
started unless it is ticked.

Tools: **Krita** (drawing, painting, frame-by-frame) · **OpenToonz**
(optional: timing sheet, ink & paint) · **Remotion** (compositing; not yet
installed, needs gate G3) · **FFmpeg** (audio mix, encode) · Audacity
(voice clean-up) · Rhubarb (lip-sync draft; not yet installed, gate G3).

---

## Gate G2 — Script lock (current stage)

- [x] Screenplay written: `story/ep01/script.hi.md`
- [x] Shot list with exact timing (1,200 frames): `story/ep01/shotlist.yaml`
- [x] Timeline: `story/ep01/timeline.md`
- [x] Storyboard & direction brief: `story/ep01/storyboard.md`
- [x] Character specs: `art/characters/aether/design-spec.md`, `art/characters/elaria/design-spec.md`
- [x] Environment spec: `art/backgrounds/ep01-environments.md`
- [x] Voice & lip-sync guide: `story/ep01/voice-lipsync.md`
- [x] Sound timeline: `story/ep01/sound-timeline.md`
- [ ] **Director approves script and shot list** (Hindi read-through out loud with a stopwatch)
- [ ] Hindi dialogue reviewed by a native speaker for naturalness
- [ ] Open decisions resolved: final font for the title, voice cast, composer

---

## Gate G3 — Tool setup (needs approval before any install)

- [ ] Approve and install Remotion in `studio/` (Node packages)
- [ ] Approve and install Rhubarb Lip Sync
- [ ] Confirm FFmpeg (system 6.1.1 is enough for our two-pass loudnorm and mux pipeline)
- [ ] Remotion: composition `Ep01` set to 1920×1080, 24 fps, 1,200 frames
- [ ] Remotion: loader reads `story/ep01/shotlist.yaml`. Validation fails the build if shots overlap, leave gaps, or don't add up to 1,200 frames
- [ ] Remotion: placeholder render of the shot list (coloured cards with shot IDs and timecodes only, no artwork) to prove timing

---

## Gate G4 — Design pack

### Krita setup (every artist)
- [ ] Canvas template: 1920×1080, 300 dpi metadata, sRGB, 8-bit RGBA
- [ ] Animation settings: **24 fps**, onion skin 2 back / 1 forward
- [ ] Shared brush bundle installed (`art/templates/aether-brushes.bundle`, to be created)
- [ ] Line weights per framing set as presets (style guide §2.3)
- [ ] **Fill tool: anti-aliasing OFF, "fill to lines", grow ~1 px.** Lines anti-aliased, fills hard-edged (style guide §2.5)
- [ ] Palettes loaded: `art/palettes/aether.gpl`, `elaria.gpl`, plus lighting variants

### Character sheets
- [ ] Aether: all sheets in `art/characters/aether/design-spec.md` §4
- [ ] Elaria: all sheets in `art/characters/elaria/design-spec.md` §8
- [ ] Height lineup (Aether + Elaria)
- [ ] Colour models (`.gpl`) for every lighting variant
- [ ] Animation supervisor signs off every sheet

### Background designs
- [ ] Concept paintings: BG01 cosmos, BG02 city rain, BG03 Nexus, BG04 birth room
- [ ] Nexus design language approved (islands, arches, platform)
- [ ] Original rune glyphs and magic-circle design approved

---

## Gate G5 — Animatic & timing lock

- [ ] Storyboard panels drawn in Krita → `story/ep01/storyboard/shXXX_pNN.png`
- [ ] Scratch voice recorded for all 13 lines → `audio/ep01/scratch/`
- [ ] Animatic assembled in Remotion (panels on the shot-list timing + scratch voice + temp music)
- [ ] Animatic reviewed: pacing, clarity, emotional beats, **no slideshow feel** (every shot has 2 of: character / camera / atmosphere moving)
- [ ] Shot durations adjusted (±6 frames max per shot); `shotlist.yaml` updated
- [ ] **Timing locked.** No duration changes after this point without director approval

---

## Production — voice

- [ ] Cast Aether and Elaria. Written consent on file
- [ ] Record all lines (spec: `voice-lipsync.md` §2), 3+ takes each, plus breaths and efforts
- [ ] Clean in Audacity (high-pass 80 Hz, light noise reduction, trim)
- [ ] Select takes → `audio/ep01/dialogue/`
- [ ] Rhubarb draft → convert to `M A E O T F X` → **manual correction** → `audio/ep01/lipsync/*.json`
- [ ] Lip-sync reviewed at real speed and at the closures (प फ ब भ म)

---

## Production — animation (per shot)

Use this block for every shot (`sh010` … `sh170`):

- [ ] **Layout** in Krita: framing, background section, character positions, camera path → `animation/ep01/shXXX/layout/`
- [ ] **Key poses** (rough) → `rough/`
- [ ] **Animation supervisor check**: off-model keys corrected by drawing over (style guide §7)
- [ ] **In-betweens** (Level A on 2s, Level B on 3s)
- [ ] *(Optional, OpenToonz)* Timing sheet entered and timing checked against the line-test
- [ ] **Line test** played at 24 fps and approved
- [ ] **Clean-up** (line weights per framing)
- [ ] **Colour**: hard-edged fills from the palette only
- [ ] Palette check (script `palette_check`, to be built)
- [ ] Export `final/shXXX_<char>_<part>_####.png` (RGBA, numbered from 0001)

### OpenToonz notes (if used)
- [ ] Scene settings: 24 fps, camera 1920×1080
- [ ] Level names match the pipeline naming (`shXXX_<char>_<part>`)
- [ ] Ink & Paint uses the same palette (`.tpl` converted from `.gpl`). Fills not anti-aliased
- [ ] Render PNG sequences (RGBA). Scene files (`.tnz`) committed. `backups/` and `sceneIcons/` are git-ignored

## Production — backgrounds
- [ ] Every plate in `art/backgrounds/ep01-environments.md` painted, with layers and a glow layer
- [ ] Exported `art/backgrounds/<set>/<set>_<plate>_<layer>.png`

## Production — FX & compositing (Remotion)
- [ ] FX modules built per `docs/pipeline.md` §9: Camera, ParallaxBG, FrameSequence, CharacterLayers, LipSync, Blink, FX, PaletteRemap, Grade
- [ ] Glow layer + character masking verified (no glow bleeding through characters)
- [ ] Each shot composited (`studio/src/shots/shXXX.tsx`) and reviewed
- [ ] Colour script check: watch the full episode for colour flow (storyboard §0.1)
- [ ] Subtitles: Hindi + English `.srt` generated from `script.hi.md`
- [ ] Title card "एक नई शुरुआत" with a licensed font (logged in `docs/credits.md`)

## Production — sound
- [ ] Music cues M1–M8 composed or licensed (logged in `docs/credits.md`)
- [ ] Ambience beds AMB1–AMB4
- [ ] SFX cues 1–29 (`sound-timeline.md` §4)
- [ ] Stems mixed and master at −14 LUFS

---

## FFmpeg reference (for the mix and delivery stage, not run yet)

Two-pass loudness normalisation of the mix:

```bash
ffmpeg -i audio/ep01/mix/mix_premaster.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null -
```

```bash
ffmpeg -i audio/ep01/mix/mix_premaster.wav -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=<I>:measured_TP=<TP>:measured_LRA=<LRA>:measured_thresh=<thresh>:offset=<offset>:linear=true" -ar 48000 audio/ep01/mix/mix.wav
```

Combine the Remotion video render with the final mix:

```bash
ffmpeg -i renders/ep01_video.mov -i audio/ep01/mix/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 320k -movflags +faststart renders/ep01_master.mp4
```

Add the Hindi and English subtitle tracks (soft subs):

```bash
ffmpeg -i renders/ep01_master.mp4 -i renders/ep01_hi.srt -i renders/ep01_en.srt -map 0 -map 1 -map 2 -c copy -c:s mov_text -metadata:s:s:0 language=hin -metadata:s:s:1 language=eng renders/ep01_master_subs.mp4
```

Quality checks:

```bash
ffmpeg -i renders/ep01_master.mp4 -af ebur128=peak=true -f null -
```

```bash
ffmpeg -i renders/ep01_master.mp4 -vf blackdetect=d=0.1:pix_th=0.05 -an -f null -
```

(The black-detect check should report only intended moments. The white-outs
aren't black, so they won't trigger it.)

---

## Gate G6 — Delivery

- [ ] Full review at 100% and on a phone screen
- [ ] Duration exactly 50.000 s (1,200 frames)
- [ ] Loudness −14 LUFS ±0.5, true peak ≤ −1 dBTP
- [ ] Canon check: Creation Authority not shown or hinted anywhere
- [ ] Credits file complete; all licences verified
- [ ] Master + subtitles + stems archived
