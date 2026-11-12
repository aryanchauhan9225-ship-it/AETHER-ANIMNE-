# Character Design Spec — AETHER (`aether`)

> **Status: written specification only. No design drawings exist yet.**
> Colour values below are **proposals** to be finalised on the colour model
> sheet at gate G4. Follow `docs/style-guide.md` for line, colour and
> shading rules.

---

## 1. Canon (approved, do not change)

- Previous-life age: **26**
- **Brown hair, ocean-blue eyes**
- Personality: **intelligent, funny, curious, emotional**
- Reincarnates as a **baby** and keeps his previous-life memories
- **Hidden Creation Authority. Never shown or hinted at in Ep01.**
  No glowing marks, special eye effects, auras or symbols on either version
  of Aether.

---

## 2. Version A — Adult Aether (previous life, 26)

### 2.1 Design concept
An ordinary young office worker with a quick, curious mind. He looks a
little tired, but his eyes are lively. He should read as **likeable and
relatable** rather than a heroic archetype. The ocean-blue eyes are his
visual signature: the most saturated colour on him.

### 2.2 Proportions
| Item | Rule |
|---|---|
| Height | **7 heads** (slim build, average height) |
| Shoulders | 2 head-widths |
| Face | Softly angular, slight jaw taper. The chin is a soft point, not sharp |
| Eyes | Almond-shaped, medium-large (anime-realistic, **not** moe-sized). Each eye = 1/5 of face width; eye line at the vertical middle of the head |
| Iris | Tall oval covering ~60% of the eye height. Two highlights (large upper and small lower, on the side the light comes from) |
| Brows | Medium thickness, expressive, slightly arched. They do most of the acting |
| Nose | Small: a shadow plane plus one stroke |
| Mouth | Medium width, with a crooked smile that rises on the **left** side |

### 2.3 Hair
- Medium-short, **brown**, naturally messy, pushed slightly to his right.
- **Silhouette key:** 5 main fringe locks across the forehead, with the
  longest lock falling between his eyes (slightly left of centre). One
  **cowlick** sticks up at the back of the crown, always visible in profile
  and 3/4 back. 2 locks over each ear.
- Hair tips are sharp and uneven.
- Hair highlight: one broken band of highlight (an "angel ring") across the
  crown.

### 2.4 Costume (previous life, Ep01 SC2–SC8)
| Item | Detail |
|---|---|
| Shirt | White office shirt, sleeves rolled to the forearm, top button open |
| Tie | Navy, loosened, knot hanging ~5 cm below the collar |
| Trousers | Charcoal-grey slacks |
| Shoes | Black office shoes |
| Lanyard | Blue strap with a white ID card (blank, no logo). **Present in SC2 only.** It's gone in the Astral Nexus; the soul arrives without worldly things |
| Watch | None |
| Rain state (SC2) | Shirt darker and clinging at the shoulders, hair flattened with 2–3 drips |
| Nexus state (SC3–SC8) | Clothes dry and clean, hair back to its normal shape |

### 2.5 Colour model (proposed, Day / standard)

| Region | Base | Shadow | Highlight | Line |
|---|---|---|---|---|
| Skin | `#F4D9C4` | `#DDB29A` | — | `#7A4E3A` |
| Hair (brown) | `#6B4A33` | `#4A3122` | `#9A7254` | `#2E1C14` |
| Iris (ocean blue) | `#2A86C4` | `#155A8C` | `#8FD3F5` | `#0E2E4A` |
| Pupil | `#0E2E4A` | — | — | — |
| Eye white | `#FBFBFF` | `#D9DCEB` | — | — |
| Shirt | `#F2F2EE` | `#C9CCD6` | — | `#5A5E6E` |
| Tie | `#2E3A5A` | `#1D2640` | `#4A5A84` | `#141A2C` |
| Trousers | `#3A3E48` | `#262930` | — | `#15171C` |
| Lanyard | `#2F6FD0` | `#1F4E99` | — | `#122E5C` |

**Accent colour:** ocean-blue iris. It must stay readable in every lighting
mode.
**Required lighting variants:** Rain-night (SC2), Nexus violet (SC3–SC6),
Gold-lit (SC4–SC8, Elaria's light), Grief-desaturated (sh110).
These are per-colour palettes, not tints (style guide §2.5).

---

## 3. Version B — Baby Aether (new world, SC9)

| Item | Rule |
|---|---|
| Age | Newborn |
| Proportions | **~4 heads.** Big rounded cranium, small chin, chubby cheeks |
| Hair | Thin **brown** fuzz with one small curl at the crown (echoing the adult cowlick) |
| Eyes | **Ocean-blue**, the same iris palette as the adult but larger relative to the face. Two highlights. This is the visual link to the adult |
| Expression | The adult mind inside shows only through the eyes (focus, stare). No adult facial gestures |
| Clothing | Wrapped in a soft cream cloth (`#F3E9D8` / shadow `#D9C7AA`). Plain, no symbols |
| Must not | No glow, mark, symbol or aura. **Creation Authority stays hidden** |

---

## 4. Model sheets required before animation (gate G4)

Save to `art/characters/aether/model-sheets/`.

| Sheet | Contents | Needed for |
|---|---|---|
| `aether_turnaround` | Front, 3/4 front L & R, side L & R, 3/4 back, back. Guide lines: top of head, eye line, nose, chin, shoulders, waist, knees, feet | All shots |
| `aether_head_angles` | Heads at: front, 3/4 front R, 3/4 front L, profile L, 3/4 back, low angle, high angle | sh040, sh050, sh060, sh070, sh090, sh110, sh130 |
| `aether_expressions` | AE-01 to AE-09 (see storyboard §0.3), at 3/4 front | All Aether shots |
| `aether_eye_detail` | ECU eye: closed / 40% / 70% / 100% open, plus blink, tremble and tear stages | sh050, sh110 |
| `aether_mouth_chart` | 7 shapes `M A E O T F X` × 3 angles (3/4 front R, 3/4 front L, front) | sh060, sh090, sh110, sh130 |
| `aether_hands` | Relaxed, holding phone, thumb press, wrist wipe, chest pat, reaching hand | sh030, sh060, sh130 |
| `aether_walk` | 8-drawing side walk cycle, wet version, with lanyard | sh020 |
| `aether_colour_model` | Day + 4 lighting variants as `.gpl` palettes | All shots |
| `aether_baby_sheet` | Front, 3/4, top-down (lying), expressions AB-01/02/03, hand poses (grasp, open) | sh160, sh170 |
| `height_lineup` | Aether adult next to Elaria (shared sheet) | sh120, sh140 |

---

## 5. Consistency checks specific to Aether

- [ ] Iris is **ocean-blue**, never teal or purple, in every lighting variant.
- [ ] 5 fringe locks, longest between the eyes, slightly left of centre.
- [ ] Cowlick visible in profile and back views.
- [ ] Crooked smile rises on the **left** side of his face.
- [ ] Lanyard only in SC2.
- [ ] Baby has the same iris colour and a curl at the crown.
- [ ] No power effects on Aether, in either version.
