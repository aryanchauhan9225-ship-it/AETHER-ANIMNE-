# animation/ep01 — Shot animation for Episode 1

One folder per shot, created when production starts (after timing lock, gate G5):

```
animation/ep01/
└── sh030/
    ├── layout/   framing, BG section, camera path drawing
    ├── rough/    key + in-between roughs (optional to commit)
    ├── final/    cleaned, coloured PNG frames
    │             sh030_<character>_<part>_0001.png …
    └── sh030.kra / sh030.tnz   Krita or OpenToonz source
```

- Frames: PNG, RGBA, 1920×1080 (or the pan canvas size), numbered from `0001`.
- Exposure: frame numbers follow the 24 fps timeline. Holds may be written
  as a timing (exposure) list instead of duplicated files.
- Remotion reads **only** `final/`.
