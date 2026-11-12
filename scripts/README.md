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

No scripts exist yet.
