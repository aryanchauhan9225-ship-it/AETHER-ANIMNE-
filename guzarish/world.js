'use strict';
// GUZARISH — the painted world: gold-ground sky (day), lapis night with leaf stars, scalloped clouds, Pahari hills and trees,
// mustard fields, a river in basket-weave water, the haveli (cusped arches, jharokhas, gold chhatri domes), the arcade,
// the rooftop terrace, lanterns, the moon, the moon-letters, petals, cranes and the page border.
// Every shape: flat pigment + inner rim + ink + white lead; anything that shines is leaf (it only flashes when light crosses it).

let PAINTC;
function makePaint() {   // ground ultramarine as paint: granular, deep, matte (from the style's demo)
  const s = 512, c = cnv(s, s), g = c.getContext('2d'); g.drawImage(GRAINC, 0, 0);
  const im = g.getImageData(0, 0, s, s), d = im.data, A = [18, 26, 92], B = [52, 76, 170];
  for (let i = 0; i < d.length; i += 4) { const v = d[i] / 255, u = clamp(v * 1.15 - .1); d[i] = lerp(A[0], B[0], u); d[i + 1] = lerp(A[1], B[1], u); d[i + 2] = lerp(A[2], B[2], u); }
  g.putImageData(im, 0, 0); return c;
}
function paint(g, path, fill, rim, rimW, lw = 2.4) { g.fillStyle = fill; g.fill(path); if (rim) rimShade(g, path, rim, rimW || 10); ink(g, path, lw); maskErase(g, path); }
const R_ = s => mulberry(s);
const wob = (t, k, a) => Math.sin(t * k) * a;

// ============================================================== sky
function skyGold(g, x0, y0, x1, y1, o = {}) {   // a gold ground, the miniature's day sky
  const p = P2(q => q.rect(x0, y0, x1 - x0, y1 - y0)); leaf(g, p, [x0, y0, x1 - x0, y1 - y0], { line: false, rim: false, dim: o.dim });
  for (let x = x0 + 60; x < x1; x += 180) for (let y = y0 + 60; y < y1; y += 180) { g.fillStyle = 'rgba(110,60,5,.35)'; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; g.beginPath(); g.arc(x + Math.cos(a) * 14, y + Math.sin(a) * 14, 2.4, 0, TAU); g.fill(); } }   // punched rosettes
}
function skyNight(g, x0, y0, x1, y1, stars, t, show = 1) {
  const p = P2(q => q.rect(x0, y0, x1 - x0, y1 - y0)); if (!g.__paint) g.__paint = g.createPattern(PAINTC, 'repeat');
  g.fillStyle = g.__paint; g.fill(p); maskErase(g, p);
  for (const s of stars) { if (s.k > show) continue; const a = ss((show - s.k) * 8), r = s.r * a; if (r < 1) continue; const sp = P2(q => star8(q, s.x, s.y, r, .42, s.rot)); leaf(g, sp, [s.x - r, s.y - r, 2 * r, 2 * r], { lw: 1.6 }); gpush(s.x, s.y, s.r * 2.2, 1); }
}
function makeStars(seed, x0, y0, x1, y1, n, rmin = 7, rmax = 16) { const R = R_(seed), S = []; for (let i = 0; i < n; i++) S.push({ x: lerp(x0, x1, R()), y: lerp(y0, y1, R() ** 1.3), r: lerp(rmin, rmax, R() ** 2), rot: R(), k: R() }); return S; }
function cloud(g, x, y, s, o = {}) {   // a scalloped miniature cloud: a band of lobes, pale lilac with a white-lead crest line
  const n = o.n || 6, R = R_(o.seed || 3), lobes = []; for (let i = 0; i < n; i++) lobes.push([x + (i - (n - 1) / 2) * 52 * s, y - (Math.sin(i / (n - 1) * Math.PI) * 34 + R() * 12) * s, (30 + R() * 16) * s]);
  const p = P2(q => { for (const [lx, ly, r] of lobes) { q.moveTo(lx + r, ly); q.arc(lx, ly, r, 0, TAU); } q.rect(lobes[0][0], y - 18 * s, lobes[n - 1][0] - lobes[0][0], 34 * s); });
  const col = o.col || ['#e6e1f1', '#b2a8cf'];
  g.fillStyle = col[0]; g.fill(p, 'nonzero'); rimShade(g, p, col[1], 8 * s);
  ink(g, P2(q => { q.moveTo(lobes[0][0] - lobes[0][2], y + 16 * s); for (const [lx, ly, r] of lobes) q.arc(lx, ly, r, Math.PI, 0); q.lineTo(lobes[n - 1][0] + lobes[n - 1][2], y + 16 * s); q.closePath(); }), 2.2);
  maskErase(g, p);
  for (const [lx, ly, r] of lobes) hiLine(g, [[lx - r * .6, ly - r * .3], [lx - r * .1, ly - r * .7], [lx + r * .45, ly - r * .5]], 2, .8);
  g.strokeStyle = col[1]; g.lineWidth = 2.2; for (const [lx, ly, r] of lobes) { g.beginPath(); g.arc(lx, ly + r * .2, r * .55, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
}
function sunDisc(g, x, y, r, t, o = {}) {   // the setting sun: a leaf disc in a vermilion ring, wavy and straight leaf rays
  const n = 16, rays = P2(q => { for (let k = 0; k < n; k++) { const a = k / n * TAU + t * .05, a2 = a + TAU / n * .32, wv = k % 2; q.moveTo(x + Math.cos(a) * r * 1.08, y + Math.sin(a) * r * 1.08);
    if (wv) { for (let j = 1; j <= 6; j++) { const u = j / 6, rr = r * (1.08 + .5 * u), aa = a + TAU / n * .16 + Math.sin(u * 9) * .05; q.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } q.lineTo(x + Math.cos(a2) * r * 1.08, y + Math.sin(a2) * r * 1.08); }
    else { q.lineTo(x + Math.cos(a + TAU / n * .16) * r * 1.62, y + Math.sin(a + TAU / n * .16) * r * 1.62); q.lineTo(x + Math.cos(a2) * r * 1.08, y + Math.sin(a2) * r * 1.08); } q.closePath(); } });
  leaf(g, rays, [x - r * 1.7, y - r * 1.7, r * 3.4, r * 3.4], { lw: 2, dim: o.dim });
  const ring = P2(q => q.arc(x, y, r * 1.08, 0, TAU)); paint(g, ring, VERM, VERM_D, 10, 2.4);
  const disc = P2(q => q.arc(x, y, r, 0, TAU)); leaf(g, disc, [x - r, y - r, 2 * r, 2 * r], { lw: 2.4, rimW: 10, dim: o.dim });
  pearls(g, x, y, r * 1.04, 40, 3.2, .9); gpush(x, y, r * 1.4, 1.2);
}
function moonDisc(g, x, y, r, o = {}) {   // mahtab: a leaf disc cooled with silver-white, a lapis ring, pearls
  const ring = P2(q => q.arc(x, y, r * 1.1, 0, TAU)); paint(g, ring, '#2c4aa8', ULTRA_D, 10, 2.4);
  const disc = P2(q => q.arc(x, y, r, 0, TAU)); leaf(g, disc, [x - r, y - r, 2 * r, 2 * r], { lw: 2.4, rimW: 10, dim: o.dim });
  g.save(); g.clip(disc); g.fillStyle = 'rgba(232,236,252,.32)'; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.fillStyle = 'rgba(150,140,170,.22)'; for (const [dx, dy, rr] of [[-.3, -.2, .22], [.25, .1, .16], [-.05, .38, .12], [.35, -.35, .1]]) { g.beginPath(); g.arc(x + dx * r, y + dy * r, rr * r, 0, TAU); g.fill(); } g.restore();
  pearls(g, x, y, r * 1.05, 44, 3, .92); gpush(x, y, r * 1.3, 1.3);
}

// ============================================================== land
function hillPath(pts, base) { return P2(q => { const c = catmull(pts, 10); q.moveTo(c[0][0], base); c.forEach(p => q.lineTo(p[0], p[1])); q.lineTo(c[c.length - 1][0], base); q.closePath(); }); }
function hill(g, pts, base, col, seed) {
  const p = hillPath(pts, base); paint(g, p, col[0], col[1], 18, 2.4);
  const c = catmull(pts, 10); hiLine(g, c.filter((_, i) => i % 2 === 0).map(q => [q[0], q[1] + 6]), 2, .55);
  const R = R_(seed); g.save(); g.clip(p); for (let i = 0; i < c.length; i += 3) { const [x, y] = c[i]; for (let k = 0; k < 3; k++) triad(g, x + R() * 40, y + 30 + R() * 120, 2.2, .7); } g.restore();
}
function tree(g, x, y, s, t, kind = 'round', seed = 1, wind = .4) {
  const R = R_(seed), a = Math.sin(t * 1.3 + seed) * .025 * wind + Math.sin(t * 3.1 + seed * 2) * .008 * wind;
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
  const trunk = tubePath([[0, 0], [4, -70], [-2, -130]], [24, 18, 14], false, false); paint(g, trunk, WOOD, WOOD_D, 6, 2);
  if (kind === 'cypress') {
    const c = P2(q => { q.moveTo(0, -330); q.bezierCurveTo(40, -250, 44, -110, 0, -50); q.bezierCurveTo(-44, -110, -40, -250, 0, -330); q.closePath(); });
    paint(g, c, '#1f5232', '#123620', 10, 2.2); for (let k = 0; k < 9; k++) { const yy = -300 + k * 28; g.strokeStyle = '#3f7a50'; g.lineWidth = 2; g.beginPath(); g.moveTo(-18 + Math.abs(k - 4) * 2, yy); g.quadraticCurveTo(0, yy + 14, 18 - Math.abs(k - 4) * 2, yy); g.stroke(); }
    hiLine(g, [[10, -300], [24, -200], [18, -100]], 1.8, .5);
  } else {
    const lobes = []; for (let i = 0; i < 9; i++) { const an = Math.PI + i / 8 * Math.PI, rr = 100 + R() * 20; lobes.push([Math.cos(an) * rr * 1.1, -170 + Math.sin(an) * rr * .9, 46 + R() * 14]); }
    lobes.push([0, -180, 90]);
    const c = P2(q => { for (const [lx, ly, r] of lobes) { q.moveTo(lx + r, ly); q.arc(lx, ly, r, 0, TAU); } });
    g.fillStyle = kind === 'blossom' ? '#2f6b3a' : '#24552f'; g.fill(c); rimShade(g, c, '#163a1f', 12);
    const outline = P2(q => { for (const [lx, ly, r] of lobes.slice(0, 9)) { q.moveTo(lx + r, ly); q.arc(lx, ly, r, Math.PI * .9, Math.PI * 2.1); } }); ink(g, outline, 2.2); maskErase(g, c);
    for (let k = 0; k < 26; k++) { const an = R() * TAU, rr = R() ** .5 * 110, lx = Math.cos(an) * rr * 1.1, ly = -180 + Math.sin(an) * rr * .8;   // leaf clusters + white-lead triads
      g.fillStyle = '#3f8a4a'; g.beginPath(); g.ellipse(lx, ly, 9, 4, an, 0, TAU); g.fill(); if (k % 2) triad(g, lx + 6, ly + 6, 2, .8);
      if (kind === 'blossom') { g.fillStyle = k % 3 ? ROSE : '#f4d6dc'; g.beginPath(); g.arc(lx - 5, ly - 4, 5, 0, TAU); g.fill(); } }
  }
  g.restore();
}
function mustard(g, x0, x1, y0, y1, t, seed, wind = .5, s = 1) {   // a field: green rows, pale-lemon flower dots on top, swaying
  const R = R_(seed), rows = Math.max(3, Math.round((y1 - y0) / (34 * s)));
  const p = P2(q => q.rect(x0, y0, x1 - x0, y1 - y0)); paint(g, p, '#4d7a34', '#33572a', 12 * s, 2);
  for (let j = 0; j < rows; j++) { const y = y0 + (j + .5) * (y1 - y0) / rows;
    for (let x = x0 + R() * 20 * s; x < x1; x += (14 + R() * 8) * s) { const sw = Math.sin(t * 1.9 - x * .004 + j) * 6 * wind * s;
      g.strokeStyle = '#2f5a24'; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(x, y + 12 * s); g.lineTo(x + sw, y - 6 * s); g.stroke();
      g.fillStyle = '#f1e48a'; g.beginPath(); g.arc(x + sw, y - 8 * s, 4.2 * s, 0, TAU); g.fill(); g.fillStyle = '#c9b34a'; g.beginPath(); g.arc(x + sw + 1, y - 7 * s, 1.6 * s, 0, TAU); g.fill(); } }
}
function stalks(g, x0, x1, base, t, seed, s = 1, wind = .6) {   // near mustard stalks close to the lens (parallax foreground)
  const R = R_(seed);
  for (let x = x0; x < x1; x += (26 + R() * 30) * s) { const h = (160 + R() * 160) * s, sw = Math.sin(t * 1.7 - x * .003) * 26 * wind * s + Math.sin(t * 4.1 + x) * 4 * s;
    const st = curveP([[x, base], [x + sw * .3, base - h * .5], [x + sw, base - h]]); g.strokeStyle = INK; g.lineWidth = 6 * s; g.stroke(st); g.strokeStyle = '#3d6a2c'; g.lineWidth = 3.6 * s; g.stroke(st);
    for (let k = 0; k < 3; k++) { const lx = x + sw * (.3 + k * .2), ly = base - h * (.3 + k * .18), d = k % 2 ? 1 : -1; const lf = P2(q => { q.moveTo(lx, ly); q.quadraticCurveTo(lx + d * 30 * s, ly - 26 * s, lx + d * 50 * s, ly - 8 * s); q.quadraticCurveTo(lx + d * 24 * s, ly - 2 * s, lx, ly); }); paint(g, lf, '#3d6a2c', '#2a4a1e', 3, 1.6); }
    for (let k = 0; k < 7; k++) { const fx = x + sw + (R() - .5) * 26 * s, fy = base - h - R() * 30 * s; g.fillStyle = INK; g.beginPath(); g.arc(fx, fy, 7.5 * s, 0, TAU); g.fill(); g.fillStyle = '#f1e48a'; g.beginPath(); g.arc(fx, fy, 6 * s, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,252,240,.9)'; g.beginPath(); g.arc(fx - 1.5 * s, fy - 1.5 * s, 1.6 * s, 0, TAU); g.fill(); }
  }
}
function river(g, pts, w, t) {   // miniature water: azure band with basket-weave white-lead ripples drifting
  const p = tubePath(pts, pts.map(() => w), false, false); paint(g, p, AZUR, AZUR_D, 12, 2.2);
  g.save(); g.clip(p); g.strokeStyle = 'rgba(240,248,255,.75)'; g.lineWidth = 2;
  const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), bx0 = Math.min(...xs) - w, bx1 = Math.max(...xs) + w, by0 = Math.min(...ys) - w, by1 = Math.max(...ys) + w;
  for (let y = by0; y < by1; y += 18) for (let x = bx0 + ((y / 18) % 2) * 22 + (t * 30) % 44; x < bx1; x += 44) { g.beginPath(); g.arc(x, y, 12, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  g.restore();
}
function crane(g, x, y, s, t, ph) {   // a white crane in flight, wings beating
  const f = Math.sin(t * 5.5 + ph), up = f * 34;
  g.save(); g.translate(x, y); g.scale(s, s);
  const body = P2(q => { q.ellipse(0, 0, 40, 11, -.05, 0, TAU); }); paint(g, body, '#f6f1e6', '#c9c1b0', 4, 2);
  const neck = tubePath([[34, -4], [60, -10], [84, -8]], [9, 6, 6], false, true); paint(g, neck, '#f6f1e6', '#c9c1b0', 2, 1.8);
  g.fillStyle = VERM; g.beginPath(); g.arc(84, -10, 3.4, 0, TAU); g.fill(); g.strokeStyle = OCHRE_D; g.lineWidth = 3; g.beginPath(); g.moveTo(88, -8); g.lineTo(108, -2); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-36, 4); g.lineTo(-80, 14); g.moveTo(-36, 6); g.lineTo(-80, 18); g.stroke();
  for (const side of [0, 1]) { const wy = side ? up : up * .8, wing = P2(q => { q.moveTo(-14, -4); q.quadraticCurveTo(-4, -30 - wy * .5, 18 - wy * .1, -wy - 6); q.quadraticCurveTo(-2, -wy * .5, 14, -2); q.closePath(); });
    paint(g, wing, side ? '#f6f1e6' : '#ded6c4', '#b7ad98', 4, 1.8); g.fillStyle = INK; g.beginPath(); g.arc(18 - wy * .1, -wy - 6, 4, 0, TAU); g.fill(); }
  g.restore();
}
function flock(g, t, x0, y0, vx, vy, s, n, seed) { const R = R_(seed); for (let i = 0; i < n; i++) { const dx = -i * 110 * s * (.9 + R() * .2) * Math.sign(vx || 1), dy = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 50 * s + R() * 20 * s; crane(g, x0 + vx * t + dx, y0 + vy * t + dy + Math.sin(t * 1.3 + i) * 8 * s, s * (vx < 0 ? -1 : 1), t, i * 1.3 + R()); } }

// ============================================================== architecture
// a cusped (multifoil) arch opening: from (cx-w/2, base) up to the springline, lobes along a pointed arch to the apex (cx, top)
function archPath(cx, base, w, spring, top, lobes = 7, q0) {
  const q = q0 || new Path2D(), L = cx - w / 2, Rr = cx + w / 2, curve = []; const n = 24;
  for (let i = 0; i <= n; i++) { const u = i / n, a = u * Math.PI / 2; const x = L + (w / 2) * (1 - Math.cos(a)) ** .9, y = spring - (spring - top) * Math.sin(a) ** 1.25; curve.push([x, y]); }
  q.moveTo(L, base); q.lineTo(L, spring);
  const half = c => { const per = Math.floor(c.length / lobes) || 1; for (let k = 0; k < lobes; k++) { const a = c[Math.min(k * per, c.length - 1)], b = c[Math.min((k + 1) * per, c.length - 1)], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    q.quadraticCurveTo(mx + dy / l * l * .55, my - dx / l * l * .55, b[0], b[1]); } };
  half(curve); const mir = curve.slice().reverse().map(([x, y]) => [2 * cx - x, y]); q.lineTo(mir[0][0], mir[0][1]); half(mir);
  q.lineTo(Rr, base); q.closePath(); return q;
}
function lantern(g, x, y, s, lit, t, seed = 0, post = false) {   // a hanging brass lantern: chain, pierced leaf body, a flame behind glass when lit
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * 1.4 + seed) * .05); g.scale(s, s);
  if (!post) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -140); g.lineTo(0, -40); g.stroke(); }
  const glass = P2(q => { q.moveTo(-22, -20); q.lineTo(22, -20); q.lineTo(26, 30); q.lineTo(-26, 30); q.closePath(); });
  g.fillStyle = mixHex('#2a2a40', '#ffd890', lit); g.fill(glass); ink(g, glass, 1.8); maskErase(g, glass);
  if (lit > .05) { g.fillStyle = rgba('#e8603e', lit); g.beginPath(); g.moveTo(0, 18); g.quadraticCurveTo(-8 - Math.sin(t * 9 + seed) * 2, 4, 0, -10 + Math.sin(t * 11 + seed) * 2); g.quadraticCurveTo(8, 4, 0, 18); g.fill(); g.fillStyle = rgba('#fff6dc', lit); g.beginPath(); g.ellipse(0, 10, 2.6, 5, 0, 0, TAU); g.fill(); }
  const cap = P2(q => { q.moveTo(-30, -20); q.quadraticCurveTo(0, -60, 30, -20); q.closePath(); q.moveTo(-30, 30); q.lineTo(30, 30); q.lineTo(14, 46); q.lineTo(-14, 46); q.closePath(); });
  leaf(g, cap, [-30, -60, 60, 106], { lw: 1.8 }); const fin = P2(q => q.arc(0, -46, 6, 0, TAU)); leaf(g, fin, [-6, -52, 12, 12], { lw: 1.4 });
  for (let k = -1; k <= 1; k++) { g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(k * 12, -20); g.lineTo(k * 14, 30); g.stroke(); }
  g.restore(); gpush(x, y - 30 * s, 50 * s, 1);
  return [x, y + 6 * s];
}
function dome(g, cx, base, w, h) {   // an onion dome in leaf with a finial
  const d = P2(q => { q.moveTo(cx - w / 2, base); q.bezierCurveTo(cx - w * .62, base - h * .5, cx - w * .1, base - h * .7, cx, base - h); q.bezierCurveTo(cx + w * .1, base - h * .7, cx + w * .62, base - h * .5, cx + w / 2, base); q.closePath(); });
  leaf(g, d, [cx - w * .62, base - h, w * 1.24, h], { lw: 2.2 }); const f = tubePath([[cx, base - h], [cx, base - h - h * .35]], [6, 3]); leaf(g, f, [cx - 6, base - h * 1.4, 12, h * .4], { lw: 1.6 });
  g.strokeStyle = 'rgba(110,60,5,.5)'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx + k * w * .17, base); g.quadraticCurveTo(cx + k * w * .14, base - h * .55, cx, base - h); g.stroke(); }
  gpush(cx, base - h * .5, w * .7, 1.1);
}
function chhatri(g, cx, base, w, s = 1) {   // a little domed kiosk on four pillars
  const h = w * .9; const plat = P2(q => q.rect(cx - w * .62, base - 14 * s, w * 1.24, 14 * s)); paint(g, plat, '#efe2cf', '#c9b18f', 4, 2);
  for (const k of [-.45, -.15, .15, .45]) { const p = P2(q => q.rect(cx + k * w - 5 * s, base - 14 * s - h * .55, 10 * s, h * .55)); paint(g, p, '#f3e8d6', '#c9b18f', 3, 1.6); }
  const eave = P2(q => { q.moveTo(cx - w * .7, base - 14 * s - h * .55); q.lineTo(cx + w * .7, base - 14 * s - h * .55); q.lineTo(cx + w * .55, base - 14 * s - h * .66); q.lineTo(cx - w * .55, base - 14 * s - h * .66); q.closePath(); });
  paint(g, eave, VERM, VERM_D, 4, 2); dome(g, cx, base - 14 * s - h * .66, w * .9, h * .62);
}
function wallBlock(g, x0, y0, x1, y1, col = ['#efe2cf', '#c8ad8a']) { const p = P2(q => q.rect(x0, y0, x1 - x0, y1 - y0)); paint(g, p, col[0], col[1], 16, 2.4); return p; }
function crenel(g, x0, x1, y, h) { if (h < 4) return; const p = P2(q => { for (let x = x0; x < x1 - 1; x += h * 1.4) { q.moveTo(x, y); q.lineTo(x, y - h * .7); q.quadraticCurveTo(x + h * .35, y - h * 1.15, x + h * .7, y - h * .7); q.lineTo(x + h * .7, y); q.closePath(); } }); paint(g, p, '#efe2cf', '#c8ad8a', 4, 2); }
// the haveli: symmetric, two storeys, a great cusped gateway, jharokhas with gold chhatris, corner towers with leaf domes
function haveli(g, cx, base, s, t, o = {}) {
  const W2 = 900 * s, H1 = 420 * s, H2 = 300 * s, top = base - H1 - H2, lit = o.lit || 0;
  // corner towers
  for (const d of [-1, 1]) { const tx = cx + d * (W2 / 2 + 70 * s); wallBlock(g, tx - 70 * s, top - 120 * s, tx + 70 * s, base); crenel(g, tx - 76 * s, tx + 76 * s, top - 120 * s, 28 * s);
    for (const yy of [base - 330 * s, top + 80 * s]) { const a = archPath(tx, yy + 80 * s, 50 * s, yy + 30 * s, yy, 5); paint(g, a, mixHex('#2a2448', '#f2b860', lit * .9), INK, 2, 1.8); }
    dome(g, tx, top - 150 * s, 130 * s, 140 * s); }
  // body
  wallBlock(g, cx - W2 / 2, top, cx + W2 / 2, base); const band = P2(q => q.rect(cx - W2 / 2, top + H2 - 16 * s, W2, 22 * s)); paint(g, band, VERM, VERM_D, 4, 2);
  crenel(g, cx - W2 / 2, cx + W2 / 2, top, 30 * s); hiLine(g, [[cx - W2 / 2 + 8, top + 10], [cx + W2 / 2 - 8, top + 10]], 2, .5);
  // the great gate: a deep cusped arch, leaf spandrels, a carved door (open when o.door > 0)
  const gw = 260 * s, gb = base, gs = base - 250 * s, gt = base - 350 * s;
  const frame = P2(q => q.rect(cx - gw / 2 - 40 * s, gt - 40 * s, gw + 80 * s, gb - gt + 40 * s)); paint(g, frame, '#e9d3b4', '#c09a72', 8, 2.2);
  const sp = P2(q => { q.rect(cx - gw / 2 - 20 * s, gt - 20 * s, gw + 40 * s, gs - gt + 20 * s); archPath(cx, gs, gw, gs, gt, 7, q); });
  leaf(g, sp, [cx - gw / 2 - 20 * s, gt - 20 * s, gw + 40 * s, gs - gt + 20 * s], { rule: 'evenodd', lw: 2.2 });
  const gate = archPath(cx, gb, gw, gs, gt, 7); paint(g, gate, mixHex('#3a1c14', '#ffcf80', lit * .7), INK, 2, 2.6);
  if (lit < .9) { g.save(); g.clip(gate); const dw = gw / 2 * (1 - (o.door || 0) * .85); for (const d of [-1, 1]) { const dp = P2(q => q.rect(d < 0 ? cx - gw / 2 : cx + gw / 2 - dw, gt, dw, gb - gt)); paint(g, dp, WOOD, WOOD_D, 8, 2); for (let k = 1; k < 4; k++) for (let j = 1; j < 6; j++) { g.fillStyle = 'rgba(255,230,170,.8)'; g.beginPath(); g.arc((d < 0 ? cx - gw / 2 : cx + gw / 2 - dw) + dw * k / 4, gt + (gb - gt) * j / 6, 3.2 * s, 0, TAU); g.fill(); } } g.restore(); }
  pearlLine(g, [[cx - gw / 2 - 30 * s, gt - 30 * s], [cx + gw / 2 + 30 * s, gt - 30 * s]], 12 * s, 2.4, .9);
  // ground-floor arched windows and upper jharokhas
  for (const d of [-1, 1]) for (let k = 0; k < 2; k++) {
    const wx = cx + d * (230 + k * 150) * s, a = archPath(wx, base - 60 * s, 80 * s, base - 190 * s, base - 250 * s, 5);
    paint(g, a, mixHex('#2a2448', '#f2b860', lit * .85), INK, 2, 2); const jx = wx, jb = top + H2 - 30 * s;
    const bal = P2(q => { q.moveTo(jx - 66 * s, jb); q.lineTo(jx + 66 * s, jb); q.lineTo(jx + 50 * s, jb + 40 * s); q.lineTo(jx - 50 * s, jb + 40 * s); q.closePath(); }); paint(g, bal, '#efe2cf', '#c09a72', 5, 2);
    for (let b = 0; b < 3; b++) { const br = P2(q => { q.moveTo(jx - 40 * s + b * 40 * s, jb + 40 * s); q.lineTo(jx - 32 * s + b * 40 * s, jb + 70 * s); q.lineTo(jx - 24 * s + b * 40 * s, jb + 40 * s); q.closePath(); }); paint(g, br, VERM, VERM_D, 2, 1.6); }
    const win = archPath(jx, jb, 96 * s, jb - 120 * s, jb - 180 * s, 5); paint(g, win, mixHex('#24203c', '#f6c068', lit), INK, 2, 2);
    g.strokeStyle = INK; g.lineWidth = 1.6; for (let j = 1; j < 4; j++) { g.beginPath(); g.moveTo(jx - 48 * s + j * 24 * s, jb); g.lineTo(jx - 48 * s + j * 24 * s, jb - 150 * s); g.stroke(); }
    const eave = P2(q => { q.moveTo(jx - 76 * s, jb - 190 * s); q.lineTo(jx + 76 * s, jb - 190 * s); q.lineTo(jx + 60 * s, jb - 206 * s); q.lineTo(jx - 60 * s, jb - 206 * s); q.closePath(); }); paint(g, eave, VERM, VERM_D, 3, 1.8);
    dome(g, jx, jb - 206 * s, 110 * s, 90 * s);
  }
  // rooftop chhatris and flags
  for (const d of [-1, 1]) { chhatri(g, cx + d * 270 * s, top, 120 * s, s); const fx = cx + d * 270 * s, fy = top - 210 * s; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(fx, fy + 40 * s); g.lineTo(fx, fy - 60 * s); g.stroke();
    const fl = P2(q => { q.moveTo(fx, fy - 60 * s); for (let k = 0; k <= 6; k++) q.lineTo(fx + d * k * 14 * s, fy - 60 * s + Math.sin(t * 5 - k * .8) * 6 * s + k * 2 * s); q.lineTo(fx, fy - 30 * s); q.closePath(); }); paint(g, fl, VERM, VERM_D, 3, 1.6); }
  dome(g, cx, top - 10 * s, 220 * s, 200 * s);
  return { gate: [cx, gb], top, jhar: [cx - 230 * s, top + H2 - 30 * s - 90 * s] };
}

// ============================================================== the moon-letters and petals
function letter(g, x, y, s, open, rot, write = 0, seed = 1) {   // a folded vellum letter; open 0..1 unfolds it; write 0..1 inks its lines
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const w = 120, hgt = 80 + 80 * open, p = P2(q => q.rect(-w / 2, -hgt / 2, w, hgt));
  g.fillStyle = VELL; g.fill(p); rimShade(g, p, '#c9b58a', 6); ink(g, p, 2); maskErase(g, p);
  if (open < .5) { g.strokeStyle = '#b39e70'; g.lineWidth = 2; g.beginPath(); g.moveTo(-w / 2, -hgt / 2); g.lineTo(0, 0); g.lineTo(w / 2, -hgt / 2); g.stroke(); const sl = P2(q => q.arc(0, 2, 13, 0, TAU)); paint(g, sl, VERM, VERM_D, 4, 1.6); }
  else { g.strokeStyle = '#d7c7a0'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.stroke();
    const R = R_(seed); g.strokeStyle = GALL; g.lineWidth = 2; g.lineCap = 'round'; const lines = 6;   // handwriting: flowing ink strokes (no words)
    for (let l = 0; l < lines; l++) { const k = clamp(write * lines - l); if (k <= 0) break; const yy = -hgt / 2 + 22 + l * (hgt - 40) / (lines - 1), x0 = w / 2 - 14, x1 = lerp(x0, -w / 2 + 14 + R() * 20, k);
      g.beginPath(); g.moveTo(x0, yy); for (let x = x0; x >= x1; x -= 3) g.lineTo(x, yy + Math.sin(x * .55 + l * 2) * 2.4 + Math.sin(x * .17 + l) * 1.6 - (Math.sin(x * .9 + l) > .85 ? 5 : 0)); g.stroke(); } }
  const edge = P2(q => q.rect(-w / 2 + 5, -hgt / 2 + 5, w - 10, hgt - 10)); leafCord(g, edge, 2.4, { ink: 0 });
  g.restore(); gpush(x, y, 50 * s, .9);
}
function petals(g, t, x0, y0, x1, y1, n, seed, wind = 1, s = 1, cols = [ROSE, VERM_L, '#f4d6dc', '#f0a040']) {
  const R = R_(seed), w = x1 - x0, h = y1 - y0;
  for (let i = 0; i < n; i++) { const sp = .5 + R(), ph = R() * 10, x = x0 + ((R() * w + t * 120 * sp * wind) % w + w) % w, y = y0 + ((R() * h + t * 60 * sp) % h + h) % h + Math.sin(t * 1.5 + ph) * 20 * s, a = t * 2 * sp + ph, sc = (.7 + .5 * R()) * s;
    g.save(); g.translate(x, y); g.rotate(a); g.scale(sc, sc * (.4 + .6 * Math.abs(Math.cos(t * 3 * sp + ph)))); g.fillStyle = cols[i % cols.length];
    g.beginPath(); g.moveTo(-12, 0); g.quadraticCurveTo(0, -11, 12, 0); g.quadraticCurveTo(0, 11, -12, 0); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.6 / sc; g.stroke(); g.restore(); }
}

// ============================================================== the page border (grows from the corners), and the plaque
function border(g, X0, Y0, X1, Y1, b, k, t) {
  if (k <= 0) return; const WW = X1 - X0, WH = Y1 - Y0;
  g.save(); const L = k * WW * .52, Lh = k * WH * .52;
  const clipG = P2(q => { q.rect(X0 - 10, Y0 - 10, L + 10, b + 10); q.rect(X1 - L, Y0 - 10, L + 10, b + 10); q.rect(X0 - 10, Y1 - b, L + 10, b + 10); q.rect(X1 - L, Y1 - b, L + 10, b + 10);
    q.rect(X0 - 10, Y0 - 10, b + 10, Lh + 10); q.rect(X0 - 10, Y1 - Lh, b + 10, Lh + 10); q.rect(X1 - b, Y0 - 10, b + 10, Lh + 10); q.rect(X1 - b, Y1 - Lh, b + 10, Lh + 10); });
  const outer = P2(q => { q.rect(X0 - 10, Y0 - 10, WW + 20, WH + 20); q.rect(X0 + b, Y0 + b, WW - 2 * b, WH - 2 * b); });
  g.clip(clipG); g.clip(outer, 'evenodd');
  const band = P2(q => { q.rect(X0, Y0, WW, WH); q.rect(X0 + b, Y0 + b, WW - 2 * b, WH - 2 * b); }); g.fillStyle = VERM; g.fill(band, 'evenodd'); rimShade(g, band, VERM_D, 14); maskErase(g, band);
  const inner = P2(q => { q.rect(X0 + b * .22, Y0 + b * .22, WW - b * .44, WH - b * .44); q.rect(X0 + b * .78, Y0 + b * .78, WW - b * 1.56, WH - b * 1.56); }); g.fillStyle = ULTRA; g.fill(inner, 'evenodd'); maskErase(g, inner);
  // a gold vine of buds along the blue band
  const run = (ax, ay, bx, by) => { const len = Math.hypot(bx - ax, by - ay), nx = (by - ay) / len, ny = -(bx - ax) / len, pts = []; for (let s = 0; s <= len; s += 8) { const u = s / len; pts.push([lerp(ax, bx, u) + nx * Math.sin(s / 46 * TAU) * b * .12, lerp(ay, by, u) + ny * Math.sin(s / 46 * TAU) * b * .12]); } return pts; };
  const m = b / 2; for (const [ax, ay, bx, by] of [[X0 + m, Y0 + m, X1 - m, Y0 + m], [X1 - m, Y0 + m, X1 - m, Y1 - m], [X1 - m, Y1 - m, X0 + m, Y1 - m], [X0 + m, Y1 - m, X0 + m, Y0 + m]]) {
    const pts = run(ax, ay, bx, by); leafCord(g, polyPath(pts), b * .05, { ink: 1.6 }); for (let i = 3; i < pts.length; i += 6) { const bud = P2(q => q.arc(pts[i][0], pts[i][1], b * .06, 0, TAU)); if ((i / 6 | 0) % 2) leaf(g, bud, [pts[i][0] - 10, pts[i][1] - 10, 20, 20], { lw: 1.4 }); else { g.fillStyle = 'rgba(255,252,240,.92)'; g.fill(bud); } } }
  ink(g, inner, 2); g.restore();
  for (const [cx, cy] of [[X0 + m, Y0 + m], [X1 - m, Y0 + m], [X0 + m, Y1 - m], [X1 - m, Y1 - m]]) { if (k < .02) break; const r = b * .32 * Math.min(1, k * 6), ro = P2(q => star8(q, cx, cy, r, .5)); leaf(g, ro, [cx - r, cy - r, 2 * r, 2 * r], { lw: 1.8 }); gpush(cx, cy, r * 2, 1); }
  const fil = (e, w) => { const p = new Path2D(); p.moveTo(X0 + e, Y0 + e + Lh); p.lineTo(X0 + e, Y0 + e); p.lineTo(X0 + e + L, Y0 + e); p.moveTo(X1 - e - L, Y0 + e); p.lineTo(X1 - e, Y0 + e); p.lineTo(X1 - e, Y0 + e + Lh);
    p.moveTo(X1 - e, Y1 - e - Lh); p.lineTo(X1 - e, Y1 - e); p.lineTo(X1 - e - L, Y1 - e); p.moveTo(X0 + e + L, Y1 - e); p.lineTo(X0 + e, Y1 - e); p.lineTo(X0 + e, Y1 - e - Lh); leafCord(g, p, w, { ink: 2.4 }); };
  fil(b - 2, b * .08);
}
