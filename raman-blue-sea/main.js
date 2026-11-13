// "समुद्र नीला क्यों है?" — 10 s quality test: shot 1 (aerial descent to the liner) → brush wipe → shot 2 (deck rail).
// Lemo-Opuscar Watercolor Brush style; 1920×1080, 24 fps. Everything is a pure function of t.
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const DUR = 10.0, Q = new URLSearchParams(location.search);
let PAPER_IMG, SP;
const T = { paint: [0.15, 1.5], ship: [1.0, 2.5], smoke: 1.7, horn: 2.9, wipe: [6.35, 7.15], vo: 0.9 };
// the aerial descent: the horizon drops as the camera comes down, the ship grows and slides toward frame centre
const HZ = monotone([[0, 150], [2, 200], [6.4, 452], [7.2, 470]]);
const SK = monotone([[0, .17], [2, .24], [5, .62], [6.6, 1.02], [7.2, 1.16]]);
const SX = monotone([[0, 1180], [2.5, 1120], [6.6, 880], [7.2, 800]]);
const SY = monotone([[0, 560], [2, 590], [5, 690], [6.6, 760], [7.2, 790]]);
const SUBS = [{ t0: 0.9, t1: 7.5, text: '1921। भूमध्य सागर के बीच... एक जहाज़ भारत लौट रहा है।' }];

function shot1(c, t) {
  const hz = HZ(t), k = SK(t), pan = (1180 - SX(t)) * 1.6;
  const p = eo(seg(t, T.paint[0], T.paint[1]));
  // the first brush strokes: the sheet is painted from the horizon outwards while the world is already moving
  c.save();
  if (p < 1) { c.beginPath(); const yT = hz - (hz + 300) * p, yB = hz + (H - hz + 80) * p; c.moveTo(-10, yT);
    for (let x = -10; x <= W + 10; x += 60) c.lineTo(x, yT + (fbm(x * .006 + 2) - .5) * 90 * (1 - p)); for (let x = W + 10; x >= -10; x -= 60) c.lineTo(x, yB + (fbm(x * .005 + 9) - .5) * 120 * (1 - p)); c.closePath(); c.clip(); }
  drawSky(c, hz, t, pan);
  drawCoast(c, hz, pan);
  drawSea(c, hz, t, { pan, drift: 60 + 110 * k, rows: 17 });
  // cloud shadows sliding over the water (depth cue from above)
  for (let i = 0; i < 4; i++) { const x = ((i * 640 - t * 26 - pan) % 2600 + 2600) % 2600 - 300, u = .25 + .2 * i; blob(c, x, hz + (H - hz) * u, 260 * (.5 + u), C.ultra, .09, 800 + i, 2.2, .35); }
  drawShip(c, SP, SX(t), SY(t), k, t, ss(seg(t, T.ship[0], T.ship[1])), T.smoke);
  for (let i = 0; i < 5; i++) { const a = t * (.5 + .1 * i) + i * 1.9, r = (150 + 70 * i) * k; drawGull(c, SX(t) + Math.cos(a) * r * 1.6 - 200 * k, SY(t) - 250 * k + Math.sin(a) * r * .5, Math.max(.35, k * 1.1), t, i * 1.7); }
  // near mist the camera sinks through
  const m = seg(t, 3.2, 6.6); if (m > 0) for (let i = 0; i < 5; i++) { const x = ((i * 520 - t * 90) % 2600 + 2600) % 2600 - 340; blob(c, x, H - 40 + 60 * hash(i) - m * 90, 260, '#f4ead8', .3 * Math.sin(m * Math.PI), 850 + i, 2.4, .45); }
  c.restore();
}
function subs(c, t) {
  const s = SUBS.find(s => t >= s.t0 && t < s.t1); if (!s) return;
  const a = Math.min(1, (t - s.t0) / .35, (s.t1 - t) / .35);
  c.save(); c.font = "500 44px 'Noto Serif Devanagari'"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = a;
  c.lineJoin = 'round'; c.strokeStyle = rgba(PAPER, .9); c.lineWidth = 12; c.strokeText(s.text, W / 2, H - 92); c.fillStyle = rgba(INK, .86); c.fillText(s.text, W / 2, H - 92); c.restore();
}
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(PAPER_IMG, 0, 0);
  const w = seg(t, T.wipe[0], T.wipe[1]);
  if (w < 1) shot1(ctx, t);
  if (w > 0) {   // brush-edge wipe: the deck is painted across the sheet from the left while both shots keep moving
    ctx.save(); ctx.beginPath(); const xe = -160 + (W + 320) * eio(w); ctx.moveTo(-10, -10);
    for (let y = -10; y <= H + 10; y += 36) ctx.lineTo(xe + (fbm(y * .012 + 3) - .5) * 220 + Math.sin(y * .05) * 18, y); ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip();
    ctx.drawImage(PAPER_IMG, 0, 0); drawDeck(ctx, t, eio(seg(t, T.wipe[0], DUR + .4))); ctx.restore();
  }
  if (!Q.has('nosub')) subs(ctx, t);
}
window.DUR = DUR; window.render = render;
window.EV = [{ t: T.paint[0], type: 'brush', d: 1.3 }, { t: T.ship[0], type: 'brush', d: 1.2 }, { t: T.horn, type: 'horn' }, { t: T.vo, type: 'line', id: 'n1' },
  { t: T.wipe[0], type: 'brush', d: .8 }, { t: 7.5, type: 'creak' }, { t: 9.0, type: 'creak' }, { t: 3.6, type: 'gull' }, { t: 5.2, type: 'gull' }, { t: 8.3, type: 'gull' }];
window.TEXTS = () => [];
(async () => {
  PAPER_IMG = new Image(); PAPER_IMG.src = 'paper.jpg'; await PAPER_IMG.decode();
  await document.fonts.load("500 44px 'Noto Serif Devanagari'", 'भूमध्य सागर');
  SP = buildShip();
  render(Number(Q.get('t') ?? 3));
  window.READY = true;
})();
