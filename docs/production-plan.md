# AETHER — Production Plan: Episode 1

> Target: **a 50-second, Hindi-voiced, traditional 2D anime Episode 1.**
> This plan sets the scope, budget, schedule and approval gates.

---

## 1. Deliverables

| Item | Spec |
|---|---|
| Episode 1 master | MP4, 1920×1080, 24 fps, ~50 s (1,200 frames), −14 LUFS |
| Subtitles | Hindi (Devanagari) `.srt` + English `.srt` |
| Animatic | MP4 with temporary voice (internal review) |
| Design pack | Model sheets for every Ep 1 character, palettes, BG concepts |
| Source archive | All project files, versioned per `docs/pipeline.md` §8 |

---

## 2. Animation budget

| Level | Screen time | New drawings |
|---|---|---|
| A — full frame-by-frame (on 2s) | ~8–10 s | ~100–120 |
| B — limited animation (on 3s, held parts) | ~20–25 s | ~80–110 |
| C — drawn layers + camera + FX | ~15–20 s | ~30–50 |
| **Total** | **50 s** | **~210–280** |

For comparison: TV anime averages roughly 2–4 new drawings per second, and
this plan averages about 4–5. If artist time is short, move shots from
Level A to B rather than lowering quality.

---

## 3. Episode 1 shot structure

The placeholder structure has been replaced by the Episode 1 package
"एक नई शुरुआत" in `story/ep01/` (17 shots, 1,200 frames). Timing source:
`story/ep01/shotlist.yaml`. Overview and drawing budget (≈ 236 drawings):
`story/ep01/timeline.md`. Status: script lock candidate (gate G2).

---

## 4. Effort estimate (one competent artist)

| Work | Estimate |
|---|---|
| Character design packs (1–2 main characters) | 20–30 h |
| Storyboard + animatic drawings | 10–15 h |
| Backgrounds (8–10 layered paintings × 4–8 h) | 40–80 h |
| Animation, 210–280 drawings × 30–45 min (rough → clean → colour) | 125–190 h |
| **Artist total** | **≈ 195–315 h** |

Pipeline work (script support, shot list, compositing code, lip-sync, audio
mix, render) runs alongside and does not depend on drawing speed.

Approximate calendar: **5–8 weeks full-time, or 3–4 months part-time**
for one artist.

---

## 5. Phases & milestones

| Phase | Work | Exit gate |
|---|---|---|
| 0. Setup | Docs, folder structure, git config | **G1 ✅ (current)** |
| 1. Story | Episode outline, Hindi script, shot list | G2 |
| 2. Tools | Install Remotion + Rhubarb, verify FFmpeg pipeline with test inputs (no artwork) | G3 |
| 3. Design | Character design packs, palettes, BG concepts, brush bundle | G4 |
| 4. Animatic | Storyboard, temporary voice, timed animatic | G5 (timing lock) |
| 5. Voice | Final Hindi dialogue recording / generation, lip-sync | — |
| 6. Production | Layout → key animation → supervisor check → in-betweens → clean-up → colour. Backgrounds | — |
| 7. Post | Compositing, FX, grade, sound mix, subtitles | — |
| 8. Review | Fix-up pass, final render | G6 |

---

## 6. Roles

| Role | Responsibility | Assigned |
|---|---|---|
| Director / producer | Story, approvals, final calls | Project owner |
| Writer | Hindi script | TBD |
| Character designer / animation supervisor | Design pack; corrects every key drawing | TBD |
| Animator(s) | Key animation, in-betweens, clean-up, colour | TBD |
| Background artist | Layered BG paintings | TBD |
| Voice actors | Hindi dialogue | TBD |
| Pipeline / compositing | Shot list tooling, Remotion, lip-sync, audio, render | Claude (with approval at each gate) |

---

## 7. Open decisions

| # | Decision | Options | Needed by |
|---|---|---|---|
| D1 | Who draws, hours/week | Owner / hired artist / mix | G4 |
| D2 | Voice source | Human actors (recommended) / free AI voices / paid AI voices | Phase 5 |
| D3 | Story & characters | Owner provides / Claude drafts | G2 |
| D4 | Drawing tools | Krita only / Krita + OpenToonz | G4 |
| D5 | Heavy-file storage | GitHub LFS only / LFS pack / external drive for sources | Before Phase 3 |
| D6 | Letterbox | None / 2.39:1 bars | G5 |

---

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Artist hours under-estimated | Schedule slips | Move shots from Level A → B. Lock scope at G2 |
| Characters drift off-model | Looks amateur | Design pack + supervisor check + palette check |
| Hindi lip-sync inaccuracy (Rhubarb is trained on English) | Lip-sync looks off | Manual correction pass. 7-shape Hindi set |
| LFS quota exceeded | Push failures | Storage strategy (pipeline.md §8) |
| Motion feels like a slideshow or Flash | Wrong look | Stepped timing, motion rules, review at animatic |
| Music/SFX licensing | Takedowns | Record every source in `docs/credits.md` |
