# THE LAST TRAIN — आखिरी ट्रेन

Vertical sci-fi mystery short. **72 s, 1080×1920, 24 fps.** It has no branding of any kind.

## How it's built
- **Toolkit:** built on the Lemo-Opuscar render pipeline with the library's three.js (0.170). The post chain comes from the moon reel, re-implemented here: HalfFloat MSAA composer, bloom, a blue-black and gold grade, film grain, and a clamp against runaway highlights.
- **Station:** concrete platform with a safety stripe, canopy on iron columns, a building wall with a notice board ("प्लेटफ़ॉर्म 1 · PLATFORM 1"), benches. The track has ballast, instanced sleepers and two rails.
- **Station lamps:** five, two of which flicker, with fake volumetric light cones.
- **Station clock:** a double-faced clock with real hands (12:07, then 12:08 at 63.8 s).
- **Station atmosphere:** papers tumbling in the wind, drifting mist sheets, floating motes, exponential fog that surges as the train vanishes.
- **Train:** a locomotive with a headlight (sprite flare, spotlight, beam) and three oxblood coaches with brass trim and warm lit windows. Its wheels turn with distance travelled. It arrives on a braking curve, stops with coach 1's door at the man, the door slides open, and later it accelerates into the fog.
- **Coach interior:** wood floor, cream walls and ceiling, velvet facing seats, brass luggage racks, five globe lamps, dust. The window bay at x = 2.6 has a dark glass pane and a condensation layer drawn on a canvas.
- **The message:** "DON'T MISS / YOUR NEXT / TRAIN." is wiped into the condensation stroke by stroke, with drips. The reflection's fingertip follows the writing point.
- **Character:** one rig in a dark winter jacket (quilt seams, collar, zip) and trousers. It has a walk cycle, two-bone arm IK for the pickup, hold and writing, and a face rig (gaze, blink, brows, wide eyes, open mouth).
- **The older self:** the same rig with grey hair, grey stubble, forehead lines, crow's feet and eye bags.
- **The reflection:** the older rig is placed as a true mirror image of him across the glass: z → 2·z_glass − z, heading → −heading, scale z = −1. It is lit by a mirrored key light and copies his pose exactly until 44 s, when it raises its own hand and writes. At 51.4 s he steps back and it does not.
- **The ending:** on the platform he is still holding the brass clock from the train.

## Narration
Kokoro `hm_omega`, verbatim from the brief. "Don't miss your next train." is generated in English mode. All lines pass the Whisper check.

| Line | n1 | n2 | n3 | n4 | n5 | n6 | n7 | n8 | n9 | n10 | n11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Start (s) | 2.0 | 11.0 | 14.4 | 21.5 | 27.0 | 31.6 | 37.6 | 44.3 | 50.8 | 58.0 | 61.2 |

## Honest limits
The character is built from geometric primitives (capsules and spheres with a painted face texture). The blink, gaze, brows and mouth animate, but up close the face reads as a stylised mannequin, not a realistic human. The camera keeps faces at medium distance for that reason.
