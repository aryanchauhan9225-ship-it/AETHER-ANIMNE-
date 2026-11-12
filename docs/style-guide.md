# AETHER — Visual Style Guide

> The rulebook for keeping AETHER looking like traditional Japanese 2D anime
> and keeping every character on-model across scenes.
> Sections marked **TBD** will be filled in when designs are approved (gate G4).

---

## 1. Overall look

- **Traditional TV/film anime.** Clean line art, flat cel colour, one hard
  shadow tone, one highlight, painted backgrounds.
- **Cinematic.** Deliberate framing, depth through layered backgrounds,
  strong light direction, atmospheric haze and particles.
- **Motion feel.** Characters move in steps on 2s/3s with clear key poses,
  anticipation and follow-through. Camera and effects move every frame.
- **Avoid:** smooth sliding cut-out motion, flat images warped to fake 3D,
  long dead holds, gradient-heavy "digital painting" on characters,
  3D-rendered looks.

---

## 2. Characters

### 2.1 Required design pack (per main character)

No animation of a character starts until all of these items are approved:

| Item | Content |
|---|---|
| Turnaround | Front, 3/4 front, side, 3/4 back, back, with horizontal guide lines (top of head, eyes, nose, chin, shoulders, waist, knees, feet) |
| Expression sheet | 8–12 expressions at 3/4 view: neutral, happy, angry, shocked, sad, determined, smug, fearful, pain, and others as needed |
| Mouth chart | 7 Hindi mouth shapes (`M A E O T F X`, see `docs/pipeline.md` §6) × 2–3 head angles |
| Hand sheet | Relaxed, fist, open palm, pointing, spell-casting gesture, holding prop |
| Colour sheet | Exact HEX codes: base / shadow / highlight for each region, in each lighting mode |
| Proportion notes | Written rules (see 2.2) |
| Height lineup | All characters side by side, measured in head-heights |

Folder: `art/characters/<id>/model-sheets/`

### 2.2 Proportion rules (template)

Each character gets a short written list. Example format:

```
Character: <id>                 Height: <n> heads
Eyes: width = 1/5 face width, iris covers ~60% of eye height
Eye position: vertical midpoint of head
Hair: <count> main spikes/locks; signature strand at <position>
Distinguishing marks: <scar / earring / mark> on <side>
Silhouette key: <cloak shape, weapon, hair shape>
```

**TBD:** filled in per character at gate G4.

### 2.3 Line art

| Framing | Line width at 1920×1080 |
|---|---|
| Close-up | 4–5 px outer, 2–3 px inner |
| Medium | 3 px outer, 2 px inner |
| Wide / full body | 2 px outer, 1–1.5 px inner |

- One shared Krita brush preset bundle for everyone (stored in `art/` as
  `aether-brushes.bundle` once created).
- Outer silhouette lines are slightly thicker than inner detail lines.
- Lines are anti-aliased, solid colour, never textured.
- Coloured line art (lines tinted toward the fill colour) is allowed only
  for hair edges and glow areas.

### 2.4 Colour & shading

- Characters use **flat fills from the official palette only**
  (`art/palettes/*.gpl`).
- **One hard-edged shadow tone** per region, plus an optional **one
  highlight** (hair, eyes, metal).
- Key light comes from one direction per scene, recorded in the shot list.
- **Lighting moods are added in compositing, not repainted.** Night,
  sunset, aether glow and rim light are colour/light layers in Remotion.
  Characters always stay painted in the standard daylight palette.
- Eyes: base + shadow + 1–2 specular highlights. Highlights stay on the same
  side as the key light.

### 2.5 Lighting modes (palette variants)

Each lighting mode is a **separate colour model** (a matching palette for
that light, called *iro-shitei* in Japanese studios), not a tint laid over
the whole frame. Because characters are painted only in flat palette
colours, compositing can swap each day colour for its matching colour in
another mode, one colour at a time. Nothing is repainted.

| Mode | Use | Implementation |
|---|---|---|
| Day (standard) | Default | Base palette |
| Dusk | Warm scenes | Dusk palette, swapped in during compositing |
| Night | Dark scenes | Night palette, swapped in during compositing + reduced saturation |
| Aether-lit | Magic events | Aether palette, swapped in during compositing + glow + rim light (colour TBD) |

Rules:
- Each palette variant defines **base, shadow, line and highlight**
  separately. Never derive them by multiplying everything by one tint.
- **Skin gets its own colour in every mode.** A scene-wide tint turns faces
  pink or grey under coloured light.
- The hero has **one accent colour** that stays readable in every mode.
- **Colour fills must have hard edges (no anti-aliasing); only lines are
  anti-aliased.** That keeps fill colours exact, so the per-colour swap
  works. Set the Krita fill tool and the OpenToonz ink-and-paint settings
  accordingly.

---

## 3. Backgrounds

- Painted, cinematic, with more detail and soft gradients than characters
  (traditional anime contrast between characters and backgrounds).
- Every BG is split into **depth layers** for parallax:
  `far` (sky / distant), `mid`, `near`, `fg` (foreground overlap elements).
- Overlapping foreground elements (branches, pillars, debris) are encouraged
  for depth.
- Paint wider than the frame when the camera pans. Add ≥ 10% extra margin on
  all sides for camera shake.
- Perspective and horizon line must match the layout drawing for that shot.
- Folder: `art/backgrounds/<set>/`

---

## 4. Effects (FX)

| Effect | Style |
|---|---|
| Aether energy / magic | Hand-drawn shapes on 2s + composite glow. Hard-edged core, soft bloom |
| Particles / dust / sparks | Composite (Remotion), on 1s, with depth (size and blur by distance) |
| Light rays / god rays | Composite overlay, low opacity |
| Impact frames | 1–3 drawn frames, high-contrast or inverted colour |
| Speed lines | Hand-drawn or composite, on 2s |
| Smoke / fire | Hand-drawn shapes, on 2s/3s, flat 2-tone |

Folder: `art/fx/`

### 4.1 Light & glow techniques (compositing)

How AETHER's light and magic are built in `studio/src/lib/FX` and `Grade`.
Several of these are inspired by Lemo-Opuscar's *80s Cel Anime* style
(see `docs/credits.md`). We write our own implementation.

| Technique | Rule |
|---|---|
| **Separate glow layer** | Everything that emits light (aether energy, lamps, glowing eyes, runes) is also drawn onto a separate **glow layer**. Bloom is generated mainly from that layer. Ordinary painted colour blooms only weakly and only above a high brightness threshold, which stops white clothing and skies glowing pink. |
| **Character masking** | Each character's silhouette is stamped **black** into the glow layer, so glow from behind never bleeds through a character. Backlit glow wraps around edges only. |
| **Halation** | The widest, softest bloom ring is tinted warm (red-orange), like light spreading in film. Keep it subtle. |
| **Rim light** | Built from the character's own shape, offset 2–4 px away from the light source and clipped to the character. Thicker rims swallow thin shapes such as fingers and hair tips. |
| **Light-band sweep** | A coloured band of light slides across a *held* drawing (clipped to the character). This adds drama or tension without new drawings. Keep it weaker on faces. |
| **Impact frames** | 2 frames of an inverted or single-colour silhouette over radial lines, then the result. Pair with 6–12 frames of camera shake. |
| **Flares** | Used sparingly: star-burst for magic flashes, horizontal anamorphic streak for strong lights. |
| **Moving backgrounds** | Add a slight horizontal blur (~8–16 px) to background layers during fast pans to prevent strobing. |
| **Order of operations** | Limit bright values before any contrast curve so highlights don't turn into black holes. Subtitles are added after the grade. |

---

## 5. Camera & framing

- Use standard shot types: extreme wide, wide, medium, medium close-up,
  close-up, extreme close-up, over-the-shoulder, low angle, high angle.
- Camera moves: pan, tilt (as a vertical pan), push in / pull out,
  track (parallax), shake.
- Moves ease in and out. Anime-style fast "snap zooms" are allowed for impact.
- **No more than ~1.5 s of a completely still frame.** Something must breathe.
- Cut to a new shot every ~3–5 s unless the shot is a deliberate hero moment.
- Optional cinematic letterbox: **TBD** (decided at the animatic stage).

---

## 6. Timing cheatsheet (24 fps)

| Action | Timing |
|---|---|
| Blink | Closed for 2–3 frames, half-closed for 1 frame either side |
| Mouth shape | Hold ≥ 2 frames |
| Head turn (Level A) | 6–10 drawings on 2s, with anticipation |
| Hair / cloth secondary motion | On 2s or 3s, lags the main motion by 2–4 frames |
| Breathing hold (Level B/C) | 1 cycle ≈ 3–4 s, very subtle |
| Impact | 1–3 impact frames + 6–12 frames camera shake |

---

## 7. Consistency checklist (every key drawing)

The animation supervisor checks each key drawing before in-betweening:

- [ ] Matches the turnaround at this angle (guide lines line up)
- [ ] Proportions follow the written rules
- [ ] Distinguishing marks on the correct side
- [ ] Hair lock count and shape correct
- [ ] Line widths match the framing
- [ ] Only palette colours used (verified by script later)
- [ ] Light direction matches the shot list
- [ ] Mouth shape matches the lip-sync timing

Off-model keys are **corrected by drawing over them**, not redrawn from
memory.

---

## 8. AI-assisted imagery policy

- **Not used for characters.** AI images drift off-model between shots.
- May be used only for **background or layout concepts**, which must be
  fully painted over and checked for licensing.
- Any AI use is recorded in `docs/credits.md`.
