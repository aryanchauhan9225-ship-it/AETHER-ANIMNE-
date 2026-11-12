# THE LAST HOTEL ROOM — treatment

**Style:** Liminal Found Footage (`backrooms`, Lemo-Opuscar). STYLE.md kept, with one change forced by the
delivery: **frame 1080×1920 (9:16, Instagram Reels)** instead of 4:3 pillarboxed in 16:9. The camcorder image
fills the vertical frame; the 3D is rendered at low resolution and upscaled by the VHS pass, as the style asks.
**Length:** 43.0 s (1,032 frames at 24 fps). **Language:** Hindi voice; captions in the Latin-script Hindi the
brief was written in (CEA-608 style, monospace), so every caption matches the brief's text exactly.
**No image generator** is available (Codex CLI not installed, by the user's decision), so every picture is real-time
3D drawn in code (three.js) through the style's VHS camcorder pass. No people are drawn: the guard is the camera.

## 1. Three candidate structures

1. **Night-watch log (chosen).** One tape, recorded by the guard on his round: rain outside → lobby → stairs/corridor
   → Room 309. Tape tears are the cuts. Ends when the tape stops.
2. **Two tapes.** Tape 1: the guard's routine round, Room 309 dark. Tape 2, same route, the light is on. Strong
   but needs ~70 s to read; too long for a Reel.
3. **The camera left behind.** The camera is set down outside 309 and records alone while the guard goes in; we hear
   the voice off-screen. Elegant, but loses the POV dread of the door and the table.

**Why 1:** it follows the brief's nine beats in order, fits 43 s, and every cut is a tape event (no editing
transitions), which is what makes found footage believable.

## 2. Logline and arc

A night guard films the top-floor light of a hotel that closed forty years ago, follows it to Room 309, finds dinner
laid for a guest who never arrived — and the guest speaks from behind him.
Setup (routine round in the rain) → turn (the light, the empty table, the phone stops) → ending (the voice; the tape
ends before he can turn around).

## 3. Benchmark

- **Learn from:** 1990s camcorder found-footage horror and analogue-horror shorts in general (a fixed POV,
  auto-exposure and focus hunting, sound doing the scaring, the cut-to-black ending); hotel-corridor staging of
  late-20th-century thrillers (long carpeted corridor, dead sconces, a door at the end).
- **Do not take:** any film's hotel, room numbers, corridor shots, characters, music, ghosts, logos or lines. The
  hotel, its name plate (none shown), the rooms and the dinner set are original.

## 4. Shot list (one tape; cuts are tape events)

| # | Time | What we see | Camera (POV, handheld) | Why |
|---|---|---|---|---|
| 1 | 0.0–7.2 | Tape rolls in. Heavy rain; the guard's torch beam on wet steps; the hotel façade looms, all windows dark. At 2.6 s one top-floor window flickers on, warm | Walk 3 steps, then tilt up the façade; zoom + focus hunt on the lit window | Exterior establishing + the hook within 3 s |
| 2 | 7.2–13.4 | (tracking tear) Lobby: dust sheets, reception desk, a wall clock still ticking, the key rack — every key on its hook except 309 | Slow pan off the clock along the desk to the empty hook | Reception + the clock + the first sign 309 is "occupied" |
| 3 | 13.4–21.2 | (tear) Top-floor corridor: mustard-gold wallpaper, carpet, sconces mostly dead; one door at the far end with light spilling from its gap; lights flicker once | Walking POV down the corridor, head bob; slows near the end | The slow tracking shot |
| 4 | 21.2–25.4 | The door, ajar: brass plate **309**, a blade of warm light; ticking inside; the guard whispers | Slow push-in with no footsteps | Close-up of the open door |
| 5 | 25.4–31.0 | The door swings in by itself (>1 s, eased). A table laid for two: white cloth, plates, glasses, two candles, a radio playing an old waltz faintly; the phone rings (from 27.0) | Hold, then slow pan across the table | The reveal |
| 6 | 31.0–35.0 | The **red telephone** ringing on its side table — the only saturated colour, blooming | Zoom + autofocus hunt onto the phone; at 33.6 the ringing stops mid-ring | Close-up of the phone |
| 7 | 35.0–38.4 | [SILENCE] (digital zero 33.7–35.1). Then, close behind him, a calm voice: "Sir... aap itni der se bahar kyun khade hain?" | All handheld motion **freezes** (held breath); tremor rises; the camera starts to turn — | The reaction, in POV |
| 8 | 38.4–43.0 | REC off: black. The camcorder title generator types **ROOM 309 — CHECK-IN NEVER ENDS** | — | Cut to black + title (held 4 s) |

Signature shot: 5–6, the empty table with the phone ringing. Native moves: autofocus hunting (1, 6), tape damage as
cuts (1→2→3), the OSD as plot (the date/time stamp: **12-11-1985** on the tape's own clock — the year the hotel closed
— while the guard's dialogue says it is tonight), silence, the held breath.

## 5. Beat sheet

| t (s) | Beat |
|---|---|
| 0.0 | Power-on roll-in; rain roar; REC ● 02:13 AM |
| 1.0 | Steps up to the entrance in rain; torch on wet stone |
| 2.6 | A top-floor window clicks on (hook) — guard: "Tees sau nau... ki light?" |
| 4.0–7.0 | Zoom + focus hunt on the window; tremor rises |
| 7.2 | Tracking tear → lobby; clock ticking; OSD clock has jumped |
| 9.5–12.5 | Pan to the key rack; empty hook 309 |
| 13.4 | Tear → corridor; carpet steps; fluorescent/sconce hum |
| 16.8 | Sconces flicker out ~0.1 s, exposure lags |
| 19.5 | Steps slow; the door's light blade ahead |
| 21.2 | Stop. Push-in in silence except the tick |
| 22.4 | Guard (whisper): "Koi hai?" |
| 25.4 | The door swings in; candle light and a faint waltz |
| 27.0 | Phone rings (British-style double ring, period bell) |
| 31.0 | Zoom/focus on the red phone |
| 33.6 | Ringing stops mid-ring; radio dies with it |
| 33.7–35.1 | Digital silence, held breath, picture motion frozen |
| 35.2–37.8 | The voice, close, behind left |
| 37.8–38.4 | Tremor, the camera begins to turn — REC off |
| 38.4 | Black, true silence |
| 39.0–43.0 | Title generator: ROOM 309 / CHECK-IN NEVER ENDS |

## 6. Cue map

No score (STYLE §7). Time is organised by the rain and the clock: the lobby clock ticks at 1 Hz from 7.2 s and is
heard again inside 309 (the same tick: the same clock?). The drone (brown-noise band + two beating sines, 55 / 55.7 Hz)
rises from 13.4 s to 33.6 s and stops dead with the phone. The waltz (in-world, through a radio band-pass) at 3/4,
~84 BPM, starts with the door at 25.4 and dies with the phone at 33.6.

## 7. Sound design

| Section | Ambience | Foley | In-world music / voice |
|---|---|---|---|
| 1 exterior | Heavy rain, gutter run-off, distant thunder roll at 0.6 s | Steps on wet stone, rain on a jacket, camcorder clack at power-on | Guard whisper (G1) |
| 2 lobby | Rain muffled through glass, room tone | Clock tick (1 Hz), dust-sheet rustle, shoe squeak on marble | — |
| 3 corridor | Sconce/ballast hum (gated by the light curve), muffled rain | Carpet steps (soft thud), flicker tinks, AF ticks | Drone begins |
| 4 door | Hum drops out; only the tick | Breath | Guard whisper (G2) |
| 5 reveal | Candle-quiet room tone | Hinge stick-slip (door), phone bell from 27.0 | Waltz via radio filter |
| 6 phone | — | Bell, zoom servo, AF ticks | Waltz, drone peak |
| 7 voice | **Digital silence**, then the room tone returns at 35.1 | Held breath → one shaky exhale | The voice (V1), close, dry, slightly warm |
| 8 title | True silence, one tape-stop clunk at 38.4 | Title generator typing beeps (camcorder) | — |

Silences: 33.7–35.1 (before the voice: the first sound after it is the most important line), 38.4–39.0.
Sound as transition: the rain carries over the first tear (L-cut); the clock tick is heard before the lobby
image resolves (J-cut).

## 8. Captions and title

CEA-608 style captions (IBM Plex Mono 600, white on black boxes) inside the frame above the OSD:
`[RAIN]` · `Tees sau nau... ki light?` · `[CLOCK TICKING]` · `Koi hai?` · `[PHONE RINGING]` · `[SILENCE]` ·
`Sir... aap itni der se` / `bahar kyun khade hain?`
Title: camcorder title generator font (the style's bitmap font), on black: `ROOM 309` / `CHECK-IN NEVER ENDS`.
