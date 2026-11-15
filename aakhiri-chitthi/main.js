'use strict';
// आखिरी चिट्ठी / THE LAST LETTER — a 75 s animated short. Lemo-Opuscar Watercolor Brush, 1920×1080, 60 fps (4,500 frames).
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const DUR = 75.0, Q = new URLSearchParams(location.search);
// shots: [start, draw(c, t), transition-in seconds (brush-edge wipe centred on the start; 0 = continuous / handled inside)]
const SHOTS = [[0, scene1, 0], [8.0, scene2, .6], [12.9, scene2, .5], [14.6, scene2, .5], [16.6, scene3, .6], [20.4, scene3, .6], [23.4, scene4, .7], [28.0, scene4, .45], [29.4, scene4, .45],
  [33.8, scene5, .6], [51.0, scene6, 0], [57.2, scene7, 0], [69.0, scene7world, 0]];
const VO = [['n1', 1.0], ['n3', 8.8], ['n4', 13.6], ['n6', 23.8], ['n7', 28.5], ['l1', 36.8], ['l2', 44.6], ['w1', 53.2], ['f1', 57.4], ['f2', 62.0], ['f3', 66.9]];
let LINES = {}, DURS = {};
function shotAt(t) { let i = 0; for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k][0]) i = k; return i; }
function drawShot(i, t) { const [s0, fn] = SHOTS[i], s1 = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : DUR; ctx.save(); fn(ctx, clamp(t, s0, s1 - 1e-3)); ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; }
function base() { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.drawImage(PAPER_IMG, 0, 0); }
function render(t) {
  t = clamp(t, 0, DUR - 1e-4); SEEDK = 1; base();
  const i = shotAt(t);
  // the photograph's world: mist reveal from the photo push
  if (i === 12 && t < 70.2) { drawShot(11, t); mistReveal(ctx, seg(t, 69.0, 70.2), () => drawShot(12, t)); }
  else {
    const [s0, , wd] = SHOTS[i], nx = SHOTS[i + 1];
    if (wd && t < s0 + wd / 2 && i > 0) { drawShot(i - 1, t); brushWipe(seg(t, s0 - wd / 2, s0 + wd / 2), () => drawShot(i, t)); }
    else if (nx && nx[2] && t > nx[0] - nx[2] / 2) { drawShot(i, t); brushWipe(seg(t, nx[0] - nx[2] / 2, nx[0] + nx[2] / 2), () => drawShot(i + 1, t)); }
    else drawShot(i, t);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(W / 2, H / 2, 560, W / 2, H / 2, 1200); vg.addColorStop(0, 'rgba(60,40,30,0)'); vg.addColorStop(1, 'rgba(60,40,30,.32)'); ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore();
  title(t);
  if (!Q.has('nosub')) subs(t);
  const fi = 1 - ss(seg(t, 0, .9)), fo = ss(seg(t, 74.2, DUR)), k = Math.max(fi, fo); if (k > 0) { ctx.fillStyle = `rgba(8,6,4,${k.toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
}
function brushWipe(p, draw) {   // a ragged painted edge sweeps left → right; the next picture is painted in behind it
  if (p <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const xe = -300 + (W + 600) * eio(p);
  ctx.beginPath(); ctx.moveTo(-10, -10); for (let y = -10; y <= H + 10; y += 24) ctx.lineTo(xe + (fbm(y * .009 + 3) - .5) * 300 + Math.sin(y * .04) * 14, y); ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip();
  ctx.drawImage(PAPER_IMG, 0, 0); draw(); ctx.restore();
}
function subs(t) {
  for (const [id, t0] of VO) { const d = (DURS[id] || 3) + .6, t1 = t0 + Math.max(1.8, d); if (t < t0 || t >= t1) continue; const txt = LINES[id]; if (!txt) continue;
    const a = Math.min(1, (t - t0) / .3, (t1 - t) / .3), letter = id[0] === 'l';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = letter ? "40px Kalam" : "500 36px NSD"; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(241,233,218,.9)'; ctx.lineWidth = 12; ctx.strokeText(txt, W / 2, H - 70); ctx.fillStyle = 'rgba(43,37,32,.88)'; ctx.fillText(txt, W / 2, H - 70); ctx.restore(); }
}
function title(t) {
  const p = seg(t, 72.2, 73.4), q = seg(t, 72.9, 74.0); if (p <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const bg = ctx.createRadialGradient(W / 2, 330, 40, W / 2, 330, 640); bg.addColorStop(0, `rgba(241,233,218,${.75 * ss(p)})`); bg.addColorStop(1, 'rgba(241,233,218,0)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, 700);
  ctx.font = "600 128px NSD"; const w = ctx.measureText('आखिरी चिट्ठी').width;
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - w / 2 - 30, 180, (w + 60) * eo(p), 260); ctx.clip(); ctx.fillStyle = 'rgba(58,36,24,.92)'; ctx.fillText('आखिरी चिट्ठी', W / 2, 300); ctx.restore();
  ctx.font = "50px Kalam"; const w2 = ctx.measureText('कुछ एहसास कभी पुराने नहीं होते।').width;
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - w2 / 2 - 20, 380, (w2 + 40) * eo(q), 110); ctx.clip(); ctx.fillStyle = 'rgba(122,42,42,.9)'; ctx.fillText('कुछ एहसास कभी पुराने नहीं होते।', W / 2, 432); ctx.restore();
  ctx.restore();
}
function events() {
  const ev = VO.map(([id, t]) => ({ t, type: 'line', id })); const E = (t, type, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  for (let k = 0; k < 40; k++) { const t = .4 + k * .68; if (t > 7.25) break; E(t, 'step', { surf: 'dust', g: .8 }); }   // S1 walk (one footfall per half-cycle)
  E(8.62, 'box_open'); E(9.4, 'box_bump'); E(11.9, 'paper_pull'); E(12.1, 'dust_fall'); E(13.2, 'paper_turn');
  for (let k = 0; k < 12; k++) { const t = 16.9 + k * .68; if (t > 20.3) break; E(t, 'step', { surf: 'dust', g: .6 - k * .04 }); }
  for (let k = 0; k < 12; k++) { const t = 20.6 + k * .7; if (t > 22.85) break; E(t, 'step', { surf: 'dust', g: .7 }); }
  E(25.1, 'knock'); E(25.35, 'knock'); E(26.7, 'step', { surf: 'floor', g: .6 }); E(27.1, 'step', { surf: 'floor', g: .6 }); E(28.5, 'paper_take');
  E(34.0, 'paper_flap'); E(34.9, 'paper_slide'); E(35.9, 'paper_unfold'); E(36.5, 'paper_unfold');
  E(39.4, 'mist'); E(49.8, 'mist'); E(60.3, 'tap'); E(57.6, 'step', { surf: 'floor', g: .5 }); E(58.1, 'step', { surf: 'floor', g: .45 }); E(58.6, 'step', { surf: 'floor', g: .35 });
  E(69.0, 'mist'); E(72.2, 'title');
  for (const [s, , wd] of SHOTS) if (wd) E(s - wd / 2, 'wipe', { d: wd });
  return ev.sort((a, b) => a.t - b.t);
}
window.DUR = DUR; window.render = render; window.EV = events(); window.TEXTS = () => [];
(async () => {
  PAPER_IMG = new Image(); PAPER_IMG.src = 'paper.jpg'; await PAPER_IMG.decode(); PAPAT = ctx.createPattern(PAPER_IMG, 'repeat');
  MEMV = document.createElement('canvas'); MEMV.width = W; MEMV.height = H;
  for (const f of ["600 128px NSD", "500 36px NSD", "40px Kalam", "27px Kalam", "11px KalamB", "38px KalamB"]) await document.fonts.load(f, 'आखिरी चिट्ठी पत्र सुंदरपुर');
  try { const L = await (await fetch('lines.json')).json(); L.forEach(l => LINES[l.id] = l.text); DURS = await (await fetch('voices/dur.json')).json(); } catch (e) { }
  render(Number(Q.get('t') ?? 3)); window.READY = true;
})();
