# AETHER Ep01 — Storyboard & Direction

Shot-by-shot board descriptions with camera, layout, key poses, expressions,
acting, animation timing and effects. This is **the brief for drawing the
storyboard panels**. The panels themselves don't exist yet. When drawn, they
go in `story/ep01/storyboard/` as `sh010_p01.png`, `sh010_p02.png`, …

Timing source: `shotlist.yaml`. `f` = frame number in the episode.
"On 2s" = a new drawing every 2 frames. Camera and FX always move on 1s.

---

## 0. Direction notes for the whole episode

### 0.1 Emotional curve

```
intensity
  ▲                                         SC7 resolve
  │                         SC5 "माँ..."     ╱‾‾╲  SC8 sending
  │      SC2 white-out        ╲            ╱    ╲╱‾‾‾╲
  │         ╱╲                 ╲  SC6     ╱           ╲  SC9 comic
  │  SC1   ╱  ╲  SC3 awe   SC4  ╲______╱              ╲__╱‾╲ title
  │ ______╱    ╲_╱‾‾‾‾╲___╱‾‾╲
  └──────────────────────────────────────────────────────────► time
   0      4      11     17     23      31   35.5  40   44.5   50 s
```

- **Colour script:** SC1 black → warm star · SC2 cold blue/neon, desaturated
  · SC3–SC4 blue/violet/silver awe · SC4–SC6 gold enters with Elaria · SC5
  "माँ" drains toward grey-violet · SC7 warm gold returns · SC8 white-gold
  peak · SC9 soft warm sunlight.
- **Cutting:** straight cuts throughout. The only transitions are the two
  white-outs (sh040 → sh050, sh150 → sh160). No dissolves or wipes.

### 0.2 Acting principles

**Aether (adult):**
- Thinks before he speaks: eyes move first, then the head, then the mouth.
- His humour is understated and deadpan, delivered half to himself.
- He's emotional but holds it in: the tear comes *before* the voice breaks.
- Signature gestures: rubbing the back of his neck when unsure, patting his
  chest or pockets out of habit, a crooked one-sided grin (left side).

**Elaria:**
- **Stillness is her power.** Minimal body movement. Only her hair and robe
  move constantly, with a slow underwater-like flow cycle.
- She never blinks quickly: slow blinks only (10–12 frames).
- Her smile is small and asymmetric, and appears *after* the line, not
  during it.
- She glides rather than walks. Her feet hover 2–4 px above surfaces with a
  soft contact glow.
- Divine Knowledge has one visual signature: a thin ring of golden runes
  turning inside her irises and nothing else. **Never show anything that
  hints at Aether's Creation Authority.**

**Aether (baby):**
- Newborn movements: jerky, uncoordinated hands. The eyes do the acting.
- The adult mind shows only through the eyes and the inner voice, never
  through adult gestures.

### 0.3 Expression keys used in Ep01

| Code | Character | Expression | Used in |
|---|---|---|---|
| AE-01 | Aether | Tired neutral (lids 70% open, mouth flat) | sh020, sh030 |
| AE-02 | Aether | Shock (lids 100%, small pupils, mouth slightly open) | sh040 |
| AE-03 | Aether | Waking (lids 40% → 90%, unfocused → focused) | sh050 |
| AE-04 | Aether | Curious awe (brows up, mouth soft open) | sh060, sh070 |
| AE-05 | Aether | Deadpan joke (half-lidded, one-sided mouth) | sh060 |
| AE-06 | Aether | Confused half-smile → dawning dread | sh090 |
| AE-07 | Aether | Grief (brows pinched up, tear, lip tremble) | sh110 |
| AE-08 | Aether | Laugh through tears → crooked grin | sh130 |
| AE-09 | Aether | Resolve (brows level, lids 85%, closed-mouth smile) | sh130, sh140 |
| EL-01 | Elaria | Serene neutral (lids 75%, faint smile) | sh080, sh120 |
| EL-02 | Elaria | Divine Knowledge (eyes glowing, runes) | sh100 |
| EL-03 | Elaria | Compassion (brows slightly up, soft eyes) | sh100, sh120 |
| EL-04 | Elaria | Blessing (eyes 60%, warm smile) | sh140 |
| AB-01 | Baby | Unfocused newborn | sh160 |
| AB-02 | Baby | Startled stare (adult mind inside) | sh160 |
| AB-03 | Baby | Sneeze twitch | sh170 |

All of these must appear on the expression sheets before animation starts
(see the character design specs).

---

## SC1 — Cold open

### sh010 · f0–96 · 4.0 s · Level C
- **Layout:** pure black frame. A single star at frame centre, slightly above
  the middle (y ≈ 0.45). Four star layers sit at different depths.
- **Camera:** push-in from 1.00 → 1.15 scale with ease-in. Nearer layers
  move faster (parallax ratio 1.0 / 0.6 / 0.3 / 0.1).
- **Key moments:**
  - f0–12: black, with faint dust that is barely visible.
  - f12: the star appears as a 2-px point.
  - f24–48: it ignites: drawn flare on 2s (6 drawings) plus a star-burst flare.
  - f48–96: the nebula slowly breathes (opacity 0.8 ↔ 1.0 over 48 frames).
- **FX:** glow layer for the star, warm halation, drifting dust motes on 1s.
- **Sound sync:** N1 starts at f12, with the ignition.

---

## SC2 — Previous life

### sh020 · f96–168 · 3.0 s · Level B
- **Layout:** high angle, about 30° down. Aether is small, in the lower-left
  third, walking right. Umbrellas in the foreground cross left. A neon sign
  in the far layer uses generic words such as "OPEN" or "CAFÉ". No brands.
- **Camera:** lateral track right, 120 px over 72 frames. Parallax: umbrellas
  1.4×, Aether 1.0×, street 0.8×, neon far 0.3×.
- **Animation:** 8-drawing side walk cycle on 2s, looped. The lanyard is
  part of the cycle and lags 2 frames behind. The head is slightly bowed.
- **Expression:** AE-01, tired.
- **FX:** rain streaks on 1s in two depth layers, ripples on wet ground,
  neon reflections on the ground (flipped, blurred and streaked copy).
- **Colour:** cold blue base, neon magenta/cyan rim lights on Aether.

### sh030 · f168–228 · 2.5 s · Level B
- **Layout:** insert. His right hand holds the phone, filling the
  lower-centre of the frame. The screen text **"माँ — 3 मिस्ड कॉल"** is
  rendered as overlay text in the composite (not hand-lettered) so it stays
  crisp. A contact photo is not shown.
- **Camera:** locked, with a slight handheld drift of ±2 px on 1s.
- **Key poses:**
  - f168: thumb approaches.
  - f180–192: thumb hovers and hesitates; a held drawing plus a 1-px tremble on 3s.
  - f204: thumb slides to the side lock button.
  - f210: the screen goes dark and reflects a faint sliver of his face (AE-01).
- **Drawings:** 6.
- **FX:** raindrops landing on the screen (composite), screen glow on his
  fingers that turns off at f210.

### sh040 · f228–264 · 1.5 s · Level A
- **Layout:** medium close-up, 3/4 front, head turning right toward the light.
- **Camera:** micro push-in 1.00 → 1.04 on 1s.
- **Key animation (on 2s):**
  - f228: neutral (AE-01).
  - f232: anticipation: a small dip of the chin.
  - f236–246: the head turns right in 6 drawings, and the eyes lead by 2 frames.
  - f246: AE-02 shock. The pupils contract and the rain **freezes**: rain
    drawings hold and the rain composite stops.
  - f252–264: the white light overpowers everything and the frame bleaches
    to pure white.
- **FX:** a white light source enters from the right at f236 and grows. A
  2-frame light-flash rim on Aether at f246. Grade to white over
  f252–264.
- **Rule:** no vehicle, impact or injury is shown. The light and the frozen
  rain tell the story.

---

## SC3 — Awakening

### sh050 · f264–312 · 2.0 s · Level A
- **Layout:** extreme close-up of his right eye and brow. The eye is at the
  left third and the frame is 16:9.
- **Camera:** locked, slow push 1.00 → 1.03.
- **Key animation:**
  - f264–276: white fades to deep violet.
  - f270–276: the lashes tremble (2 drawings, alternating on 3s).
  - f282 / f286 / f290: the eye opens in 3 drawings.
  - f290–300: the iris focuses (2 drawings: wider pupil → normal).
  - f300–308: one slow blink (3 drawings).
- **FX:** a reflection of the Astral Nexus in the iris (a composited galaxy
  image masked to the iris). Two highlights on the eye that stay fixed while
  the reflection drifts.
- **Expression:** AE-03.

### sh060 · f312–408 · 4.0 s · Level C (with B-level acting)
- **Layout:** the camera starts at a medium-wide shot of Aether on a
  hexagonal crystal platform, then **cranes up** to an extreme wide shot.
  He ends up small in the lower third, surrounded by floating islands,
  galaxies and silver arches. The background is one tall crane plate (see
  BG03-A).
- **Camera:** crane up 1,400 px over f312–396 with ease-in/out. Hold for
  the final 12 frames.
- **Acting (key poses on 3s; Aether is a figure in the frame):**
  - f312: lying on his back.
  - f318–336: sits up (6 drawings).
  - f336–356: looks left, then right (4 drawings), AE-04.
  - f356–372: pats his chest (4 drawings): dry, unhurt.
  - f378: AE-05 deadpan for L02.
- **Lip-sync:** wide shot, so the **3-shape flap** (`X` / `T` / `A`) is enough.
- **FX:** galaxies turning very slowly (0.5° per second), waterfalls of
  light from the islands (looping composite), drifting star motes.

---

## SC4 — Elaria

### sh070 · f408–456 · 2.0 s · Level A
- **Layout:** medium close-up, Aether in profile facing left. Out-of-focus
  golden particles in the foreground.
- **Camera:** locked. A rack focus pulls the foreground particles sharp
  (f408–420), then back to Aether sharp (f420–432).
- **Key animation (on 2s):**
  - f414: a particle touches his cheek, his eye flicks toward it, and there's
    a tiny shoulder rise.
  - f424: anticipation as his head dips slightly the opposite way.
  - f428–444: he turns his head over his shoulder in 8 drawings, ending
    in a 3/4 back view.
  - f444–456: hold, with a hair settle (2 drawings).
- **FX:** drawn particles (6 drawings, on 2s) plus composite particles that
  begin a spiral behind him. A warm gold kicker light grows on the left side
  of his face.

### sh080 · f456–552 · 4.0 s · Level B (heavy FX)
- **Layout:** low angle, about 25° up. Elaria fills the centre of the frame.
  A silver celestial arch frames her from behind (BG03-C).
- **Camera:** tilt up from her feet (f456) to her face (f500). Settle with
  ease-out and hold.
- **Materialisation:**
  - f456–484: a particle vortex. 6 drawn silhouette mattes (on 3s) reveal her
    figure from the feet up. Particles flow along the silhouette's edges.
  - f472–500: her hair unfurls outward and up, as if underwater, and the robe
    settles (6-drawing flow cycle on 3s, which then keeps looping for the
    rest of the episode).
  - f486: **her eyes open** in 3 drawings and **glow gold** for a moment.
  - f490–550: L03, EL-01. Her smile appears at f544, *after* "गए".
- **Lip-sync:** close enough for the full 7-shape set (front-3/4 low-angle
  mouth chart).
- **FX:** a separate glow layer with her silhouette masked out (so light
  wraps around her but doesn't bleed through), a gold backlight halo, soft
  contact glow under her hovering feet.

---

## SC5 — The truth

### sh090 · f552–600 · 2.0 s · Level B
- **Layout:** medium close-up, Aether in 3/4 front, facing right toward her.
- **Camera:** locked.
- **Acting:** an AE-06 half-smile on "पहुँच गया...?" (f556–572). The smile
  fades over "मतलब..." (f576–588), and his eyes drift down on "मैं..."
  (f590). 6 drawings.
- **Lip-sync:** full 7 shapes.

### sh100 · f600–684 · 3.5 s · Level B
- **Layout:** close-up of Elaria in 3/4 front, facing left. Background
  defocused.
- **Camera:** push 1.00 → 1.08 over the whole shot.
- **Acting:**
  - f600–630: **Divine Knowledge.** EL-02. A rune ring turns inside both
    irises (composite overlay), the halo pulses once, and her face is held.
  - f606: "हाँ" with a small nod (4 drawings).
  - f630–640: the glow fades to EL-03, compassion (3 drawings).
  - f640–682: the rest of the line, with the face held and the mouth chart
    swapping.
- **Rule:** the runes are gold and **circle Elaria's own eyes**. They don't
  project onto Aether or show anything about him.

### sh110 · f684–744 · 2.5 s · Level A
- **Layout:** extreme close-up on Aether: eyes and mouth, cropped at the
  forehead and chin.
- **Camera:** locked, very slow push 1.00 → 1.03.
- **Key animation (on 2s):**
  - f684–700: AE-07. The eyes tremble (4 drawings, alternating ±1 px) and the
    brows pinch upward.
  - f696–728: a tear wells on the lower lid and rolls down (8 drawings).
  - f708: the lips part and he breathes in (3 drawings).
  - f716–736: "माँ..." as a whisper. The mouth shape `M` → `A` is held and
    then trails off.
- **Colour:** grade toward desaturated grey-violet over the shot. The warm
  rim light fades to nothing.

---

## SC6 — Another chance

### sh120 · f744–852 · 4.5 s · Level B
- **Layout:** over-the-shoulder shot. The back of Aether's head and his left
  shoulder are out of focus in the lower-left foreground. Elaria is at
  mid-right, medium shot.
- **Camera:** a slow 6° arc to the left (parallax: foreground shoulder 1.3×,
  Elaria 1.0×, background 0.4×). Settle by f800.
- **Acting:**
  - f744–770: Elaria glides one step forward with her body still and only the
    robe flowing.
  - f770–800: she bends slightly forward and extends an open right hand,
    palm up (10 drawings on 3s across the shot).
  - f758–840: L07, EL-03 → EL-01.
- **Lip-sync:** full 7 shapes, 3/4 angle.
- **FX:** particles around her brighten 20% as she approaches.

---

## SC7 — Acceptance

### sh130 · f852–960 · 4.5 s · Level A (f852–900) → B
- **Layout:** medium close-up of Aether in 3/4 front, facing right. At f930
  her hand enters frame right.
- **Camera:** locked until f880, then a slow push 1.00 → 1.06.
- **Key animation:**
  - f852–868: he wipes the tear with his right wrist (8 drawings on 2s).
  - f868–876: a short laugh through his nose: shoulders bob, AE-08
    (4 drawings).
  - f876–900: crooked grin → resolve, AE-09 (6 drawings).
  - f880–938: L08.
  - f930–948: he reaches out and takes her hand (4 drawings on 3s).
- **Colour:** the warm gold light rises on his face from f876, undoing the
  sh110 grade.
- **Lip-sync:** full 7 shapes.

---

## SC8 — The sending

### sh140 · f960–1032 · 3.0 s · Level B
- **Layout:** wide two-shot in profile. Aether is on the left and Elaria on
  the right, hands joined, with the BG03-D horizon of galaxies behind them.
- **Camera:** slow pull-back 1.00 → 0.94. At f1010 a light bloom fills the
  frame.
- **Acting:**
  - f966: Elaria raises her free left palm (5 drawings), EL-04.
  - f972: a golden magic circle opens beneath Aether (4 drawn rotation
    frames plus composite spin).
  - f990: Aether looks at her and nods once (3 drawings), AE-09.
  - f996–1032: he dissolves into light **from his feet upward** (6 drawn
    dissolve mattes plus composite particles).
- **Rule:** the magic circle is **Elaria's** golden design. Aether shows no
  power of his own.

### sh150 · f1032–1068 · 1.5 s · Level C
- **Layout:** point of view. Star layers rush toward the camera.
- **Camera:** fast forward travel (scale 1.0 → 3.0 on the star layers with
  ease-in), plus camera shake of 2 px.
- **FX:** radial speed lines (4 drawings on 2s), stretched stars, a light
  streak, white-out f1056–1068.

---

## SC9 — Born again

### sh160 · f1068–1140 · 3.0 s · Level B
- **Layout:**
  - f1068–1096: baby point of view. White bloom → a soft-focus warm room: a
    wooden window frame on the left, a sunbeam with dust, the blurred warm
    shape of a woman leaning in (no face detail).
  - f1100–1140: cut-in inside the shot to a close-up of the baby on a soft
    blanket. A tiny hand in the foreground, the eyes in the background.
- **Camera:** focus pull from blur to soft over f1068–1092, then locked.
- **Acting:**
  - f1100–1112: the hand grasps at the air (6 drawings on 2s, newborn-jerky).
  - f1112–1120: the eyes open **ocean-blue** (3 drawings), AB-01.
  - f1120–1128: blink (3 drawings).
  - f1128: AB-02 startled stare, held while L10 plays.
- **Sound:** a muffled baby cry starts at f1084, before the adult inner voice
  at f1100.
- **Rule:** no glow or magical sign on the baby. **Creation Authority stays
  hidden.**

### sh170 · f1140–1200 · 2.5 s · Level C
- **Layout:** close-up of the baby's face, with the camera slowly pulling
  back to a medium shot of him on the blanket in the sunbeam.
- **Camera:** pull-back 1.10 → 1.00 with ease-out.
- **Acting:** blinks at f1144 and f1156 (3 drawings, reused). A sneeze twitch
  at f1168 (4 drawings).
- **Title card:** "एक नई शुरुआत" appears at f1152. The letters reveal from
  left to right over 12 frames, then a light sweep runs across them
  (f1164–1180) with a small sparkle. Small romanized text "Ek Nayi
  Shuruaat" sits below. The title sits in the upper-centre area, clear of
  the baby. The font is TBD and must be licensed (record it in
  `docs/credits.md`).
- **End:** hold to f1200. No fade-out in this version, so the episode ends
  on the title.
