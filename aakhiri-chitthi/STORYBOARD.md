# आखिरी चिट्ठी — The Last Letter

Animated short, Hindi, **75 s**, 1920×1080, **60 fps** (4,500 frames). It is made with Lemo-Opuscar, **Watercolor Brush** style.

## Why Watercolor Brush

The installed styles were compared: Watercolor Brush, Gilded Illumination, Ink Wash, Impasto, Colored Pencil, Urban Sketch and Crayon Book.

Watercolor Brush fits this story best:
- warm cotton paper, transparent layered washes, and light shown as unpainted paper
- its native moves cover the film's needs:
  - **mist erase** carries the memory dissolve and the photograph opening into a world
  - **slow push into a detail** carries the letter and the photograph
  - **painted transitions** (brush-edge wipes) replace hard cuts
- 60 fps, which the style recommends for slow brushwork

The others were set aside:
- Gilded Illumination (used for the Guzarish song video) is too ornate and royal for a quiet village drama.
- Ink Wash is monochrome.
- Impasto is aimed at music videos.

Characters are painted the style's way: paper reserved, transparent multiply washes in two jittered passes with a pooled edge, and contours that are brush strokes from the engine (`mk`/`drawS`), never vector lines.

## Narration (Kokoro, all lines pass the Whisper check)

| id | start (s) | voice | line |
|---|---|---|---|
| n1 | 1.0 | narrator `hm_omega` | एक पुराना गाँव... और ढलती शाम की सुनहरी धूप। |
| n3 | 8.8 | narrator | उस शाम, पुराने डिब्बे की दरार में... एक चिट्ठी अटकी मिली। |
| n4 | 13.6 | narrator | बीस साल पुरानी। पता था... पीपल के पेड़ वाला घर। |
| n6 | 23.8 | narrator | खिड़की के पास, एक बूढ़ी अम्मा अकेली बैठी थीं। |
| n7 | 28.5 | narrator | लिखावट देखते ही, उन्होंने पहचान लिया... ये बाबूजी की चिट्ठी थी। |
| l1, l2 | 36.8, 44.6 | the father `hm_psi` (more room on the voice) | the letter, exactly as written in the brief |
| w1 | 53.2 | Amma `hf_beta` | काश... ये चिट्ठी थोड़ी पहले मिल जाती। |
| f1–f3 | 57.4, 62.0, 66.9 | narrator | the final narration, exactly as written in the brief |

The letter, Amma's line and the final narration are verbatim and set the length. At an unhurried pace they bring the film to 75 s rather than 70.

## Scenes

1. **0–8 · The old village at sunset.**
   - A street of lime-washed houses, a temple spire, the great peepal with leaves fluttering, birds flying home.
   - The postman walks the street (walk cycle, bag swinging, long blue shadow) to the old wooden postbox.
   - The camera tracks him in parallax, with dust in the light.
2. **8–16.6 · The forgotten letter.**
   - Close on the wooden box: his hand opens the creaking door and reaches in.
   - He pinches the envelope wedged in a crack on the word "चिट्ठी" (11.9 s) and pulls it out as dust falls.
   - Brush-wipe to his face: his brows lift with curiosity and he turns the envelope over.
   - Brush-wipe to the address in a hand-written Devanagari face ("पीपल के पेड़ वाला घर") as light sweeps across it.
3. **16.6–23.4 · The journey.**
   - Behind him down a narrow lane: he walks away (back-view cycle) toward the peepal and the house at its end.
   - The low sun throws his shadow back at us; leaves drift down.
   - Brush-wipe to the house beside the great peepal; he walks up to the blue door.
4. **23.4–33.8 · The woman.**
   - In the room, Amma sits by the window in sunbeams; the curtain moves and the clock ticks.
   - The postman knocks and appears in the doorway; she turns her head and he steps in.
   - Close on the hands: his khaki-sleeved hand offers the envelope and she takes it with both hands.
   - Close on her face: she reads the handwriting, recognises it on "पहचान", and her eyes fill on "बाबूजी"; a tear.
5. **33.8–51 · The letter.**
   - Extreme close-up: her old hands open the flap, slide the paper out and unfold it.
   - The handwritten letter is legible on the page as her father's voice reads it.
   - Golden light crosses the paper and her finger follows the words.
   - Mist dissolve into **the memory**, a real animated scene on the wedding day at the same house with marigold garlands:
     - Her father lifts his hand to bless her and she lowers her head, then looks up; a warm, wet-eyed look passes between them.
     - She walks down the path and turns back once.
     - He stays at the open door, hand on the frame, as "दरवाज़ा... हमेशा खुला रहेगा" is heard; marigold petals fall.
   - Mist dissolves back to the present.
6. **51–57.2 · The emotional moment.**
   - She holds the letter to her heart with eyes closed, breathing.
   - She opens her eyes, turns to the postman and says her line.
   - He looks down; the camera pushes in slowly.
7. **57.2–75 · The final memory.**
   - He leaves and she places the letter beside the old photograph.
   - The camera pushes slowly into the photograph: her younger self beside her father, in sepia.
   - Colour returns; they turn to each other and smile.
   - Mist opens the photograph into a warm painted world: the house and the peepal at golden hour, birds across the sun.
   - Title: **आखिरी चिट्ठी** / *कुछ एहसास कभी पुराने नहीं होते।* Gentle fade.

## Characters (`people.js`, one design each)

- **The postman:** about 62, khaki half-sleeve shirt and trousers, khaki peaked cap with a brass badge, round spectacles, grey hair and moustache, brown leather satchel.
- **Amma:** about 68, sage cotton saree with a maroon border, maroon blouse, the pallu over grey hair in a bun, maroon bindi, gold bangles.
- **The bride:** Amma at about 22, with the same face construction. Red wedding saree with a gold border, sindoor, maang tikka, red-and-gold bangles.
- **Babuji:** her father at about 50. White kurta and dhoti, a brown shawl, black hair greying at the temples, moustache.

A reference sheet is in `refs/character_sheet.jpg`.

## Sound (`mix.py`)

**Score:** original, composed in code from the toolkit's samples.
- Salamander grand piano; VSCO 2 CE flute, violins, violas, cellos and harp.
- Bhupali colour (D E F♯ A B): the flute takes the bansuri's place.
- A tanpura-like drone made with the shamisen physical model's jawari-style buzz. There is no tanpura sample in the library.

**Foley (synthesised):** footsteps on dust and floor, the wooden box's creak and bump, paper (pull, turn, take, flap, slide, unfold), knocks, dust falling, the letter set down, birds, wind, the room's wall clock, mist and brush-wipe whooshes.

**Mix:** voice forward, with music ducked about 4 dB under it; mastered to −14 LUFS.
