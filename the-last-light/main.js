// आखिरी रोशनी / THE LAST LIGHT — opening 10 s test. Lemo-Opuscar Watercolor Brush, 1920×1080, 60 fps. Pure function of t.
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const DUR = 10.0, Q = new URLSearchParams(location.search);
let PAPER_IMG, GRAIN;
const T = { reveal: [0.2, 2.3], vo: 1.0, lamp: 5.0, title: [8.15, 9.0], out: [9.55, 10.0] };
const ZOOM = monotone([[0, 1.0], [2, 1.015], [5, 1.085], [8, 1.17], [10, 1.5]]);
const SUBS = [{ t0: 1.0, t1: 8.0, text: 'समुद्र के किनारे एक पुराना लाइटहाउस था… जो पिछले बीस सालों से बंद पड़ा था।' }];

function render(t) {
  const c = ctx, Z = ZOOM(t), B = beams(t), on = lampOn(t);
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.fillStyle = N.skyTop; c.fillRect(0, 0, W, H);
  cam(c, Z, .35); drawSky(c, t);
  cam(c, Z, .72); drawFog(c, t, FOG[0], B);
  cam(c, Z, .85); drawFarCliff(c);
  cam(c, Z, 1); drawSea(c, t, B); drawHeadland(c, t); drawSurf(c, t); drawLighthouse(c, t);
  for (const b of B) drawBeam(c, b);
  drawFog(c, t, FOG[1], B);
  cam(c, Z, 1.12); drawFog(c, t, FOG[2], B);
  cam(c, Z, 1.5); drawFog(c, t, FOG[3], B);
  // when a beam swings through the viewer: lens bloom from the lamp
  c.setTransform(1, 0, 0, 1, 0, 0);
  const s1 = 1 + (Z - 1), lx = (LAMP.x - FOCUS[0]) * s1 + FOCUS[0], ly = (LAMP.y - FOCUS[1]) * s1 + FOCUS[1];
  let fl = 0; for (const b of B) fl = Math.max(fl, Math.pow(Math.max(0, b.toward), 10)); fl *= on * (1 - .55 * seg(t, 7.9, 8.4));   // held back while the title is up
  if (on > 0) { blob(c, lx, ly, 90 + 520 * fl, N.hot, .35 + .5 * fl, 1, 1, 'screen'); if (fl > .02) { blob(c, lx, ly, 1100, N.gold, .16 * fl, 1.6, .5, 'screen'); c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = rgba(N.gold, .08 * fl); c.fillRect(0, 0, W, H); c.restore(); } }
  // vignette + paper: the sheet's grain stays visible through the night washes
  const vg = c.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1150); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(2,4,8,.6)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .55; c.drawImage(PAPER_IMG, 0, 0); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .26; c.drawImage(GRAIN, 0, 0, W, H); c.restore();
  // opening: out of near-black
  const dk = 1 - eio(seg(t, T.reveal[0], T.reveal[1])); if (dk > 0) { c.fillStyle = `rgba(1,2,5,${(.985 * dk).toFixed(3)})`; c.fillRect(0, 0, W, H); }
  if (t >= T.title[0]) title(c, t);
  if (!Q.has('nosub')) subs(c, t);
  const o = seg(t, T.out[0], T.out[1]); if (o > 0) { c.fillStyle = `rgba(3,6,12,${ss(o).toFixed(3)})`; c.fillRect(0, 0, W, H); }
}
function title(c, t) {
  const p = eo(seg(t, T.title[0], T.title[1])), x = 560, y = 430, txt = 'आखिरी रोशनी';
  c.save(); c.font = "600 138px 'Noto Serif Devanagari'"; c.textAlign = 'center'; c.textBaseline = 'middle';
  const w = c.measureText(txt).width, x0 = x - w / 2 - 40;
  blob(c, x, y + 10, 560, '#03060c', .62 * p, 1.25, .5);                            // a darker pool behind the letters keeps them readable over the fog
  c.beginPath(); c.rect(x0, y - 140, (w + 80) * p, 300); c.clip();                 // written across, left to right
  c.shadowColor = rgba(N.gold, .85); c.shadowBlur = 34; c.fillStyle = rgba('#f6e3b8', .96 * p); c.fillText(txt, x, y);
  c.shadowBlur = 0; c.fillStyle = rgba(N.gold, .8 * p); c.fillRect(x - w * .32, y + 96, w * .64 * p, 2.5);
  c.font = "500 30px 'Noto Serif Devanagari'"; c.fillStyle = rgba('#c9d3df', .8 * seg(t, T.title[0] + .5, T.title[1] + .3)); c.fillText('THE LAST LIGHT', x, y + 132);
  c.restore();
}
function subs(c, t) {
  const s = SUBS.find(s => t >= s.t0 && t < s.t1); if (!s) return; const a = Math.min(1, (t - s.t0) / .4, (s.t1 - t) / .4);
  c.save(); c.font = "500 40px 'Noto Serif Devanagari'"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = a; c.lineJoin = 'round';
  c.strokeStyle = 'rgba(3,6,12,.85)'; c.lineWidth = 10; c.strokeText(s.text, W / 2, H - 84); c.fillStyle = 'rgba(232,226,210,.92)'; c.fillText(s.text, W / 2, H - 84); c.restore();
}
function makeGrain() {   // pigment granulation: seeded noise at half size, mid-grey = neutral under 'overlay'
  const g = document.createElement('canvas'); g.width = 960; g.height = 540; const x = g.getContext('2d'), im = x.createImageData(960, 540), R = mulberry(77);
  for (let i = 0; i < 960 * 540; i++) { const v = 128 + (R() - .5) * 70 + (R() < .012 ? 60 : 0); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  x.putImageData(im, 0, 0); return g;
}
window.DUR = DUR; window.render = render;
{ const B0 = []; for (let f = Math.round(5.7 * 60); f < DUR * 60; f++) { const t = f / 60; for (const b of beams(t)) { const p = beams(t - 1 / 60).find(q => Math.abs(q.toward - b.toward) < .2); if (p && p.toward < .97 && b.toward >= .97) B0.push(t); } }
  window.EV = [{ t: T.vo, type: 'line', id: 'n1' }, { t: T.lamp, type: 'lamp' }, { t: 5.7, type: 'lampfull' }, ...B0.map(t => ({ t, type: 'sweep' })), { t: T.title[0], type: 'title' }]; }
window.TEXTS = t => t >= T.title[0] ? [{ id: 'title', text: 'आखिरी रोशनी', x0: 250, y0: 340, x1: 870, y1: 520, pass: true }] : [];
(async () => {
  PAPER_IMG = new Image(); PAPER_IMG.src = 'paper.jpg'; await PAPER_IMG.decode();
  await document.fonts.load("600 138px 'Noto Serif Devanagari'", 'आखिरी रोशनी'); await document.fonts.load("500 40px 'Noto Serif Devanagari'", 'समुद्र');
  GRAIN = makeGrain(); render(Number(Q.get('t') ?? 6)); window.READY = true;
})();
