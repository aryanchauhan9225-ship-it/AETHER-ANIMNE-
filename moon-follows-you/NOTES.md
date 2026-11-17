# WHY DOES THE MOON FOLLOW YOU? — चाँद हमारा पीछा क्यों करता है?  ·  The Aryanzz Teams

Vertical science-mystery reel, 60 s, **1080×1920, 24 fps**.

## How it's built
- **Toolkit:** built on the Lemo-Opuscar render pipeline with the library's three.js (0.170).
- **Shared look:** the same serif typography (Cormorant Garamond + Noto Serif Devanagari), gold readings on thin leader lines and scan-written text as *The Stars Are Already Dead?*. This film moves that look into a moonlit 3D world.
- **Sky at infinity:** the sky (dome, stars, moon, high clouds) is a separate scene rendered from the camera's rotation only. It sits at infinity, so camera moves can never give the moon parallax, which is what the film is about.
- **World:** procedural moonlit hills, a road and a side path, instanced trees, houses with warm windows, mountains 1.4–2.6 km away, fog and drifting ground mist. A soft moon shadow comes from a single directional moonlight.
- **The walker:** a jointed figure in a long coat with a procedural walk cycle (hips, knees, arm swing, bob).
- **Space:** Earth and Moon at true scale: Earth radius 1, Moon radius 0.2727, 60.34 Earth radii apart (384,400 km). 30 ghost Earths fill the gap.
- **Post:** two render passes into one composer, then bloom, a midnight-blue and gold grade, vignette and dither. Cuts dip through deep blue, never black.
- **Overlay:** a 2D canvas carries the type, Hindi subtitles (wrapped inside the 9:16 safe zone) and the parallax diagram. The diagram is drawn from real 3D projections, and the tree's angle change is computed from the scene.

## Facts on screen
- Average Earth–Moon distance ≈ 384,400 km ("3,84,400 km").
- About 30 Earth diameters fit in the gap.
- Walking 18 m changes the Moon's direction by about 0.0000027°: 18 / 384,400,000 rad.

## Narration
Kokoro `hm_omega`, verbatim from the brief. For the voice only, the number is spoken as "तीन लाख चौरासी हज़ार"; the closing line is voiced too. All 10 lines pass the Whisper check.

| Line | m1 | m2 | m3 | m4 | m5 | m6 | m7 | m8 | m9 | m10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Start (s) | 0.6 | 7.5 | 12.4 | 17.4 | 20.6 | 25.6 | 32.0 | 42.6 | 47.4 | 53.6 |
