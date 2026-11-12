# AETHER Ep01 — Master Timeline (50.000 s)

24 fps · 1,200 frames · source of truth: `shotlist.yaml`.
Frame ranges are `[start, end)`. Timecodes are `s` from episode start.

---

## 1. Scene timeline

| Scene | Story beat (approved) | Start | End | Duration | Frames |
|---|---|---|---|---|---|
| SC1 | 1. Cinematic narration opening | 0.00 | 4.00 | 4.0 s | 0–96 |
| SC2 | 2. Previous life & regrets | 4.00 | 11.00 | 7.0 s | 96–264 |
| SC3 | 3. Aether awakens in Astral Nexus | 11.00 | 17.00 | 6.0 s | 264–408 |
| SC4 | 4–5. Elaria materializes · her first line | 17.00 | 23.00 | 6.0 s | 408–552 |
| SC5 | 6. He learns his previous life has ended | 23.00 | 31.00 | 8.0 s | 552–744 |
| SC6 | 7. "What would you do with another chance?" | 31.00 | 35.50 | 4.5 s | 744–852 |
| SC7 | 8. He accepts | 35.50 | 40.00 | 4.5 s | 852–960 |
| SC8 | 9. Elaria sends him to a new world | 40.00 | 44.50 | 4.5 s | 960–1068 |
| SC9 | 10. Born as a baby + title | 44.50 | 50.00 | 5.5 s | 1068–1200 |
| | **Total** | | | **50.0 s** | **1,200** |

The longest scene is SC5, the emotional centre, so it gets the most room.
SC2 runs 7 s so the regret has time to land before the white-out.

---

## 2. Shot timeline

| Shot | Scene | In (s) | Out (s) | Dur | Frames | Level | Framing | Dialogue |
|---|---|---|---|---|---|---|---|---|
| sh010 | SC1 | 0.00 | 4.00 | 4.0 | 0–96 | C | Extreme wide, cosmos | N1 (V.O.) |
| sh020 | SC2 | 4.00 | 7.00 | 3.0 | 96–168 | B | Wide high angle, rainy street | N2a (V.O.) |
| sh030 | SC2 | 7.00 | 9.50 | 2.5 | 168–228 | B | Insert: phone | N2b (V.O.) |
| sh040 | SC2 | 9.50 | 11.00 | 1.5 | 228–264 | **A** | MCU, white light | — |
| sh050 | SC3 | 11.00 | 13.00 | 2.0 | 264–312 | **A** | ECU eye opens | — |
| sh060 | SC3 | 13.00 | 17.00 | 4.0 | 312–408 | C | Crane-up reveal | L01, L02 |
| sh070 | SC4 | 17.00 | 19.00 | 2.0 | 408–456 | **A** | MCU head turn | — |
| sh080 | SC4 | 19.00 | 23.00 | 4.0 | 456–552 | B | Low angle, Elaria forms | **L03** |
| sh090 | SC5 | 23.00 | 25.00 | 2.0 | 552–600 | B | MCU Aether | L04 |
| sh100 | SC5 | 25.00 | 28.50 | 3.5 | 600–684 | B | CU Elaria, Divine Knowledge | L05 |
| sh110 | SC5 | 28.50 | 31.00 | 2.5 | 684–744 | **A** | ECU tear | L06 |
| sh120 | SC6 | 31.00 | 35.50 | 4.5 | 744–852 | B | Over-the-shoulder on Elaria | L07 |
| sh130 | SC7 | 35.50 | 40.00 | 4.5 | 852–960 | **A**/B | MCU → medium | L08 |
| sh140 | SC8 | 40.00 | 43.00 | 3.0 | 960–1032 | B | Wide two-shot, magic circle | L09 |
| sh150 | SC8 | 43.00 | 44.50 | 1.5 | 1032–1068 | C | Light-streak travel | — |
| sh160 | SC9 | 44.50 | 47.50 | 3.0 | 1068–1140 | B | Baby POV → CU | L10 (inner) |
| sh170 | SC9 | 47.50 | 50.00 | 2.5 | 1140–1200 | C | Pull-back + title | — |

17 shots, averaging 2.9 s. That's a typical TV-anime cutting rhythm, with
the longer shots saved for dialogue and emotion.

---

## 3. Dialogue windows

The **window** is the longest time the line may occupy. Actors may finish
early; they may not run over.

| ID | Speaker | Start → End (s) | Frames | Window |
|---|---|---|---|---|
| N1 | Aether V.O. | 0.50 → 3.92 | 12–94 | 3.42 s |
| N2a | Aether V.O. | 4.33 → 6.67 | 104–160 | 2.33 s |
| N2b | Aether V.O. | 7.17 → 9.25 | 172–222 | 2.08 s |
| L01 | Aether | 13.92 → 15.42 | 334–370 | 1.50 s |
| L02 | Aether | 15.75 → 16.83 | 378–404 | 1.08 s |
| L03 | Elaria | 20.42 → 22.92 | 490–550 | 2.50 s |
| L04 | Aether | 23.17 → 24.92 | 556–598 | 1.75 s |
| L05 | Elaria | 25.25 → 28.42 | 606–682 | 3.17 s |
| L06 | Aether | 29.83 → 30.67 | 716–736 | 0.83 s |
| L07 | Elaria | 31.58 → 35.00 | 758–840 | 3.42 s |
| L08 | Aether | 36.67 → 39.08 | 880–938 | 2.42 s |
| L09 | Elaria | 40.25 → 42.67 | 966–1024 | 2.42 s |
| L10 | Aether inner | 45.83 → 47.42 | 1100–1138 | 1.58 s |

Spoken time adds up to about **28 s** of the 50 s. The rest is silence,
music, sound effects and acting.

**When the final recordings come in:** the real line lengths replace these
windows in `shotlist.yaml` at the animatic stage (gate G5, timing lock).
If a natural reading doesn't fit, adjust neighbouring shot lengths by ±6
frames. Don't speed up the actor.

---

## 4. Animation level and drawing budget

| Level | Shots | Screen time |
|---|---|---|
| A | sh040, sh050, sh070, sh110, sh130 (first ~2 s) | ≈ 10 s |
| B | sh020, sh030, sh080, sh090, sh100, sh120, sh130 (rest), sh140, sh160 | ≈ 28 s |
| C | sh010, sh060, sh150, sh170 | ≈ 12 s |

Estimated **new drawings** per shot (character + drawn FX):

| Shot | Est. drawings | What |
|---|---|---|
| sh010 | 6 | Star-ignition flare (drawn FX) |
| sh020 | 12 | Side walk cycle (8, on 2s, looped) + umbrella-crowd cycle (4) |
| sh030 | 6 | Thumb hover → press |
| sh040 | 14 | Head turn (6), eyes widen (3), hair/rain freeze (5) |
| sh050 | 10 | Lash tremble (2), eye opening (3), blink (3), iris focus (2) |
| sh060 | 14 | Sit-up keys on 3s (6), look L/R (4), chest pat (4) |
| sh070 | 16 | Head turn (8), cheek-touch reaction (2), drawn particles (6) |
| sh080 | 17 | Forming silhouettes (6), hair/robe settle cycle (6), eye open (3), smile (2) |
| sh090 | 6 | Half-smile → realization |
| sh100 | 7 | Nod (4), eyes soften (3). Runes are a composite effect |
| sh110 | 18 | Eye tremble (4), tear on 2s (8), lips part (3), breath (3) |
| sh120 | 12 | Elaria glide/bend/hand (10), Aether shoulder (2) |
| sh130 | 22 | Wrist wipe (8), laugh (4), grin → resolve (6), hand take (4) |
| sh140 | 18 | Palm raise (5), nod (3), dissolve mattes (6), magic circle (4) |
| sh150 | 4 | Speed-line drawings |
| sh160 | 12 | Hand grasp (6), eye open (3), blink (3) |
| sh170 | 7 | Blinks (3), sneeze twitch (4) |
| **Mouth library** | 35 | Aether 3 angles × 7 shapes + Elaria 2 angles × 7 shapes |
| **Total** | **≈ 236** | Within the approved 210–280 budget |
