# art — Design assets (Krita / OpenToonz)

Approved designs and reusable art that all episodes share.
See `docs/style-guide.md`.

Planned layout (created when design work starts, gate G4):

```
art/
├── characters/<id>/
│   ├── model-sheets/   turnaround, expressions, mouth chart, hands, colour sheet
│   ├── layers/         approved parts for Level C shots (PNG + layers.json)
│   └── reuse/          approved head angles / poses library
├── backgrounds/<set>/  <set>_far|mid|near|fg.png  + source .kra
├── fx/                 drawn effect sequences and sprite sheets
├── palettes/           official .gpl palettes (Krita) / .tpl (OpenToonz)
└── templates/          canvas templates, brush bundle
```

Rules:
- Only **approved** art lives here. Rough work stays local or off-repo.
- Characters use palette colours only.
- Large `.kra` sources may be kept off-repo (see `docs/pipeline.md` §8).
