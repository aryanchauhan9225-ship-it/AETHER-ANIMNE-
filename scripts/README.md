# scripts — Pipeline helpers

Command-line helpers, added stage by stage with approval. Planned:

| Script | Purpose |
|---|---|
| `lipsync` | Run Rhubarb on dialogue WAVs → convert to the AETHER `M A E O T F X` mouth set |
| `audio_mix` | FFmpeg: mix dialogue / music / SFX, normalise to −14 LUFS |
| `palette_check` | Flag colours in character frames that are not in the official palette |
| `contact_sheet` | Side-by-side model-sheet vs shot comparison for review |
| `validate_shotlist` | Check `shotlist.yaml` durations add up to the episode length |
| `subtitles` | Build Hindi / English `.srt` from the script |
| `final_encode` | FFmpeg: mux render + mix + subtitles into the delivery MP4 |

## Available now

| Script | Purpose |
|---|---|
| `animatic/gen_panels.py` | Generates the 40 code-drawn SVG storyboard **layout** panels in `story/ep01/storyboard/` from `shotlist.yaml` → `panels:` |
| `animatic/svgkit.py` | Drawing kit used by the generator: palettes from the design specs, Aether / Elaria / baby, Nexus / city / room environments, FX |
| `animatic/build_animatic.py` | Builds `renders/ep01_animatic_v0.mp4` with the **system FFmpeg** (panels → camera moves → placeholder audio → Hindi subtitles → verify). Prefers a drawn `<id>.png` over the `<id>.svg` |

Requirements: Python 3 with PyYAML, FFmpeg built with librsvg + libass (the system build here has both). Nothing to install.

The rest of the table above is still planned.
