# AETHER Ep01 — Hindi Voice Acting & Lip-Sync Guide

> Script: `story/ep01/script.hi.md` · Timing: `story/ep01/shotlist.yaml`
> Mouth shapes: `docs/pipeline.md` §6 (`M A E O T F X`)
> **Status: guide only. No voices have been recorded.**

---

## 1. Casting

| Role | Voice | Lines | Casting notes |
|---|---|---|---|
| **Aether** (adult, narration, on-screen and inner voice) | Male, 24–30 sound, light baritone / high-mid | N1, N2a, N2b, L01, L02, L04, L06, L08, L10 | Needs to do warmth, dry humour and a real emotional crack. Natural, not "dubbing-voice" theatrical. One actor for all three Aether modes |
| **Elaria** | Female, ageless, low-mid range | L03, L05, L07, L09 | Calm, unhurried and soft but present. Never breathy-seductive or theatrical-goddess loud. Think of a kind teacher who knows everything |
| **Baby** | Newborn cry (SFX) | — | Licensed recording or a recorded real baby with parental consent. Not performed by an adult |

**Consent:** written consent from every performer for use in AETHER, including
online release and future episodes. If AI voices are ever used, record the
service, its terms and any voice-owner consent in `docs/credits.md` §3.

---

## 2. Recording specification

| Setting | Value |
|---|---|
| Format | WAV, **48 kHz, 24-bit, mono** |
| Level | Peaks around −6 dBFS, average about −18 dBFS. Never clip |
| Mic | Any decent cardioid (USB is acceptable), 15–20 cm from the mouth, pop filter, slightly off-axis |
| Room | Quiet and soft (clothes, curtains, blankets). No fans or AC. Phone silenced |
| Takes | **At least 3 takes per line**, plus 1 "alt" take with a different reading |
| Room tone | 10 s of silence in the same setup, recorded each session |
| Monitoring | Closed headphones. The director listens live if possible |
| Reverb | **None while recording.** Elaria's divine space is added in the mix |
| File name | `<shot>_<character>_t<take>.wav`, e.g. `sh080_elaria_t02.wav`. V.O. lines use the shot of their first frame: `sh010_aether_t01.wav` |
| Location | `audio/ep01/dialogue/` (selected takes) |

**Clean-up in Audacity (light touch):** high-pass at 80 Hz, gentle noise
reduction using the room tone, remove clicks, and trim with **6 frames
(250 ms) of room tone** before and after. No compression or EQ beyond that;
mixing happens later.

---

## 3. Hindi pronunciation notes

| Word | Watch for |
|---|---|
| **आखिरकार** | Aspirated **ख** (kh). Long आ at the start. Stress on **का**: aa-khir-**KAA**-r |
| **पहुँच** | Nasal **ँ** on हुँ (pa-**huñ**-ch). Don't drop the nasal |
| **यहाँ / कहाँ / माँ** | Nasalised long आ (aañ). Clear but not exaggerated |
| **छब्बीस** | Aspirated **छ** (chh) and double ब (bb): chha**bb**ees |
| **ऑफ़िस** | Open ऑ (as in English "off") and **फ़** (f, not ph) |
| **समाप्त** | Clear **प्त** cluster at the end: sa-maa-pt. Elaria says it softly but fully |
| **मौका** | औ as "au" (mau-kaa) |
| **जिऊँगा** | ji-**ooñ**-gaa. Nasal long ऊ. Natural spoken form; don't over-articulate |
| **शुरुआत** | **श** (sh), not स: shu-ru-aat |
| **ओर** | Pure ओ (o), not "aur" |

---

## 4. Line-by-line direction

`Window` = the maximum time from the shot list. Finishing earlier is fine;
running over is not.

| ID | Speaker | Window | Direction |
|---|---|---|---|
| **N1** | Aether V.O. | 3.42 s | Intimate and close to the mic, like a thought said aloud at night. Pause after "कहते हैं...". Slight warmth on "नई शुरुआत". **Don't** do a trailer voice |
| **N2a** | Aether V.O. | 2.33 s | Tired, a little self-mocking. "छब्बीस साल..." with a small exhale; "बस भागता रहा" flat, almost a shrug |
| **N2b** | Aether V.O. | 2.08 s | Heavier. A small catch before "कभी". The regret line, so keep it understated |
| **L01** | Aether | 1.50 s | Breathless, disoriented wonder. A short pause after "ये...". Rising question |
| **L02** | Aether | 1.08 s | **Deadpan**, under his breath, almost to himself. The humour comes from understatement. Don't push the joke |
| **L03** | Elaria | 2.50 s | **Canon line.** Calm and warm, as if she has waited a very long time and is quietly glad. A long pause after "आखिरकार...". "पहुँच ही गए" is soft with a gentle smile in the voice. No grandeur |
| **L04** | Aether | 1.75 s | Starts with a half-laugh ("पहुँच गया...?"), then slows as it dawns on him. "मैं..." trails off unfinished |
| **L05** | Elaria | 3.17 s | Gentle certainty. A soft "हाँ।" and a pause. "समाप्त हो चुका है" is kind, not cold, like telling someone bad news you wish you didn't have to |
| **L06** | Aether | 0.83 s | A whisper that breaks. Almost no voice, mostly breath. The most important emotional line; **record many takes** |
| **L07** | Elaria | 3.42 s | Curious and inviting, no pressure. A pause after "मिले...". The question at the end is genuinely open |
| **L08** | Aether | 2.42 s | Smiling through tears. "इस बार..." with a small laugh-breath, then **steady resolve** on "हर पल खुलकर जिऊँगा". Not shouting, but certain |
| **L09** | Elaria | 2.42 s | A blessing. "तो जाओ..." softly, then warm and lifting on "नई शुरुआत की ओर" |
| **L10** | Aether inner | 1.58 s | Stunned → comic panic. "...रुको।" flat and confused, a pause, then "मैं... बच्चा बन गया?!" rising in disbelief. Recorded close and dry; it's processed as inner voice in the mix |

**Also record:** Aether breaths and efforts (waking gasp for sh050, the
laugh-breath for sh130, a sharp inhale for sh040), and Elaria's soft hum
or exhale (optional, for sh080). Name them `<shot>_<character>_efx_t<n>.wav`.

---

## 5. Lip-sync workflow

### 5.1 Which lines are lip-synced

| Line | Shot | On-screen mouth | Mouth set |
|---|---|---|---|
| N1, N2a, N2b | sh010–sh030 | No (voice-over) | — |
| L01, L02 | sh060 | Yes, wide shot | **3-shape flap** `X T A` |
| L03 | sh080 | Yes, low-angle medium | Full 7, Elaria low-angle chart |
| L04 | sh090 | Yes, MCU | Full 7, Aether 3/4 R |
| L05 | sh100 | Yes, CU | Full 7, Elaria 3/4 L |
| L06 | sh110 | Yes, ECU | Full 7 (mostly `M` → `A` → hold) |
| L07 | sh120 | Yes, medium (over the shoulder) | Full 7, Elaria 3/4 L |
| L08 | sh130 | Yes, MCU | Full 7, Aether 3/4 R |
| L09 | sh140 | Yes, wide profile | 3-shape flap `X T A` |
| L10 | sh160 | No (inner voice). Baby's mouth stays closed or opens only for the cry | — |

### 5.2 Steps

1. **Pick the final take** per line and place it at the shot-list start
   frame.
2. **Draft timing with Rhubarb Lip Sync** (after tool approval, gate G3),
   using its language-independent *phonetic* recognizer. Check the exact
   options with `rhubarb --help` once it's installed.
3. **Convert** Rhubarb's shapes to the AETHER set:

   | Rhubarb | Meaning | AETHER |
   |---|---|---|
   | A | Closed (P, B, M) | `M` |
   | B | Slightly open, teeth (most consonants, EE) | `T` |
   | C | Open (EH, AE) | `E` |
   | D | Wide open (AA) | `A` |
   | E | Slightly rounded (AO, ER) | `O` |
   | F | Puckered (UW, OW, W) | `O` |
   | G | Upper teeth on lower lip (F, V) | `F` |
   | H | Tongue visible (L) | `T` |
   | X | Rest / silence | `X` |

4. **Correct by hand** against the Hindi text, using the key shapes in §6.
   Rhubarb is trained on English, so it often misses Hindi long vowels and
   nasal vowels.
5. **Apply anime timing rules:**
   - Mouth changes land on a **2-frame grid** in close-ups and a
     **3-frame grid** in wide shots.
   - Hold each shape for **at least 2 frames**. Drop any shape held for 1 frame.
   - Every **प फ ब भ म** must close fully (`M`) for at least 2 frames.
     These are the closures audiences notice.
   - **ह** keeps the previous vowel's shape (breathy).
   - Aspirated and plain consonants use the same shape (ख = क = `T`).
   - Shift the mouth **1–2 frames earlier** than the sound. It reads as
     more in sync on screen.
   - End every line on a held expression mouth, not on `X`.
6. **Save** to `audio/ep01/lipsync/<shot>_<character>.json`:

   ```json
   {
     "shot": "sh080",
     "character": "elaria",
     "fps": 24,
     "line": "L03",
     "mouth_set": "elaria_lowangle",
     "cues": [ { "frame": 490, "shape": "A" }, { "frame": 494, "shape": "T" } ]
   }
   ```
   Frames are episode-absolute and must fall inside the line's window.

7. **Review** in Remotion at real speed with sound, then frame by frame
   at the closures.

---

## 6. Key mouth shapes per line (manual-correction guide)

Syllable → shape. `→` means the shape changes within the syllable.
`...` = pause, which is `X` or a held expression mouth.

**L01** ये... कहाँ आ गया मैं?
`ये E` · … · `क T` `हाँ A` · `आ A` · `ग T` `या A` · `मैं M→E`

**L02** ...ऑफ़िस तो नहीं है।
`ऑ O` `फ़ि F→E` `स T` · `तो T→O` · `न T` `हीं E` · `है E`

**L03** आखिरकार... तुम यहाँ पहुँच ही गए।
`आ A` `खि T→E` `र T` `का T→A` `र T` · … · `तु T→O` `म M` · `य E` `हाँ A` · `प M` `हुँ O` `च T` · `ही E` · `ग T` `ए E`

**L04** पहुँच गया...? मतलब... मैं...
`प M` `हुँ O` `च T` · `ग T` `या A` · … · `म M` `त T` `ल T` `ब M` · … · `मैं M→E` (trail to X)

**L05** हाँ। तुम्हारा पिछला जीवन... समाप्त हो चुका है।
`हाँ A` · … · `तु T→O` `म्हा M→A` `रा T→A` · `पि M→E` `छ T` `ला T→A` · `जी T→E` `व F` `न T` · … · `स T` `मा M→A` `प्त M→T` · `हो O` · `चु T→O` `का T→A` · `है E`

**L06** माँ...
`म M` (hold 3 frames) → `A` (hold, soften toward `X` over 8 frames)

**L07** अगर तुम्हें एक और मौका मिले... तो क्या करोगे?
`अ A` `ग T` `र T` · `तु T→O` `म्हें M→E` · `ए E` `क T` · `औ O` `र T` · `मौ M→O` `का T→A` · `मि M→E` `ले T→E` · … · `तो T→O` · `क्या T→A` · `क T` `रो T→O` `गे T→E`

**L08** इस बार... हर पल खुलकर जिऊँगा।
`इ E` `स T` · `बा M→A` `र T` · … · `ह A` `र T` · `प M` `ल T→A` · `खु T→O` `ल T` `क T` `र T` · `जि T→E` `ऊँ O` `गा T→A`

**L09** तो जाओ... अपनी नई शुरुआत की ओर। *(3-shape flap in wide shot: use `A` for open vowels, `T` for everything else, `X` at pauses)*
`तो T→O` · `जा T→A` `ओ O` · … · `अ A` `प M` `नी T→E` · `न T` `ई E` · `शु T→O` `रु T→O` `आ A` `त T` · `की T→E` · `ओ O` `र T`

---

## 7. Voice mix notes

| Voice | Treatment |
|---|---|
| Aether V.O. (N1–N2b) | Dry and intimate, very slight room. Sits 2 dB louder than on-screen dialogue |
| Aether on screen (Nexus) | Light, airy reverb (short, bright) for the open cosmic space |
| Elaria | The same Nexus reverb plus a subtle **second layer**: a soft octave-up shimmer at −24 dB, or a gentle chorus. Divine but still human and intelligible |
| Aether inner (L10) | Dry, close, slightly low-passed (~8 kHz), centred. Sounds like it's "inside the head" |
| All dialogue | Compress lightly (2:1 to 3:1). Voices sit ~10 dB above the music; the music ducks under lines |
