# THE LAST HOTEL ROOM — sound design notes

Rule of the style: **only what the tape would have recorded** — no score. Suspense comes from a slowly rising drone,
the room's own sounds, an in-world waltz on a radio, and true silence. Everything is timed from the picture's own
event list (`events.json`), so every sound sits on its frame. Master: two-pass loudnorm to −14 LUFS (Lemo `mux.sh`).

| Time (s) | Layer | What you hear |
|---|---|---|
| 0.15 | Camcorder | REC clack + tape motor |
| 0.4–7.2 | Ambience | Heavy rain (wideband noise + random drops, stereo), gutter run-off |
| 0.9 / 1.45 | FX | Lightning crack, then a long thunder roll |
| 0.8–2.3 | Foley | Wet-stone steps |
| 2.6 | — | (the window clicks on — silence in the sound, the picture carries it) |
| 3.25 | Voice | Guard whisper g1 (close-mic, breath layer) |
| 3.7 / 12.0 / 32.0 | Camcorder | Zoom servo whine + autofocus ticks |
| 6.95, 13.35 | Tape | Tracking-tear noise bursts (cuts) |
| 7.5–13.3 | Ambience / FX | Rain muffled through glass; grandfather clock ticking at 1 Hz in a reverberant hall; marble steps |
| 13.6–33.7 | Ambience | Sconce ballast hum (100 Hz + harmonics), gated by the three blackouts at 16.9 s |
| 14.5–33.7 | Drone | Low brown-noise band + beating sines at 55 / 55.7 Hz, rising slowly, **cut dead with the phone** |
| 14.2–33.0 | Breath | Guard's breathing, faster and louder as fear rises |
| 21–33.7 | FX | Room clock ticking behind the door (quiet, then clear once the door opens) |
| 22.6 | Voice | Guard g2 "Koi hai?" |
| 25.4 | FX | Latch click, slow stick-slip hinge creak |
| 25.7–33.72 | Music (in-world) | Original 3/4 waltz (sampled strings + pizzicato + harp) through a small radio speaker, fading in with the door, **stopping mid-phrase with the phone** |
| 27.0–33.72 | FX | British-style double ring: two bells struck at 20 Hz, cut mid-ring |
| **33.75–35.1** | — | **Digital silence** (0 samples, tails included): the held breath |
| 35.25 | Voice | v1, close, warm, dry, slightly left-behind |
| 38.55 | Foley | Clothing rustle (he starts to turn), one shaky exhale |
| 39.4 | Camcorder | REC off clunk; then silence |
| 40.0–41.9 | Title | Camcorder title-generator beeps per character |

Mix targets: voices on top; drone and ambience ~8–10 dB under the voices; limiter at −0.4 dBFS before mastering;
final −14 LUFS, true peak ≤ −1 dBTP.
