# Ep01 — Background & Environment Design Spec

> **Status: written specification only. No backgrounds have been painted.**
> General rules: `docs/style-guide.md` §3 (depth layers, margins,
> perspective). Every background is painted in Krita and exported as one PNG
> per depth layer: `<set>_<plate>_far|mid|near|fg.png`. Add a glow-layer PNG
> (`_glow.png`) where lights exist (style guide §4.1).

## Overview

| Set | Plate | Used in | Canvas (px) | Layers |
|---|---|---|---|---|
| BG01 Cosmos | A — starfield push | sh010 | 2400 × 1350 | far, mid, near, fg (dust), glow |
| BG01 Cosmos | B — speed plate | sh150 | 2400 × 1350 | 3 star layers, glow |
| BG02 City rain | A — street high angle | sh020 | 2300 × 1300 (track right) | far (neon skyline), mid (street), near (umbrella crowd), fg (rain sheet), glow |
| BG02 City rain | B — defocused street | sh030, sh040 | 2112 × 1188 | single blurred layer + glow (bokeh) |
| BG03 Astral Nexus | A — crane plate (tall) | sh060 | 2112 × **2800** (crane up) | far (galaxies), mid (islands), near (platform), fg (motes), glow |
| BG03 Astral Nexus | B — platform eye-level | sh070, sh090, sh110, sh130 | 2112 × 1188 | far, mid, near, glow |
| BG03 Astral Nexus | C — celestial arch, low angle | sh080, sh100 (defocused) | 2112 × 1500 (tilt up) | far, mid (arch), near (platform edge), glow |
| BG03 Astral Nexus | D — horizon two-shot | sh120, sh140 | 2400 × 1350 (arc + pull-back) | far, mid, near, fg (out-of-focus shoulder area left clear), glow |
| BG04 Birth room | A — soft room | sh160, sh170 | 2112 × 1188 | far (window light), mid (room), near (blanket), glow (sunbeam) |

All canvases are at least 10% larger than 1920 × 1080 for camera shake.
Pans and cranes add the travel distance from `shotlist.yaml`.

---

## BG01 — Cosmos (opening and the journey)

**Mood:** vast, quiet, sacred. The calm before memory.
- **Palette:** near-black `#05050F` → deep indigo `#0B0B2A`, nebula wisps in
  violet `#3B2A6E` and blue `#2F5FB3`, star cores white `#FFFFFF` with warm
  `#FFE3A3` halos.
- **Plate A:** sparse stars (fewer is more cinematic), one faint nebula
  ribbon diagonally from lower left to upper right, a clear centre for the
  igniting star. Dust in the foreground layer.
- **Plate B:** denser stars arranged radially from the centre, ready to be
  stretched by speed. Brighter galaxies at the edges.
- **No** recognisable real constellations or famous nebula photos. All
  painted originals.

---

## BG02 — City in the rain (previous life)

**Mood:** lonely, cold, routine. A world that doesn't notice him.
- **Location:** a generic modern city street at night after work: wide
  pedestrian crossing, shopfronts, an overhead metro or flyover in the far
  layer. Culturally neutral to slightly Indian-urban (a chai-stall awning, a
  rickshaw silhouette far away) is welcome but optional. **No real brands,
  logos or legible shop names.** Signs use generic words in Devanagari or
  Latin script, such as "चाय", "OPEN" or "CAFÉ".
- **Palette:** cold blue-grey base `#1C2433` / `#2C3A52`, wet asphalt
  `#141821` with reflections, neon accents magenta `#FF3FA4` and cyan
  `#3FE0FF` kept small. Window gold `#F2C46B` sparingly.
- **Light:** streetlight from top-left (cold), neon rims, reflections on the
  ground (in compositing: a flipped, blurred, streaked copy of the plate).
- **Plate A layers:** far skyline with lit windows (glow layer pair), mid
  street and crossing, near umbrella crowd (separate drawn cycle, 4
  drawings), fg rain sheet (composite).
- **Plate B:** the same street defocused into large bokeh circles. Paint it
  intentionally soft. Don't blur a sharp plate in compositing; it reads
  cheaper.

---

## BG03 — Astral Nexus (main set)

**Canon:** infinite cosmic realm; galaxies, stars, floating islands,
celestial structures; **blue, violet, silver and golden** atmosphere.

**Mood:** awe, peace, sacredness, scale. It should feel like the most
beautiful place Aether has ever seen.

### Design language
- **Floating islands:** inverted-cone rock bases with crystal veins (silver
  `#C9D3E8`), soft blue grass or moss on top, **waterfalls of light**
  pouring off their edges and dissolving into stardust.
- **Celestial structures:** thin **silver arches**, broken ring segments and
  slender spires, floating without supports. Clean, elegant, ancient.
  Geometric with gold inlay lines `#F2C14E`. They're original and not modelled
  on any real temple or existing franchise architecture.
- **Platform:** a hexagonal crystal platform where Aether wakes: translucent
  silver-blue with faint inner light lines. It hovers too, with a soft glow
  beneath.
- **Sky:** layered galaxies (spiral and irregular), violet-blue nebula
  clouds lit from within, star fields at 3 depths.
- **Palette:**

| Role | Colour |
|---|---|
| Deep space | `#0B0B2A` |
| Violet nebula | `#3B2A6E` / `#6A4BB3` |
| Blue nebula | `#2F5FB3` / `#5C8FE0` |
| Silver structures | `#C9D3E8` / shadow `#7E8AB0` |
| Gold accents / light | `#F2C14E` / `#FFD36B` |
| Light waterfalls | `#BFE6FF` → white |

- **Light:** ambient blue-violet. A silver key from the upper left in Aether
  shots. **After Elaria appears (from sh070), a warm gold source joins from
  her direction.** The background glow layer carries her golden light
  through SC4–SC8.

### Plates
- **A — Crane plate (sh060):** bottom of canvas: platform with Aether's
  position marked in layout. Middle: islands at three distances. Top:
  galaxy-filled sky. The vertical composition must stay beautiful at
  every crane position. Check frames at 0%, 50% and 100% of the crane travel
  in layout.
- **B — Platform eye-level (sh070–sh130 Aether shots):** a soft horizon of
  islands and arches, slightly defocused in the mid and far layers so the
  character reads clearly.
- **C — Celestial arch, low angle (sh080):** a large silver arch behind
  Elaria's position, framing her like a halo. The gold glow layer is
  behind the arch opening.
- **D — Horizon two-shot (sh120, sh140):** wide, symmetrical horizon with a
  great spiral galaxy low on the horizon between the two characters.
  Leave the magic-circle area on the platform clean.

---

## BG04 — Birth room (new world, final scene)

**Mood:** warm, safe, intimate, new. A deliberate contrast to the cold city.
- **Rule:** keep it **soft-focus and unspecific**. Don't design the new
  world's architecture or culture in detail yet; that belongs to later
  episodes.
- **Elements:** a wooden window frame (frame left), morning sunbeam with dust
  motes, a soft cream blanket, a hint of wooden beams. Warm blurred shapes
  only.
- **Palette:** cream `#F3E9D8`, warm wood `#A06A3C` / `#6E4526`, sunlight
  `#FFE3A3`, soft shadow `#C9A98A`.
- **Light:** morning sun from frame left, strong bloom, glow layer for the
  sunbeam.

---

## Delivery checklist (per plate)

- [ ] Layout drawing approved for every shot that uses the plate.
- [ ] Perspective and horizon match the layout.
- [ ] Canvas includes camera travel plus a 10% margin.
- [ ] Layers separated (far / mid / near / fg) and exported as PNG RGBA.
- [ ] Glow layer exported for every light source.
- [ ] No text, brand or logo that could be read as real.
- [ ] `.kra` source saved (or stored off-repo per `docs/pipeline.md` §8).
