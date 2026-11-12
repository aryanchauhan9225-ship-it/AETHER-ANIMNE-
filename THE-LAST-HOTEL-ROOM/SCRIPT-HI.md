# THE LAST HOTEL ROOM — Hindi voice script

Voices: Kokoro (offline, through Lemo-Opuscar `core/tts/tts.py`), Hindi voices `hm_omega` (the guard) and `hm_psi`
(the voice behind him). Every line transcribed back by Whisper (`asr_check.py --lang hi --model small`): 0 mismatches.
To replace with human actors, record the same lines (WAV, mono) as `voices/g1.wav`, `voices/g2.wav`, `voices/v1.wav`
and rebuild; timing adapts to the new lengths.

| ID | Time | Speaker | Hindi (spoken) | Caption (on screen) | Delivery |
|---|---|---|---|---|---|
| g1 | 3.25 s | Guard (behind the camera) | तीन सौ नौ... की लाइट? | *Tees sau nau... ki light?* | Whispered, disbelief; close-mic, breath |
| g2 | 22.60 s | Guard | कोई है? | *Koi hai?* | Barely voiced, to the open door |
| v1 | 35.25 s | The voice behind him | सर... आप इतनी देर से बाहर क्यों खड़े हैं? | Sir... aap itni der se bahar kyun khade hain? | Calm, polite, close behind his left shoulder, dry |

SDH captions (CEA-608 style): `[HEAVY RAIN]` · `[CLOCK TICKING]` · `[LIGHTS FLICKER]` · `[OLD WALTZ ON A RADIO]` ·
`[TELEPHONE RINGING]` · `[SILENCE]`. Exported as `THE-LAST-HOTEL-ROOM.srt`.

End title (camcorder title generator, on black): **ROOM 309** / **CHECK-IN NEVER ENDS**.
