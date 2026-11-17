'use strict';
// THE STARS ARE ALREADY DEAD? — क्या आसमान के तारे अब भी ज़िंदा हैं?
// A 60 s cosmic science documentary. 1920×1080, 24 fps. A project-local variant of Lemo-Opuscar styles:
//   technique base  Firefly Pointillism — light only from round points; depth = size + blur with energy conserved; a halo two levels up;
//                   1 − exp(−x)-like burn of cores to warm white; dotted / stippled forms; drift as sums of slow sines.
//   borrowed        Dark Documentary — readings sit next to their object on thin leader lines; text written by a growing clip with a
//                   bright leading edge; 24 fps documentary cadence.
//   changed         palette → deep black, antique gold, warm white, muted bronze; thin glowing gold line diagrams; elegant serif type.
// Every frame is a pure function of t.
const W = 1920, H = 1080, DUR = 60, TAU = Math.PI * 2;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const Q = new URLSearchParams(location.search);
// ---------------------------------------------------------------- math
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); }, eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3), ei = t => Math.pow(clamp(t), 2.4);
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
function keys(ks) { return t => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [t0, v0] = ks[i - 1], [t1, v1] = ks[i]; return lerp(v0, v1, eio((t - t0) / (t1 - t0))); } return ks[ks.length - 1][1]; }; }
// ---------------------------------------------------------------- palette (antique gold, warm white, muted bronze on deep black)
const GOLD = [214, 170, 92], WHITE = [255, 240, 214], BRONZE = [150, 104, 58], PALE = [236, 214, 170];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`;
// ---------------------------------------------------------------- timeline (narration starts; scenes)
const T = { s2: 9.9, s3: 24.4, s4: 30.7, s5: 37.3, s6: 43.0, s7: 48.5 };
const VO = [['v01', 1.3], ['v02', 3.0], ['v03', 10.1], ['v04', 13.6], ['v05', 17.85], ['v06', 24.75], ['v07', 30.95], ['v08', 38.0], ['v09', 42.0], ['v10', 48.75], ['v11', 52.35], ['v12', 53.75], ['v13', 56.3]];
let LINES = {}, DURS = {};

// ---------------------------------------------------------------- point renderer (Firefly grammar, canvas port)
// A point = position, energy, colour, blur radius. Blur spreads the same energy over a bigger, fainter disc; 16 % goes to a halo.
let SPR = {};
function makeSprite(col) { const s = 64, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d'), r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, `rgba(255,250,236,1)`); r.addColorStop(.12, rgba(col, .95)); r.addColorStop(.35, rgba(col, .35)); r.addColorStop(.7, rgba(col, .07)); r.addColorStop(1, rgba(col, 0)); g.fillStyle = r; g.fillRect(0, 0, s, s); return c; }
function pt(x, y, e, blur = 1, spr = SPR.gold) {   // e: energy (≈ alpha of a sharp point); blur: radius in px (≥ 1)
  if (e <= .004 || x < -80 || y < -80 || x > W + 80 || y > H + 80) return;
  const r = 2.2 * blur, a = Math.min(1, e / (blur * blur) * 1.0);
  ctx.globalAlpha = a; ctx.drawImage(spr, x - r * 2, y - r * 2, r * 4, r * 4);
  if (e > .25) { const R = r * 4.5; ctx.globalAlpha = Math.min(.5, e * .16 / (blur * 4)); ctx.drawImage(spr, x - R * 2, y - R * 2, R * 4, R * 4); }
}
function streak(x0, y0, x1, y1, e, w, col) {   // a moving point under a 180° shutter: a short light streak
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1.5) return pt(x1, y1, e, 1);
  ctx.globalAlpha = 1; const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, Math.min(1, e))); ctx.strokeStyle = g; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }

// ---------------------------------------------------------------- the star field: one population for the whole film (conservation)
const STAR = []; const Z0 = 300, ZR = 9000;
(function () { const R = mulberry(7); for (let i = 0; i < 8000; i++) { const mag = Math.pow(R(), 3.2); STAR.push({ x: (R() - .5) * 9000, y: (R() - .5) * 5600, z: R() * ZR, m: mag, tw: R() * TAU, tf: .6 + R() * 2.4, col: R() < .72 ? 0 : R() < .7 ? 1 : 2, born: R() }); } })();
// galactic band: extra faint stars concentrated along a tilted band
(function () { const R = mulberry(11); for (let i = 0; i < 5000; i++) { const u = (R() - .5) * 9000, v = (R() + R() + R() - 1.5) * 500; STAR.push({ x: u * .94 - v * .34, y: u * .34 * .6 + v * .94 - 300, z: R() * ZR, m: Math.pow(R(), 5) * .5, tw: R() * TAU, tf: .5 + R() * 2, col: R() < .5 ? 0 : 2, born: R() * .6 + .4, band: 1 }); } })();
const DUST = []; (function () { const R = mulberry(3); for (let i = 0; i < 260; i++) DUST.push({ x: R() * W, y: R() * H, z: .3 + R() * .7, ph: R() * TAU, s: .4 + R() }); })();
let CAM = { x: 0, y: 0, z: 0, f: 900, roll: 0 };
const camZ = keys([[0, 0], [9.9, 420], [24.4, 900], [30.7, 1150], [32.4, 3600], [37.3, 3900], [43.0, 4200], [48.3, 2300], [60, 2500]]);
const camX = keys([[0, 0], [9.9, 40], [17, 420], [24.4, 520], [30.7, 560], [37.3, 300], [43, 200], [48.5, 0], [60, 0]]);
const camY = keys([[0, 0], [9.9, -60], [24.4, -40], [43, -20], [48.5, -80], [60, -120]]);
function starField(t, o = {}) {
  const vis = o.vis ?? 1, dim = o.dim ?? 1, prevZ = camZ(t - 1 / 48);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < STAR.length; i++) { const s = STAR[i];
    if (s.born > vis) continue; const app = clamp((vis - s.born) / .08);
    let z = ((s.z - CAM.z) % ZR + ZR) % ZR + Z0, zp = ((s.z - prevZ) % ZR + ZR) % ZR + Z0;
    const sx = W / 2 + (s.x - CAM.x) * CAM.f / z, sy = H / 2 + (s.y - CAM.y) * CAM.f / z;
    if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;
    const near = clamp((z - Z0) / 600) * clamp((ZR + Z0 - z) / 1600);   // fade at both ends of the wrapped depth
    const tw = .72 + .28 * Math.sin(t * s.tf + s.tw) * Math.sin(t * s.tf * .37 + s.tw * 2);
    const e = (s.band ? .2 + s.m * .7 : .26 + s.m * 2.2) * (1700 / (z + 600)) * near * app * tw * dim;
    const spr = s.col === 0 ? SPR.white : s.col === 1 ? SPR.gold : SPR.bronze;
    if (Math.abs(zp - z) > 30 && zp > z && o.streak) { const px = W / 2 + (s.x - CAM.x) * CAM.f / zp, py = H / 2 + (s.y - CAM.y) * CAM.f / zp; streak(px, py, sx, sy, e * 1.4, 1 + s.m * 2, s.col === 1 ? GOLD : WHITE); }
    else pt(sx, sy, e, z < 900 ? 1 + (900 - z) / 300 : 1, spr); }
  ctx.globalAlpha = 1;
}
function dust(t, a = 1) {   // near, out-of-focus cosmic dust: large faint discs drifting on slow sines
  ctx.globalCompositeOperation = 'lighter';
  for (const d of DUST) { const x = (d.x + t * 6 * d.s + Math.sin(t * .31 + d.ph) * 40) % W, y = (d.y - t * 3 * d.s + Math.cos(t * .23 + d.ph) * 30 + H) % H;
    pt(x, y, .1 * a * (.5 + .5 * Math.sin(t * .7 + d.ph)), 4 + d.z * 8, SPR.bronze); }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- gold line art (thin glowing lines, drawn on by length)
function gline(pts, p = 1, o = {}) {   // pts screen points; p = drawn fraction; o.w width, o.a alpha, o.col
  if (p <= 0 || pts.length < 2) return; const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const end = L[L.length - 1] * clamp(p); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = ctx.lineCap = 'round';
  const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { if (L[i] <= end) ctx.lineTo(pts[i][0], pts[i][1]); else { const u = (end - L[i - 1]) / (L[i] - L[i - 1] || 1); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); break; } } };
  const col = o.col || GOLD, a = o.a ?? 1;
  path(); ctx.strokeStyle = rgba(col, .16 * a); ctx.lineWidth = (o.w ?? 1.4) * 5; ctx.stroke();      // glow
  path(); ctx.strokeStyle = rgba(col, .85 * a); ctx.lineWidth = o.w ?? 1.4; ctx.stroke();
  if (p < 1 && o.tip !== false) { let tx = pts[0][0], ty = pts[0][1]; for (let i = 1; i < pts.length; i++) { if (L[i] >= end) { const u = (end - L[i - 1]) / (L[i] - L[i - 1] || 1); tx = lerp(pts[i - 1][0], pts[i][0], u); ty = lerp(pts[i - 1][1], pts[i][1], u); break; } } ctx.restore(); ctx.globalCompositeOperation = 'lighter'; pt(tx, ty, .9 * a, 1.4, SPR.white); ctx.globalAlpha = 1; return; }
  ctx.restore();
}
const circlePts = (cx, cy, rx, ry = rx, a0 = 0, a1 = TAU, n = 90, rot = 0) => { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n), x = Math.cos(a) * rx, y = Math.sin(a) * ry; P.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return P; };
// the observer: a small standing figure in thin gold line; o.look (0 level .. 1 looking up), o.p (drawn fraction)
function observer(x, y, s, t, o = {}) {
  const p = o.p ?? 1, lk = o.look ?? .6, a = o.a ?? 1, br = Math.sin(t * 1.3) * .8;
  const P = (px, py) => [x + px * s, y + py * s];
  const hx = 3 + lk * 2, hy = -166 + br - lk * 1;
  const body = [P(-11, 0), P(-9, -46), P(-8, -82), P(-12, -116), P(-14, -136), P(-8, -146 + br), P(-2, -150 + br)];
  const front = [P(10, 0), P(8, -46), P(6, -82), P(10, -110), P(12, -134), P(6, -146 + br), P(1, -150 + br)];
  const coatHem = [P(-16, -70), P(-12, -96)], legs = [P(-2, 0), P(-1, -60)];
  const arm = [P(9, -132 + br), P(14, -110), P(14, -88)];
  gline(body, p, { w: 1.5, a }); gline(front, p, { w: 1.5, a }); gline(legs, p, { w: 1.1, a: a * .8 }); gline(coatHem, p, { w: 1, a: a * .6 }); gline(arm, p, { w: 1.3, a });
  gline(circlePts(...P(hx, hy), 11 * s, 12.5 * s, 0, TAU * clamp(p * 1.2), 40, -lk * .5), 1, { w: 1.5, a, tip: false });
  gline([P(hx + 10 * Math.cos(-lk * .9), hy - 2 + 10 * Math.sin(-lk * .9)), P(hx + 14 * Math.cos(-lk * .9), hy - 2 + 14 * Math.sin(-lk * .9))], p, { w: 1.1, a: a * .7 });   // the gaze: a short nose line pointing up
  ctx.globalCompositeOperation = 'lighter'; pt(...P(hx, hy), .25 * a * p, 3, SPR.gold); ctx.globalAlpha = 1;
}
function ground(y, t, a = 1, wobble = 1) {   // a faint horizon: a hairline plus stippled terrain points
  const pts = []; for (let x = -40; x <= W + 40; x += 30) pts.push([x, y + Math.sin(x * .004 + 1) * 10 * wobble + Math.sin(x * .013) * 4 * wobble]);
  gline(pts, 1, { w: .9, a: .45 * a, tip: false });
  ctx.globalCompositeOperation = 'lighter'; const R = mulberry(19);
  for (let i = 0; i < 700; i++) { const x = R() * W, d = Math.pow(R(), 1.8) * 220; pt(x, y + 6 + d + Math.sin(x * .004 + 1) * 10 * wobble, .06 * a * (1 - d / 240) * (.7 + .3 * Math.sin(t + i)), 1, SPR.bronze); }
  ctx.globalAlpha = 1;
}
// the Earth: a delicate line globe; meridians turn; a stippled day side faces the light (lx, ly: direction to the light)
function earth(cx, cy, r, t, o = {}) {
  const a = o.a ?? 1, p = o.p ?? 1, rot = t * .25, tilt = .41;
  gline(circlePts(cx, cy, r, r, -Math.PI / 2, -Math.PI / 2 + TAU * p, 120), 1, { w: 1.4, a, tip: p < 1 });
  for (const la of [-60, -30, 0, 30, 60]) { const yy = Math.sin(la * Math.PI / 180) * r, rr = Math.cos(la * Math.PI / 180) * r; gline(circlePts(cx, cy + yy, rr, rr * .22, 0, Math.PI, 60, 0), p, { w: .8, a: a * .55, tip: false }); gline(circlePts(cx, cy + yy, rr, rr * .22, Math.PI, TAU, 60, 0), p, { w: .6, a: a * .18, tip: false }); }
  for (let k = 0; k < 8; k++) { const lon = rot + k * Math.PI / 8, rx = Math.abs(Math.cos(lon)) * r, front = Math.sin(lon) > 0; gline(circlePts(cx, cy, rx, r, -Math.PI / 2, Math.PI / 2, 60, tilt * .3).map(([x, y]) => [Math.cos(lon) > 0 ? x : 2 * cx - x, y]), p, { w: .8, a: a * (front ? .5 : .16), tip: false }); }
  if (o.light) { const [lx, ly] = o.light, L = Math.hypot(lx, ly) || 1, nx = lx / L, ny = ly / L, R = mulberry(23); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 900; i++) { const u = R() * TAU, v = Math.sqrt(R()), px = Math.cos(u) * v, py = Math.sin(u) * v, pz = Math.sqrt(Math.max(0, 1 - px * px - py * py)), lam = px * nx + py * ny + pz * .35;
      if (lam > 0) pt(cx + px * r, cy + py * r, .2 * a * o.lit * lam * (.7 + .3 * Math.sin(t * 2 + i)), 1, SPR.gold); } ctx.globalAlpha = 1; }
}
// a stippled sphere: point density follows limb darkening (the way an engraver or a pointillist builds a sun)
function stippleSphere(cx, cy, r, t, n, o = {}) {
  const R = mulberry(o.seed || 31), a = o.a ?? 1, spr = o.spr || SPR.gold; ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const u = R() * TAU, v = Math.sqrt(R()), mu = Math.sqrt(1 - v * v), limb = .35 + .65 * mu;
    if (R() > limb) continue; const gr = .75 + .25 * Math.sin(t * (1.5 + R() * 2) + i * .7);   // granulation shimmer
    pt(cx + Math.cos(u) * v * r, cy + Math.sin(u) * v * r, (o.e ?? .22) * a * gr * limb, 1, spr); }
  ctx.globalAlpha = 1;
}
function rays(cx, cy, r0, r1, n, t, a = 1, seed = 5) { for (let k = 0; k < n; k++) { const an = k / n * TAU + t * .012 + hash(seed + k) * .05, L = r0 + (r1 - r0) * (.35 + .65 * hash(seed * 3 + k)) * (.92 + .08 * Math.sin(t * 1.3 + k)); gline([[cx + Math.cos(an) * r0, cy + Math.sin(an) * r0], [cx + Math.cos(an) * L, cy + Math.sin(an) * L]], 1, { w: .7, a: a * (.25 + .4 * hash(seed + k * 7)), tip: false }); } }
// ---------------------------------------------------------------- type (scan-written, serif, tracked)
function text(s, x, y, o = {}) {   // o: font, size, col, a, track, align, p (scan reveal 0..1), italic
  const p = o.p ?? 1; if (p <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'source-over';
  ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 400} ${o.size || 40}px ${o.font || (o.italic ? 'CormI' : 'Corm')}`; ctx.letterSpacing = `${o.track ?? 0}px`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const w = ctx.measureText(s).width, x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x, sz = o.size || 40;
  ctx.beginPath(); ctx.rect(x0 - 6, y - sz, (w + 12) * clamp(p), sz * 2); ctx.clip();
  ctx.shadowColor = rgba(o.col || GOLD, .55 * (o.a ?? 1)); ctx.shadowBlur = o.glow ?? 14; ctx.fillStyle = rgba(o.col || GOLD, o.a ?? 1); ctx.fillText(s, x0, y); ctx.restore();
  if (p < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(WHITE, .8); ctx.fillRect(x0 - 6 + (w + 12) * p, y - sz * .7, 1.2, sz * 1.4); ctx.restore(); }   // the scan's bright leading edge
}
function reading(x, y, tx, ty, label, sub, p, o = {}) {   // a reading on a thin leader line: dot at the object, line to the label
  if (p <= 0) return; gline([[x, y], [lerp(x, tx, .7), ty], [tx, ty]], ss(p * 1.6), { w: .8, a: .7, tip: false }); ctx.globalCompositeOperation = 'lighter'; pt(x, y, .6, 1.2, SPR.white); ctx.globalAlpha = 1;
  const al = o.align || (tx > x ? 'left' : 'right'), dx = al === 'left' ? 10 : -10;
  text(label, tx + dx, ty - 12, { size: o.size || 22, track: 3.2, col: WHITE, a: .9, p: seg(p, .35, 1), align: al, weight: 500, glow: 6 });
  if (sub) text(sub, tx + dx, ty + 14, { size: (o.size || 22) * .82, track: 2.4, col: GOLD, a: .85, p: seg(p, .5, 1), align: al, italic: true, glow: 4 });
}
const fadeIO = (t, a, b, f = .6) => Math.min(ss(seg(t, a, a + f)), 1 - ss(seg(t, b - f, b)));

// ============================================================== SCENES
// S1 — the mystery (0 – 9.9): black; one golden star; thousands follow; a small figure under the sky; the camera creeps forward
function scene1(t) {
  const vis = t < .5 ? 0 : t < 1.6 ? .0004 : lerp(.0004, 1, ei(seg(t, 1.6, 7.5)) ** .7);
  ctx.globalCompositeOperation = 'lighter'; const fs = ss(seg(t, .4, 1.4)); pt(960, 330, (2.4 + .4 * Math.sin(t * 3)) * fs * (1 - ss(seg(t, 8.6, 10))), 1.6, SPR.gold); pt(960, 330, 1.1 * fs * (1 - ss(seg(t, 8.6, 10))), 10, SPR.gold); ctx.globalAlpha = 1;   // the first star
  const out1 = 1 - ss(seg(t, 9.2, 10.4));
  ground(880, t, ss(seg(t, 2.0, 4.0)) * out1);
  observer(960, 882, 1.15, t, { p: ss(seg(t, 2.2, 4.4)), look: .55 + .2 * ss(seg(t, 5, 7)), a: out1 });
  text('THE STARS ARE ALREADY DEAD?', 960, 190, { size: 58, track: 9, col: PALE, align: 'center', weight: 400, p: eo(seg(t, 1.6, 3.0)), a: fadeIO(t, 1.6, 5.4, .7) });
  text('क्या आसमान के तारे अब भी ज़िंदा हैं?', 960, 262, { font: 'NSD', size: 30, col: GOLD, align: 'center', weight: 300, p: eo(seg(t, 2.4, 3.6)), a: .9 * fadeIO(t, 2.4, 5.4, .7) });
  text('ARE WE SEEING THE PAST?', 960, 200, { size: 46, track: 12, col: GOLD, align: 'center', italic: true, p: eo(seg(t, 5.9, 7.2)), a: fadeIO(t, 5.9, 10.2, .6) });
}
// S2 — light begins its journey (9.9 – 24.4): a distant star at left; a light pulse crosses to a line-art Earth; old light
const S2 = { star: [300, 470], earth: [1560, 560], arrive: 17.2 };
function scene2(t) {
  const a = fadeIO(t, T.s2, T.s3 + .4, .9), off = (camX(t) - 400) * -.25;
  const sx = S2.star[0] + off, sy = S2.star[1], ex = S2.earth[0] + off, ey = S2.earth[1];
  ctx.globalCompositeOperation = 'lighter'; pt(sx, sy, 2.2 * a, 1.3, SPR.white); pt(sx, sy, .8 * a, 9, SPR.gold); ctx.globalAlpha = 1;
  for (let k = 0; k < 4; k++) { const an = k * Math.PI / 2 + Math.PI / 4, L = 60 + 10 * Math.sin(t * 2 + k); gline([[sx + Math.cos(an) * 6, sy + Math.sin(an) * 6], [sx + Math.cos(an) * L, sy + Math.sin(an) * L]], 1, { w: .9, a: a * .7, col: WHITE, tip: false }); }
  rays(sx, sy, 14, 40, 24, t, a * .6, 2);
  earth(ex, ey, 120, t, { a, p: ss(seg(t, 10.3, 12.4)), light: [-1, -.15], lit: ss(seg(t, S2.arrive - .2, S2.arrive + 1.2)) });
  // the beam: a thin line drawn behind a travelling pulse (it leaves at 10.6 and reaches Earth at 17.2), then holds
  const u = eio(seg(t, 10.6, S2.arrive)), bx = lerp(sx + 20, ex - 122, u), by = lerp(sy, ey - 10, u);
  gline([[sx + 20, sy], [ex - 122, ey - 10]], u, { w: 1.1, a: a * .8, tip: false });
  ctx.globalCompositeOperation = 'lighter'; if (u > 0 && u < 1) { const pu = eio(seg(t - 1 / 48, 10.6, S2.arrive)); streak(lerp(sx + 20, ex - 122, pu - .02), lerp(sy, ey - 10, pu - .02), bx, by, 1, 3, WHITE); pt(bx, by, 1.6, 1.4, SPR.white); pt(bx, by, .6, 7, SPR.gold); } ctx.globalAlpha = 1;
  if (t > S2.arrive) { const k = seg(t, S2.arrive, S2.arrive + 1.6); gline(circlePts(ex, ey, 122 + 40 * k, 122 + 40 * k), 1, { w: 1, a: a * (1 - k) * .8, tip: false }); }   // arrival ring
  // tick marks along the path (it takes time): a small scale under the beam
  for (let k = 0; k <= 10; k++) { const x = lerp(sx + 20, ex - 122, k / 10), y = lerp(sy, ey - 10, k / 10) + 26; gline([[x, y], [x, y + (k % 5 ? 6 : 12)]], ss(seg(t, 13.6 + k * .06, 14.2 + k * .06)), { w: .7, a: a * .5, tip: false }); }
  text('LIGHT TRAVELS THROUGH SPACE.', 960 + off * .3, 210, { size: 44, track: 8, col: PALE, align: 'center', p: eo(seg(t, 10.4, 11.8)), a: a * fadeIO(t, 10.4, 17.4, .7) });
  reading(sx, sy, sx + 130, sy - 150, 'LIGHT LEAVES THE STAR', 'emitted — long ago', seg(t, 18.0, 19.4) * a);
  reading(ex - 90, ey - 80, ex - 60, ey - 230, 'LIGHT ARRIVES', 'what we see — now', seg(t, 19.6, 21.0) * a);
  text('WHAT WE SEE IS OLD LIGHT.', 960 + off * .3, 210, { size: 40, track: 8, col: GOLD, align: 'center', italic: true, p: eo(seg(t, 21.8, 23.0)), a: a * fadeIO(t, 21.8, T.s3 + .3, .6) });
}
// S3 — the Sun (24.4 – 30.7): a stippled Sun, Earth at a distance on its orbit, a photon on the line, a timeline 0 → 8:20
const S3 = { sun: [430, 560, 210], earth: [1540, 560, 46], t0: 25.0, t1: 28.6 };
function scene3(t) {
  const a = fadeIO(t, T.s3 - .3, T.s4 + .4, .9), [scx, scy, sr] = S3.sun, [ex, ey, er] = S3.earth;
  ctx.globalCompositeOperation = 'lighter'; pt(scx, scy, 1.4 * a, 60, SPR.gold); ctx.globalAlpha = 1;
  stippleSphere(scx, scy, sr * ss(seg(t, T.s3 - .2, T.s3 + 1.0)) + .1, t, 9000, { a, e: .16, seed: 41 });
  rays(scx, scy, sr * 1.04, sr * 1.45, 120, t, a * ss(seg(t, T.s3 + .4, T.s3 + 1.6)), 9);
  gline(circlePts(scx, scy, sr, sr), ss(seg(t, T.s3, T.s3 + 1.2)), { w: 1.2, a: a * .8 });
  // Earth's orbit (a long arc around the Sun) and Earth on it
  gline(circlePts(scx, scy, ex - scx, ex - scx, -.42, .42, 80), ss(seg(t, T.s3 + .4, T.s3 + 1.8)), { w: .8, a: a * .45, tip: false });
  earth(ex, ey, er, t, { a, p: ss(seg(t, T.s3 + .5, T.s3 + 1.4)), light: [-1, 0], lit: 1 });
  // the line between them, the photon, and the clock 0:00 → 8:20
  const u = eio(seg(t, S3.t0, S3.t1)), x0 = scx + sr + 8, x1 = ex - er - 8;
  gline([[x0, scy], [x1, ey]], ss(seg(t, T.s3 + .6, T.s3 + 1.6)), { w: .9, a: a * .55, tip: false });
  if (t > S3.t0 && t < S3.t1 + .4) { ctx.globalCompositeOperation = 'lighter'; const x = lerp(x0, x1, u), xp = lerp(x0, x1, eio(seg(t - 1 / 48, S3.t0, S3.t1))); streak(xp, scy, x, scy, 1, 3, WHITE); pt(x, scy, 1.8 * a, 1.4, SPR.white); pt(x, scy, .6 * a, 8, SPR.gold); ctx.globalAlpha = 1; }
  const ty = 770; gline([[x0, ty], [x1, ty]], ss(seg(t, T.s3 + .8, T.s3 + 2.0)), { w: .9, a: a * .7, tip: false });
  for (let k = 0; k <= 10; k++) { const x = lerp(x0, x1, k / 10); gline([[x, ty - (k % 5 ? 6 : 12)], [x, ty + (k % 5 ? 6 : 12)]], ss(seg(t, T.s3 + 1.0 + k * .05, T.s3 + 1.5 + k * .05)), { w: .8, a: a * .6, tip: false }); }
  const secs = Math.round(500 * u), mm = Math.floor(secs / 60), sc = secs % 60;
  if (t > S3.t0) { ctx.globalCompositeOperation = 'lighter'; pt(lerp(x0, x1, u), ty, 1.2 * a, 1.2, SPR.white); ctx.globalAlpha = 1;
    text(`${mm}:${String(sc).padStart(2, '0')}`, lerp(x0, x1, u), ty + 44, { size: 30, track: 2, col: WHITE, align: 'center', a: a * .9, weight: 500 }); }
  text('0', x0, ty - 34, { size: 22, track: 2, col: GOLD, align: 'center', a: a * .7 * ss(seg(t, T.s3 + 1.2, T.s3 + 1.8)) });
  text('SUNLIGHT', 960, 200, { size: 46, track: 14, col: PALE, align: 'center', p: eo(seg(t, T.s3 + .5, T.s3 + 1.7)), a });
  text('8 MINUTES 20 SECONDS', 960, 262, { size: 34, track: 8, col: GOLD, align: 'center', italic: true, p: eo(seg(t, 28.3, 29.3)), a });
  reading(scx - sr * .7, scy - sr * .72, 200, 250, 'THE SUN', 'our nearest star',  seg(t, T.s3 + 1.4, T.s3 + 2.6) * a, { align: 'left' });
  reading(ex, ey - er, ex + 40, 380, 'EARTH', '≈ 150 million km away', seg(t, T.s3 + 1.8, T.s3 + 3.0) * a);
  text('light ≈ 300,000 km every second', (x0 + x1) / 2, ty - 40, { size: 22, track: 2, col: GOLD, align: 'center', italic: true, a: a * .8, p: eo(seg(t, 26.6, 27.6)) });
}
// S4 — distant stars, light-years (30.7 – 37.3): a dive deeper (streaks), then stars at marked distances send light to the observer
const S4 = { obs: [250, 860] };
const S4STARS = [{ name: 'PROXIMA CENTAURI', d: '4.2 LIGHT-YEARS', r: .2, x: 560, y: 610 }, { name: 'SIRIUS', d: '8.6 LIGHT-YEARS', r: .32, x: 760, y: 420 }, { name: '', d: '100 LIGHT-YEARS', r: .6, x: 1220, y: 520 }, { name: '', d: '1,000 LIGHT-YEARS', r: .9, x: 1560, y: 360, left: true }];
function scene4(t) {
  const a = fadeIO(t, T.s4 + 1.2, T.s5 + .4, .8), [ox, oy] = S4.obs;
  if (a <= 0) return;
  ground(900, t, a * .8, .5); observer(ox, oy + 20, .9, t, { look: .7, a });
  // the distance ruler: logarithmic, labelled in light-years (a distance), with the definition beside it
  const rx0 = ox + 70, rx1 = 1820, ry = 980, X = ly => lerp(rx0, rx1, Math.log10(ly + 1) / Math.log10(1001));
  gline([[rx0, ry], [rx1, ry]], ss(seg(t, 32.4, 33.4)), { w: .9, a: a * .7, tip: false });
  for (const ly of [1, 4.2, 8.6, 10, 100, 1000]) gline([[X(ly), ry - 8], [X(ly), ry + 8]], ss(seg(t, 32.8, 33.6)), { w: .8, a: a * .6, tip: false });
  for (const [ly, s] of [[1, '1'], [10, '10'], [100, '100'], [1000, '1,000']]) text(s, X(ly), ry + 30, { size: 20, track: 2, col: GOLD, align: 'center', a: a * .75 * ss(seg(t, 33.0, 33.8)) });
  text('LIGHT-YEARS', 960, 180, { size: 48, track: 16, col: PALE, align: 'center', p: eo(seg(t, 32.6, 33.8)), a });
  text('a light-year is a distance: how far light travels in one year ≈ 9.46 trillion km', 960, 236, { size: 25, track: 1.5, col: GOLD, align: 'center', italic: true, p: eo(seg(t, 33.4, 34.8)), a: a * .9 });
  S4STARS.forEach((s, i) => { const t0 = 33.2 + i * .45, k = ss(seg(t, t0, t0 + .5)); if (k <= 0) return;
    ctx.globalCompositeOperation = 'lighter'; pt(s.x, s.y, (1.3 - s.r * .5) * a * k, 1.2, SPR.white); pt(s.x, s.y, .4 * a * k, 6, SPR.gold); ctx.globalAlpha = 1;
    // a trail of light from the star toward the observer's eye; farther stars' light set out earlier, it keeps arriving
    const eye = [ox + 6, oy - 130], u = (t * (.55 - s.r * .3) + i * .3) % 1;
    gline([[s.x, s.y], eye], k, { w: .7, a: a * .35, tip: false });
    ctx.globalCompositeOperation = 'lighter'; for (let j = 0; j < 3; j++) { const v = (u + j / 3) % 1; pt(lerp(s.x, eye[0], v), lerp(s.y, eye[1], v), .9 * a * k * Math.sin(Math.PI * v), 1.2, SPR.gold); } ctx.globalAlpha = 1;
    gline([[s.x, s.y + 10], [s.x, ry - 10]], k, { w: .5, a: a * .22, tip: false });
    reading(s.x, s.y, s.left ? s.x - 24 : s.x + 24, s.y - 64, s.name || s.d, s.name ? s.d : '', seg(t, t0 + .2, t0 + 1.2) * a, { size: 19 }); });
  text('light from 1,000 light-years away set out about 1,000 years ago', 960, 300, { size: 25, track: 1.5, col: WHITE, align: 'center', italic: true, p: eo(seg(t, 34.9, 36.0)), a: a * .85 });
}
// S5 — the cosmic past (37.3 – 43.0): a stippled star; its light travels a long timeline; the star itself can change meanwhile
function scene5(t) {
  const a = fadeIO(t, T.s5 - .2, T.s6 + .6, .9), cx = 470, cy = 520, grow = ss(seg(t, 39.2, 42.0)), r = lerp(150, 215, grow);
  ctx.globalCompositeOperation = 'lighter'; pt(cx, cy, 1.0 * a, 50, grow > .3 ? SPR.bronze : SPR.gold); ctx.globalAlpha = 1;
  stippleSphere(cx, cy, r * ss(seg(t, T.s5 - .1, T.s5 + 1.0)) + .1, t, 12000, { a, e: lerp(.34, .24, grow), seed: 51, spr: grow > .5 ? SPR.bronze : SPR.gold });
  gline(circlePts(cx, cy, r, r), ss(seg(t, T.s5, T.s5 + 1.2)), { w: 1.1, a: a * .7 });
  // the timeline of the light's journey: it left when the star looked like THIS; it arrives a thousand years later
  const x0 = cx + 240, x1 = 1760, y = cy, u = eio(seg(t, 38.0, 42.2));
  gline([[x0, y], [x1, y]], ss(seg(t, 37.6, 38.6)), { w: .9, a: a * .7, tip: false });
  for (let k = 0; k <= 10; k++) { const x = lerp(x0, x1, k / 10); gline([[x, y - (k % 5 ? 6 : 12)], [x, y + (k % 5 ? 6 : 12)]], ss(seg(t, 37.9 + k * .04, 38.4 + k * .04)), { w: .8, a: a * .55, tip: false }); }
  text('year 0', x0, y + 40, { size: 22, track: 2, col: GOLD, align: 'center', italic: true, a: a * .8 * ss(seg(t, 38.2, 38.8)) });
  text('year 1,000', x1, y + 40, { size: 22, track: 2, col: GOLD, align: 'center', italic: true, a: a * .8 * ss(seg(t, 38.2, 38.8)) });
  text('example: a star 1,000 light-years away', (x0 + x1) / 2, y + 80, { size: 22, track: 1.5, col: WHITE, align: 'center', italic: true, a: a * .7 * ss(seg(t, 38.4, 39.2)) });
  // the packet carries the star's old image: a small gold copy of the star as it was at year 0
  const px = lerp(x0, x1, u); ctx.globalCompositeOperation = 'lighter'; const pxp = lerp(x0, x1, eio(seg(t - 1 / 48, 38.0, 42.2))); if (u > 0 && u < 1) streak(pxp, y, px, y, 1, 3, WHITE); ctx.globalAlpha = 1;
  if (u > 0) stippleSphere(px, y - 120, 46, t, 900, { a: a * ss(seg(t, 38.0, 38.6)), e: .3, seed: 52 });
  if (u > 0) gline([[px, y - 70], [px, y - 8]], 1, { w: .6, a: a * .4, tip: false });
  reading(px, y - 166, px > 1300 ? px - 30 : px + 30, y - 236, 'WHAT WE SEE', 'the star as it was', seg(t, 40.4, 41.4) * a, { size: 20 });
  reading(cx + r * .7, cy - r * .72, cx + 210, 210, 'THE STAR NOW', 'it may have changed — or may not', seg(t, 39.8, 40.8) * a, { size: 20 });
  text('WE SEE THE LIGHT FROM ITS PAST.', 960, 880, { size: 44, track: 8, col: PALE, align: 'center', p: eo(seg(t, 40.6, 42.0)), a: a * fadeIO(t, 40.6, T.s6 + .5, .5) });
}
// S6 — the big reveal (43.0 – 48.5): the camera pulls back; thousands of stars; a tiny figure; light-travel-time shells around it
function scene6(t) {
  const a = fadeIO(t, T.s6, T.s7 + 1.2, 1.0), ox = 960, oy = 930, k = ss(seg(t, T.s6, 48.2));
  ground(950, t, a * .7, .5); observer(ox, oy, lerp(.62, .42, k), t, { look: .7, a });
  // looking farther = looking earlier: shells of equal light-travel time around the observer (radii on a log scale)
  [['4 years ago', 4.2], ['100 years ago', 100], ['1,000 years ago', 1000], ['10,000 years ago', 1e4]].forEach(([lab, ly], i) => {
    const t0 = 44.4 + i * .55, p = ss(seg(t, t0, t0 + 1.1)); if (p <= 0) return; const R = lerp(140, 760, Math.log10(ly) / 4) * lerp(1.15, .9, k);
    gline(circlePts(ox, oy - 60, R, R * .62, Math.PI * 1.02, Math.PI * 1.98, 100), p, { w: .8, a: a * .5, tip: false });
    text(lab, ox + Math.cos(Math.PI * 1.28) * R, oy - 60 + Math.sin(Math.PI * 1.28) * R * .62 - 14, { size: 21, track: 2, col: GOLD, italic: true, align: 'right', a: a * .85 * p }); });
  text('LOOKING FARTHER INTO SPACE', 960, 160, { size: 40, track: 10, col: PALE, align: 'center', p: eo(seg(t, 44.4, 45.6)), a: a * fadeIO(t, 44.4, T.s7 + .4, .6) });
  text('is looking further back in time', 960, 214, { size: 34, track: 3, col: GOLD, align: 'center', italic: true, p: eo(seg(t, 46.4, 47.6)), a: a * fadeIO(t, 46.4, T.s7 + .4, .6) });
}
// S7 — the final moment (48.5 – 60): back to the figure; it lifts its gaze; stars glow; the final words; black; gold particles fade
function scene7(t) {
  const fin = ss(seg(t, 58.9, 59.85));
  const a = ss(seg(t, T.s7, T.s7 + 1.4)) * (1 - fin);
  ground(880, t, a); observer(960, 882, 1.15, t, { look: .45 + .5 * ss(seg(t, 49.5, 52.0)), a });
  // stars glow up around the figure as it looks
  const R = mulberry(71); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 60; i++) { const x = 960 + (R() - .5) * 1500, y = 120 + R() * 560, k = ss(seg(t, 50 + R() * 5, 51.5 + R() * 5)); pt(x, y, k * (1 - fin) * (.6 + .4 * Math.sin(t * 2 + i)), 1.2, SPR.gold); pt(x, y, k * (1 - fin) * .25, 6, SPR.gold); } ctx.globalAlpha = 1;
  const tf = (1 - ss(seg(t, 59.2, 59.9)));
  text('WE ARE LOOKING AT THE PAST.', 960, 230, { size: 52, track: 12, col: PALE, align: 'center', p: eo(seg(t, 56.3, 57.6)), a: tf });
  text('हम ब्रह्मांड का अतीत देख रहे हैं।', 960, 302, { font: 'NSD', size: 32, col: GOLD, align: 'center', weight: 300, p: eo(seg(t, 56.9, 58.0)), a: .92 * tf });
  // golden particle fade: the last points drift up and go out
  if (t > 58.6) { const R2 = mulberry(81); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 260; i++) { const k = seg(t, 58.6 + R2() * .4, 60), x = 760 + R2() * 400 + Math.sin(k * 3 + i) * 30, y = 160 + R2() * 180 - k * 120; pt(x, y, .5 * Math.sin(Math.PI * k), 1.3, SPR.gold); } ctx.globalAlpha = 1; }
}

// ---------------------------------------------------------------- subtitles (small, warm, bottom centre)
function subs(t) {
  for (const [id, t0] of VO) { const d = DURS[id] || 3, t1 = t0 + Math.max(1.6, d + .35); if (t < t0 || t >= t1 || !LINES[id]) continue;
    const a = Math.min(1, (t - t0) / .25, (t1 - t) / .25);
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.font = "300 28px NSD"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = rgba(WHITE, .82 * a); ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 8; ctx.fillText(LINES[id], W / 2, H - 46); ctx.restore(); }
}
// ---------------------------------------------------------------- frame
const SKYDIM = keys([[0, 1], [9.9, 1], [11, .75], [24.0, .75], [25, .45], [30.6, .45], [31.0, .95], [37.0, .95], [37.8, .42], [43, .6], [47, 1.15], [48.5, 1.0], [58.9, 1.0], [59.85, 0]]);
const DUSTA = keys([[0, 0], [3, 0], [7, 1], [9.9, .6], [30.7, .5], [31, .8], [37.3, .5], [43, .8], [48.5, 1], [58.9, 1], [59.85, 0]]);
const WIN = [[0, 10.6, scene1], [9.3, 25.1, scene2], [23.8, 31.4, scene3], [30.7, 38.0, scene4], [36.8, 43.7, scene5], [42.6, 49.8, scene6], [48.3, 60, scene7]];
let BLOOM, BG;
function render(t) {
  t = clamp(t, 0, DUR - 1e-4);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.letterSpacing = '0px';
  ctx.fillStyle = '#020203'; ctx.fillRect(0, 0, W, H);
  CAM = { x: camX(t), y: camY(t), z: camZ(t), f: 900 };
  const vis = t < .5 ? 0 : t < 1.6 ? .0004 : lerp(.0004, 1, Math.pow(ei(seg(t, 1.6, 7.5)), .7));
  starField(t, { vis, dim: SKYDIM(t), streak: t > 30.75 && t < 32.6 });
  dust(t, DUSTA(t));
  for (const [a0, a1, fn] of WIN) if (t >= a0 && t < a1) fn(t);
  // cross-scene overlap: the outgoing scene's diagrams fade out over the start of the next (no hard cuts; the star field is continuous)
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // bloom: a quarter-size blurred copy added back (the points' halo and the lines' glow)
  const b = BLOOM.getContext('2d'); b.globalCompositeOperation = 'copy'; b.filter = 'blur(6px)'; b.drawImage(cv, 0, 0, W / 4, H / 4); b.filter = 'none';
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .55; ctx.drawImage(BLOOM, 0, 0, W, H); ctx.restore();
  // vignette and a static sub-LSB dither against banding
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = .035; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(BG, 0, 0); ctx.restore();
  subs(t);
  const fin = ss(seg(t, 59.55, 60)); if (fin > 0) { ctx.fillStyle = `rgba(0,0,0,${fin})`; ctx.fillRect(0, 0, W, H); }
}
function events() {
  const ev = VO.map(([id, t]) => ({ t, type: 'line', id })), E = (t, type, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  E(.4, 'first_star'); E(1.6, 'title'); E(2.2, 'figure'); E(5.9, 'title2'); E(T.s2, 'transition'); E(10.6, 'beam_start'); E(S2.arrive, 'beam_arrive');
  E(T.s3, 'transition'); E(S3.t0, 'photon'); E(28.4, 'reading'); E(T.s4, 'dive'); E(33.2, 'star_mark'); E(33.65, 'star_mark'); E(34.1, 'star_mark'); E(34.55, 'star_mark');
  E(T.s5, 'transition'); E(38.0, 'photon'); E(39.2, 'swell'); E(T.s6, 'reveal'); for (let i = 0; i < 4; i++) E(44.4 + i * .55, 'shell'); E(T.s7, 'transition'); E(56.3, 'final'); E(58.6, 'particles');
  return ev.sort((a, b) => a.t - b.t);
}
window.DUR = DUR; window.render = render; window.EV = events(); window.TEXTS = () => [];
(async () => {
  SPR = { gold: makeSprite(GOLD), white: makeSprite(WHITE), bronze: makeSprite(BRONZE) };
  BLOOM = document.createElement('canvas'); BLOOM.width = W / 4; BLOOM.height = H / 4;
  BG = document.createElement('canvas'); BG.width = W; BG.height = H; { const g = BG.getContext('2d'), im = g.createImageData(W, H), R = mulberry(5); for (let i = 0; i < W * H; i++) { const v = 128 + (R() - .5) * 60; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); }
  for (const f of ['400 58px Corm', 'italic 400 40px CormI', '300 32px NSD', '300 28px NSD']) await document.fonts.load(f, 'THE STARS क्या आसमान');
  try { const L = await (await fetch('lines.json')).json(); L.forEach(l => LINES[l.id] = l.text); DURS = await (await fetch('voices/dur.json')).json(); } catch (e) { }
  render(Number(Q.get('t') ?? 8)); window.READY = true;
})();
