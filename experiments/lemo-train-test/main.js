// The Unscheduled Train — 10 s Lemo-Opuscar evaluation film (80s Cel Anime style)
import { canvas, W, H } from './cel.js';
import { makePost } from './post.js';
import { DUR, shotAt } from './story.js';
import { SHOTS_FN, buildAssets, events } from './scenes.js';
import { PAL } from './pal.js';
import { girl, girlBack } from './figure.js';
import { head80 } from './head.js';

const qs = new URLSearchParams(location.search);
const [sc, g] = canvas(W, H), [gc, e] = canvas(W, H);
const post = makePost(document.getElementById('gl'));
const A = buildAssets();
const RAW = { bloom: 0, halo: 0, soft: 0, flick: 0, lift: 0, contrast: 0, fade: 0, sat: 1, tint: [1, 1, 1], scan: 0, grille: 0, bleed: 1, rshift: 0, glow: 0, corner: 0, noiseA: 0, power: 1, track: 0, expo: 1 };

function modelSheet() {   // DIRECTOR.md §5: turnaround-ish poses, expressions, palette, rendered with the real drawing code
  g.fillStyle = '#d8d2dc'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#2a2436'; g.font = '700 34px sans-serif'; g.fillText('THE TRAVELLER — MODEL SHEET v1 (code-drawn, Lemo cel-anime-80s engine)', 24, 44);
  const fig = (x, sx, o, back) => { g.save(); g.translate(x, 140); g.scale(sx, .48); back ? girlBack(g, PAL.day, o) : girl(g, PAL.day, o); g.restore(); };
  fig(170, .48, { wind: .1 }); fig(470, -.48, { wind: .1 }); fig(770, -.48, { wind: .9, ph: .3, brace: 1, E: { open: .5, lid: .35, brow: [7, -2, 1], mouth: 'set' } });
  g.save(); g.translate(1060, 300); g.scale(.55, .55); girlBack(g, PAL.day, { wind: .1 }); g.restore();
  const ex = [['neutral', {}], ['surprised', { open: 1.12, iris: .82, brow: [-9, -6, 4.5], mouth: 'oh' }], ['determined', { open: .5, lid: .35, brow: [7, -2, 1], mouth: 'set' }], ['soft smile', { open: .72, lid: .1, brow: [-3, -1, 3], mouth: 'smile', smileEyes: true }]];
  ex.forEach(([lab, E], i) => { const x = 1300 + (i % 2) * 300, y = 260 + Math.floor(i / 2) * 330; g.save(); g.translate(x, y); g.scale(-1.15, 1.15);
    head80(g, PAL.day, { view: 'q', E, body: false, ponytail: false, headset: false, goggles: false, wind: .1, neckEnd: 150 }); g.restore();
    g.fillStyle = '#2a2436'; g.font = '600 22px sans-serif'; g.fillText(lab, x - 60, y + 190); });
  const sw = [['hair', PAL.day.hair], ['eye', PAL.day.eye], ['coat', PAL.day.coat], ['scarf', PAL.day.scarf], ['skin', PAL.day.skin], ['train', PAL.day.train], ['trim', PAL.day.trim]];
  sw.forEach(([n, c], i) => { [c.f, c.s, c.h || c.f].forEach((col, j) => { g.fillStyle = col; g.fillRect(40 + i * 170 + j * 44, 1000, 40, 40); }); g.fillStyle = '#2a2436'; g.font = '500 18px sans-serif'; g.fillText(n, 40 + i * 170, 990); });
}

function render(t) {
  for (const x of [g, e]) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  let over = {};
  if (qs.get('test') === 'model') modelSheet();
  else {
    const [t0, t1, name] = shotAt(t);
    over = SHOTS_FN[qs.get('shot') || name]({ t, lt: t - t0, u: (t - t0) / (t1 - t0), g, e, A }) || {};
  }
  for (const x of [g, e]) x.setTransform(1, 0, 0, 1, 0, 0);
  post.render(sc, gc, Math.round(t * 24), null, qs.get('raw') || qs.get('test') ? RAW : { power: 1, track: 0, ...over });
}
window.EV = events();
window.render = render; window.DUR = DUR;
render(parseFloat(qs.get('t') ?? '1'));
window.READY = true;
