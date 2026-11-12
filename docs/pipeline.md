# AETHER — Production Pipeline

> Technical workflow for producing AETHER episodes, starting with the
> **50-second Hindi-voiced Episode 1**.
> Status: **approved for documentation only.** No dependencies have been
> installed yet.

---

## 1. Principles

1. **Traditional 2D anime look.** Characters move in hand-drawn steps
   (on 2s / 3s). We never fake pose or angle changes by warping a flat image.
2. **Not a slideshow.** Every shot has at least two of these moving:
   **character, camera, atmosphere.**
3. **Free / low-cost tools.** No Blender.
4. **Reproducible.** Timing lives in text files (`shotlist.yaml`, lip-sync
   JSON). The final film is re-rendered from source and never hand-edited.
5. **One source of truth for designs.** Every drawing is checked against the
   model sheets (see `docs/style-guide.md`).

---

## 2. Toolchain

| Stage | Tool | Cost | Runs where | Notes / limitations |
|---|---|---|---|---|
| Drawing, painting, frame-by-frame | **Krita** | Free | Artist's desktop | Main art tool. Animation timeline + onion skin. Exports PNG sequences. |
| Timing sheet / ink & paint (optional) | **OpenToonz** | Free | Artist's desktop | Traditional X-sheet timing. Interface takes time to learn. |
| Voice recording / cleanup | **Audacity** | Free | Desktop | Noise reduction, trimming, levels. |
| Hindi voices | Human actors (preferred) or AI voices | Free / low-cost | Desktop or cloud | Needs the speaker's consent for any voice cloning. |
| Lip-sync timing | **Rhubarb Lip Sync** | Free (MIT) | CLI | Trained on English. Its language-independent mode drafts Hindi timing, which is then **corrected by hand**. |
| Compositing, camera, FX, grade | **Remotion** (React → video) | Free for individuals / teams ≤ 3 | CLI (no GPU needed) | Combines and moves artwork; it does not draw. |
| Audio mix, encode, subtitles | **FFmpeg** | Free | CLI | Loudness normalisation, mux, final encode. |
| Version control | Git + Git LFS | Free (quota) | Everywhere | See §8 *Storage strategy*. |

> **Not yet installed:** Remotion (Node packages), Rhubarb, any Python
> packages. Each will be proposed for approval before installation.

---

## 3. Technical specification

| Setting | Value |
|---|---|
| Resolution | 1920 × 1080 (16:9) |
| Frame rate | **24 fps** |
| Character animation timing | on 2s (12 drawings/s) for Level A, on 3s (8 drawings/s) for Level B |
| Camera / FX timing | on 1s (every frame) |
| Drawing canvas | 1920 × 1080 for normal shots. Larger canvases for pans (e.g. 3840 × 1080) |
| Frame image format | PNG, 8-bit RGBA, straight alpha, sRGB |
| Background format | Layered `.kra` source → one PNG per depth layer |
| Dialogue audio | WAV, 48 kHz, 24-bit, mono |
| Final delivery | MP4 (H.264, yuv420p, CRF ~16), AAC 320 kbps, −14 LUFS integrated |
| Subtitles | Hindi (Devanagari) + English `.srt`, UTF-8 |
| Episode 1 length | 50 s = **1,200 frames** |

---

## 4. Animation levels

Every shot in `story/ep01/shotlist.yaml` is assigned one level.

| Level | Technique | Typical use | Drawing density |
|---|---|---|---|
| **A — full frame-by-frame** | Keys + in-betweens, on 2s | Hero moments: spell cast, sharp turn, emotional reaction | ~12 drawings/s |
| **B — limited animation** | Held body. Moving parts (arms, head, hair, cloak) redrawn on 3s | Dialogue, acting | ~4–8 drawings/s |
| **C — drawn layers + camera + FX** | Drawn expression/pose swaps, blinks, mouth shapes, camera moves, parallax, particles, light | Establishing shots, atmosphere | swaps only |

**Episode 1 budget:** about 8–10 s Level A, 20–25 s Level B, 15–20 s Level C,
for **≈ 210–280 drawings** in total.

**Level C rule:** layered character parts are cut from approved model-sheet
drawings. They are animated **in steps on 2s/3s**, never with smooth
computer-made in-betweens. Any change of angle needs a new drawing.

---

## 5. Stage-by-stage workflow

| # | Stage | Output | Location | Owner |
|---|---|---|---|---|
| 1 | Story & Hindi script | `script.hi.md` (Devanagari + romanized) | `story/ep01/` | Writer |
| 2 | Shot list | `shotlist.yaml` | `story/ep01/` | Director |
| 3 | Design pack | Model sheets, palettes, mouth charts | `art/` | Artist |
| 4 | Temporary voice | Rough read-through WAVs | `audio/ep01/scratch/` | Any |
| 5 | Storyboard + animatic | Board frames + animatic MP4 | `story/ep01/storyboard/`, `renders/` | Artist + director |
| | **Timing is locked after this stage** | | | |
| 6 | Final voices | Clean dialogue WAVs | `audio/ep01/dialogue/` | Voice actors |
| 7 | Lip-sync | Mouth-shape timing JSON, hand-corrected | `audio/ep01/lipsync/` | Pipeline |
| 8 | Layout | Per-shot framing, BG sections, camera path | `animation/ep01/<shot>/layout/` | Artist |
| 9 | Key animation → in-betweens | Rough frames | `animation/ep01/<shot>/` | Animator |
| 10 | Supervisor check | Off-model drawings corrected by drawing over them | — | Animation supervisor |
| 11 | Clean-up → flat colour → cel shading | Final PNG frames | `animation/ep01/<shot>/final/` | Artist |
| 12 | Backgrounds | Depth-layered BG PNGs | `art/backgrounds/` | BG artist |
| 13 | Compositing | Shot and episode compositions | `studio/` | Pipeline |
| 14 | Sound | Mixed, loudness-normalised master + subtitles | `audio/ep01/mix/` | Pipeline |
| 15 | Review & fix-up pass | Final render | `renders/` | All |

---

## 6. Hindi lip-sync

Each main head angle has **7 mouth shapes**:

| ID | Mouth shape | Hindi sounds |
|---|---|---|
| `M` | Closed lips | प फ ब भ म |
| `A` | Wide open | आ, stressed अ |
| `E` | Spread | इ ई ए ऐ |
| `O` | Rounded | उ ऊ ओ औ |
| `T` | Teeth / tongue visible | त थ द ध ट ड न ल स श ज च र क ग |
| `F` | Lower lip to teeth | फ़ व |
| `X` | Rest | pauses / silence |

Process:
1. Rhubarb (language-independent mode) drafts the mouth timing from each
   dialogue WAV.
2. A script converts Rhubarb's shapes into the AETHER `M/A/E/O/T/F/X` set.
3. A person corrects the timing against the Devanagari script and saves the
   result as `audio/ep01/lipsync/<shot>_<character>.json`.
4. Close-ups use all 7 shapes. Wide shots may use the traditional 3-shape
   anime flap (`X` / `T` / `A`).
5. Mouth changes are held for **at least 2 frames** (no single-frame
   flicker).

---

## 7. Naming conventions

- **Shots:** `sh010`, `sh020`, … (steps of 10 leave room for inserts like `sh015`)
- **Characters:** lowercase ASCII id, e.g. `kael`, `mira` (final names TBD)
- **Frame sequences:** `<shot>_<character>_<part>_<####>.png`, e.g.
  `sh030_kael_body_0001.png`. Numbering starts at `0001`.
- **Background layers:** `<set>_<layer>.png`, where layer is `far`, `mid`,
  `near` or `fg`. Example: `skyisle_far.png`
- **Dialogue:** `<shot>_<character>_<take>.wav`, e.g. `sh020_kael_t03.wav`
- **Lip-sync:** `<shot>_<character>.json`
- **Sources** (`.kra`, `.tnz`, `.aup3`) sit next to their exports, in the
  same folder.
- No spaces or Devanagari characters in **file names**. Devanagari is used
  only inside file contents.

---

## 8. Storage strategy

GitHub's free Git LFS quota is about **1 GB of storage and 1 GB of download
per month**. One episode of PNG frames plus layered `.kra` sources can
exceed that.

- **Commit to git:** text (scripts, YAML, JSON, docs, code), approved
  **exported PNG frames and BG layers**, final dialogue WAVs.
- **Keep outside git** (Google Drive / Dropbox / external disk) **if quota
  becomes tight:** heavy layered `.kra` / `.psd` work files, raw recordings,
  rough animation passes.
- **Never commit:** `renders/` output, `node_modules/`, caches (see `.gitignore`).
- When the quota gets close, either buy a GitHub LFS data pack or move
  sources off-repo. Agree on this before production art starts.

`.gitattributes` already sends the binary formats to LFS. Each contributor
must run `git lfs install` once on their own machine.

---

## 9. Compositing architecture (planned, not yet built)

```
studio/
├── package.json            (created at the "install Remotion" stage)
└── src/
    ├── Root.tsx            registers compositions
    ├── Ep01.tsx            sequences shots against the master audio
    ├── shots/sh010.tsx …   one file per shot, driven by shotlist.yaml
    └── lib/
        ├── Camera          pan / push / shake, on 1s
        ├── ParallaxBG      far / mid / near / fg layers
        ├── FrameSequence   plays drawn PNG sequences at their timing
        ├── CharacterLayers stepped (on 2s/3s) layer swaps for Level C
        ├── LipSync         mouth swaps from lip-sync JSON
        ├── Blink           blink timing
        ├── FX              particles, glow, light rays, aether energy
        └── Grade           colour grade, letterbox, film grain
```

Artwork enters Remotion as **exported PNGs only**. Krita / OpenToonz
sources are never read directly.

---

## 10. Approval gates

| Gate | Requires approval before |
|---|---|
| G1 ✅ | Documentation & folder structure (this stage) |
| G2 | Story / script / shot list content |
| G3 | Installing Remotion + Rhubarb (tool setup) |
| G4 | Design pack sign-off (no animation before this) |
| G5 | Animatic timing lock |
| G6 | Final render & delivery |
