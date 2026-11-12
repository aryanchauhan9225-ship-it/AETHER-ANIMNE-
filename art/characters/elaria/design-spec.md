# Character Design Spec — ELARIA (`elaria`)

> **Status: written specification only. No design drawings exist yet.**
> Colour values below are **proposals** to be finalised on the colour model
> sheet at gate G4. Follow `docs/style-guide.md` for line, colour and
> shading rules.

---

## 1. Canon (approved, do not change)

- **Supreme Goddess**
- **Age and origin unknown.** No backstory, no visible age markers; she
  shouldn't read as young or old
- **Long silver-white hair, golden eyes**
- **Elegant white-and-gold divine clothing**
- Personality: **gentle, wise, calm, mysterious**
- Ability shown in Ep01: **Divine Knowledge**, which identifies souls

---

## 2. Design concept

Timeless serenity. She is the calmest object in a moving universe: her body
is almost still while her hair and robe flow constantly, as if underwater.
Her elegance comes from **long vertical lines** (hair, robe, sleeves) and
restraint in her expressions. Her gold should feel like **light**, not
jewellery-shop shine.

---

## 3. Proportions

| Item | Rule |
|---|---|
| Height | **8 heads** (tall, elongated, elegant). About 1.05× Aether's height, plus a 2–4 px hover |
| Face | Long, gentle oval with a soft-point chin. Calm and symmetrical |
| Eyes | Almond, slightly narrower and longer than Aether's, upper lids gently lowered (EL-01 = 75% open). Each eye = 1/5 face width; eye line at the vertical middle of the head |
| Iris | Tall oval, **gold**, with a thin darker ring at the edge (where the Divine Knowledge runes appear). Two highlights |
| Lashes | Long upper lash line flicking outward. Fine lower lashes |
| Brows | Thin, long, softly arched, silver |
| Mouth | Small. Her smile is slight and asymmetric |
| Hands | Long, slender fingers. Gestures are slow and open-palmed |

---

## 4. Hair

- **Silver-white**, very long, reaching **her ankles**.
- Straight with gentle waves toward the ends.
- **Silhouette key:** a centre part, two long front locks framing her face to
  below her chest, and the main mass flowing behind. **3 thin floating
  strands** around her head that always drift (part of the flow cycle).
- **Movement:** always slowly floating, as if weightless (6-drawing flow
  cycle on 3s).
- **Highlight:** a soft silver-blue "angel ring" plus a faint glow on the
  edges in the glow layer.

---

## 5. Costume — divine white & gold

| Item | Detail |
|---|---|
| Gown | Floor-length, flowing **white** gown in layered translucent panels. It moves with the hair-flow cycle |
| Over-layer | A sleeveless white mantle draping from her shoulders, with a **gold** border pattern (simple geometric repeat, original design) |
| Sleeves | Long, wide, open sleeves hanging past her wrists |
| Waist | A thin **gold** waist cord tied at the front, with two long hanging ends |
| Head | A delicate **gold** circlet across her brow with a small central diamond-shaped gem (gold-white, not another colour) |
| Ornaments | Thin gold cuffs on both wrists. **Nothing else.** Restraint is key |
| Feet | Bare, hovering. A soft gold contact glow beneath |
| Glow | Edges of the hair, circlet, gold trim and eyes are also drawn into the **glow layer** (style guide §4.1) |

All motifs must be **original**. Don't copy the costume or symbol of any
existing goddess character.

---

## 6. Colour model (proposed, Day / Nexus standard)

| Region | Base | Shadow | Highlight | Line |
|---|---|---|---|---|
| Skin | `#FBEDE4` | `#E8CBBE` | — | `#9C6E62` |
| Hair (silver-white) | `#EEF0F7` | `#B9C0D8` | `#FFFFFF` | `#7E86A6` |
| Iris (gold) | `#E8B13A` | `#A8741C` | `#FFF0B0` | `#6B4510` |
| Pupil | `#5A3608` | — | — | — |
| Gown / mantle (white) | `#FAFAF7` | `#D5D8E6` | — | `#8A8FA8` |
| Gold trim / circlet / cuffs | `#D4A93C` | `#9C7322` | `#F7DE8A` | `#5E4310` |
| Brows / lashes | `#C8CDE0` | — | — | `#6E7590` |
| Divine glow (glow layer) | `#FFD36B` core → `#FFB347` halo | | | |

**Accent colour:** gold (eyes and trim).
**Required lighting variants:** Nexus standard (SC4–SC6), Divine Knowledge
(sh100: brighter eyes, rune overlay), Blessing (sh140: gold light from below).

---

## 7. Divine Knowledge — visual spec

- A thin **ring of small golden runes** (original glyph shapes, 12–16
  characters) **turning inside each iris**, along the darker outer ring.
- The rotation is slow (one revolution per ~2 s) and drawn as a composite
  overlay, not by hand per frame.
- The iris brightens to its highlight colour during the effect, plus a
  single soft halo pulse behind her head.
- Duration in Ep01: sh100, f600–630.
- **It stays within her eyes.** No beams, no projection onto Aether and no
  display of his abilities. It shows that she *knows*, not what she knows.

---

## 8. Model sheets required before animation (gate G4)

Save to `art/characters/elaria/model-sheets/`.

| Sheet | Contents | Needed for |
|---|---|---|
| `elaria_turnaround` | Front, 3/4 front L & R, side, 3/4 back, back. Guide lines. Hair and robe at rest *and* in the floating state | All shots |
| `elaria_head_angles` | Front, 3/4 front L, 3/4 front R, **low-angle front**, profile | sh080, sh100, sh120, sh140 |
| `elaria_expressions` | EL-01 to EL-04 (storyboard §0.3) | All Elaria shots |
| `elaria_eye_detail` | Slow blink (5 stages), eye opening (3), Divine Knowledge rune ring design | sh080, sh100 |
| `elaria_mouth_chart` | 7 shapes `M A E O T F X` × 2 angles (low-angle front, 3/4 front L) | sh080, sh100, sh120, sh140 |
| `elaria_hands` | Open palm offered (palm up), raised blessing palm, hand holding Aether's | sh120, sh140 |
| `elaria_flow_cycle` | 6-drawing hair + robe flow cycle on 3s (front 3/4 and low angle) | sh080–sh140 |
| `elaria_materialize` | 6 silhouette matte stages (feet → head) | sh080 |
| `elaria_magic_circle` | Golden magic circle design (original geometry, top view + perspective) | sh140 |
| `elaria_colour_model` | Standard + 2 lighting variants as `.gpl` palettes | All shots |

---

## 9. Consistency checks specific to Elaria

- [ ] Hair reaches her ankles and is never shorter.
- [ ] 3 floating strands present in every drawing.
- [ ] Circlet gem centred on her brow.
- [ ] Eyes gold, never orange or yellow-green.
- [ ] Feet never touch the surface (2–4 px hover plus contact glow).
- [ ] Blinks are slow (10–12 frames).
- [ ] Smile appears after her line, not during it.
- [ ] No backstory hints (no age markers, no heraldry, no origin symbols).
