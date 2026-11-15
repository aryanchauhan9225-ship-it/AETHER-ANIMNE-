'use strict';
// आखिरी चिट्ठी — painting kit on top of the Watercolor Brush engine (engine.js).
// A shape is: paper reserved (opaque, screen-aligned paper texture) → a transparent wash in two jittered multiply passes →
// a pooled darker edge inside the shape → optionally a brush-stroke contour from the stroke engine (never a vector line).
let PAPER_IMG, PAPAT, PAPC;
const TAU = Math.PI * 2;
const smooth = (pts, k = 6, closed = true) => {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]], out = [];
  for (let i = 1; i < P.length - 2; i++) { const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    for (let j = 0; j < k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); } }
  if (!closed) out.push(pts[pts.length - 1]); return out;
};
const pathOf = (pts, close = true) => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); if (close) p.closePath(); return p; };
function paperFill(c, path, rule) { const m = c.getTransform(); PAPAT.setTransform(m.inverse()); c.fillStyle = PAPAT; c.fill(path, rule || 'nonzero'); }
let SEEDK = 1;
// wash a closed point list (or a Path2D with o.path). o: a (opacity), reserve, edge (pooled-edge strength), line (brush contour colour), lw, seed, k (smoothing)
function wash(c, pts, col, o = {}) {
  const sp = o.path ? null : (o.raw ? pts : smooth(pts, o.k ?? 5)), path = o.path || pathOf(sp), a = o.a ?? .85, sd = o.seed ?? (SEEDK++);
  if (o.reserve !== false) paperFill(c, path, o.rule);
  c.save(); c.globalCompositeOperation = 'multiply';
  for (let k = 0; k < 2; k++) { c.save(); c.translate((hash(sd * 7 + k) - .5) * 3, (hash(sd * 13 + k) - .5) * 3); c.fillStyle = rgba(col, a * .62); c.fill(path, o.rule || 'nonzero'); c.restore(); }
  if (o.edge !== 0) { c.save(); c.clip(path, o.rule || 'nonzero'); c.strokeStyle = rgba(col, (o.edge ?? .5) * a); c.lineWidth = o.ew ?? 7; c.lineJoin = 'round'; c.stroke(path); c.restore(); }
  if (o.grad) { c.save(); c.clip(path, o.rule || 'nonzero'); c.fillStyle = o.grad; c.fillRect(-6000, -6000, 12000, 12000); c.restore(); }
  c.restore();
  if (o.line && sp) withSeed(sd * 31 + 5, () => drawS(c, mk([...sp, sp[0]], o.lw ?? 3, o.line, { prof: 'even', nb: 0, a: o.la ?? .5, rough: .35 }), 1));
  return path;
}
function stroke(c, pts, w, col, o = {}) { withSeed(o.seed ?? (SEEDK++ * 17), () => drawS(c, mk(o.raw ? pts : smooth(pts, 5, false), w, col, { prof: o.prof || 'even', nb: o.nb ?? 0, a: o.a ?? .75, rough: o.rough ?? .3 }), o.p ?? 1)); }
function glaze(c, path, col, a, mode = 'multiply') { c.save(); c.globalCompositeOperation = mode; c.fillStyle = rgba(col, a); c.fill(path); c.restore(); }
function softDot(c, x, y, r, col, a, mode = 'source-over') { c.save(); c.globalCompositeOperation = mode; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); }
function tube(pts, ws) {   // a smooth tapered limb outline as a point loop
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const w = ws[i] / 2; L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]); }
  const e = pts[n - 1], s = pts[0], capE = [], capS = [];
  { const a0 = Math.atan2(L[n - 1][1] - e[1], L[n - 1][0] - e[0]); for (let k = 1; k < 6; k++) capE.push([e[0] + Math.cos(a0 - k / 6 * Math.PI) * ws[n - 1] / 2, e[1] + Math.sin(a0 - k / 6 * Math.PI) * ws[n - 1] / 2]); }
  { const a0 = Math.atan2(R[0][1] - s[1], R[0][0] - s[0]); for (let k = 1; k < 6; k++) capS.push([s[0] + Math.cos(a0 - k / 6 * Math.PI) * ws[0] / 2, s[1] + Math.sin(a0 - k / 6 * Math.PI) * ws[0] / 2]); }
  return [...L, ...capE, ...R.reverse(), ...capS];
}

// ============================================================== light, air, sky
function skyWash(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([u, col]) => g.addColorStop(u, col)); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0); c.restore(); }
function cloudWash(c, x, y, w, h, col, a, seed) {   // a soft horizontal cloud: several pooled blobs
  for (let i = 0; i < 6; i++) { const u = i / 5, cx = x + (u - .5) * w, cy = y + Math.sin(u * 3 + seed) * h * .2, r = h * (.6 + .5 * Math.sin(u * Math.PI)) * (.8 + .4 * hash(seed + i));
    c.save(); c.globalCompositeOperation = 'multiply'; c.translate(cx, cy); c.scale(1.9, .6); const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(.75, rgba(col, a * .55)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.restore(); }
}
function sunGlow(c, x, y, r, a = 1) { softDot(c, x, y, r * 4, '#fff1cf', .55 * a, 'screen'); softDot(c, x, y, r * 1.3, '#fffaf0', .9 * a, 'screen'); }
function shafts(c, x, y, ang, spread, len, n, a, t, seed = 1) {   // god-rays: soft wedges of warm light (screen)
  c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(14px)';
  for (let i = 0; i < n; i++) { const an = ang + (i / (n - 1 || 1) - .5) * spread + Math.sin(t * .3 + i + seed) * .01, w = .02 + hash(seed + i) * .03, k = a * (.5 + .5 * hash(seed * 3 + i)) * (.85 + .15 * Math.sin(t * .7 + i));
    const g = c.createLinearGradient(x, y, x + Math.cos(an) * len, y + Math.sin(an) * len); g.addColorStop(0, `rgba(255,226,160,${k})`); g.addColorStop(1, 'rgba(255,226,160,0)'); c.fillStyle = g;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(an - w) * len, y + Math.sin(an - w) * len); c.lineTo(x + Math.cos(an + w) * len, y + Math.sin(an + w) * len); c.closePath(); c.fill(); }
  c.restore();
}
function dust(c, t, x0, y0, x1, y1, n, seed, lit = 1, s = 1) {   // motes drifting in the light
  for (let i = 0; i < n; i++) { const r1 = hash(seed + i * 1.3), r2 = hash(seed + i * 2.7), r3 = hash(seed + i * 4.1), sp = .3 + r3;
    const x = x0 + ((r1 * (x1 - x0) + t * 9 * sp + Math.sin(t * .5 * sp + i) * 20) % (x1 - x0) + (x1 - x0)) % (x1 - x0), y = y0 + ((r2 * (y1 - y0) - t * 6 * sp + Math.cos(t * .4 + i) * 14) % (y1 - y0) + (y1 - y0)) % (y1 - y0);
    const tw = .5 + .5 * Math.sin(t * 2.3 * sp + i * 3); softDot(c, x, y, (2 + r3 * 3) * s, '#fff3d4', .55 * lit * tw, 'screen'); }
}
function bird(c, x, y, s, t, ph, col = '#3d3129') {   // a small painted bird, wings beating (two curved strokes)
  const f = Math.sin(t * 9 + ph), up = f * 9 * s;
  stroke(c, [[x - 14 * s, y - up], [x - 6 * s, y - 3 * s - up * .3], [x, y]], 2.6 * s, col, { prof: 'tip', a: .8, seed: 900 + ph * 10 | 0 });
  stroke(c, [[x + 14 * s, y - up], [x + 6 * s, y - 3 * s - up * .3], [x, y]], 2.6 * s, col, { prof: 'tip', a: .8, seed: 901 + ph * 10 | 0 });
}
function flock(c, t, x0, y0, vx, vy, s, n, seed) { for (let i = 0; i < n; i++) { const dx = -i * 46 * s * (.8 + .4 * hash(seed + i)) * Math.sign(vx), dy = ((i % 2) ? 1 : -1) * Math.ceil(i / 2) * 18 * s + Math.sin(t * 1.4 + i) * 6 * s; bird(c, x0 + vx * t + dx, y0 + vy * t + dy, s * (.8 + .3 * hash(seed * 3 + i)), t, i * 1.7 + seed); } }

// ============================================================== the peepal tree (heart-shaped leaves with drip tips, fluttering)
function peepalLeaf(c, x, y, s, a, col, flut) {
  const sk = Math.cos(flut) * .8 + .2;   // flutter: the leaf turns on its stalk
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s * sk, s);
  const p = new Path2D(); p.moveTo(0, 0); p.bezierCurveTo(-14, -4, -16, -20, -6, -26); p.quadraticCurveTo(0, -30, 0, -40); p.quadraticCurveTo(0, -30, 6, -26); p.bezierCurveTo(16, -20, 14, -4, 0, 0); p.closePath();
  c.fillStyle = col; c.fill(p); c.restore();
}
function peepal(c, x, y, s, t, o = {}) {   // trunk with aerial roots, a broad crown of fluttering leaves; o.light: warm rim from the left
  const wind = o.wind ?? 1;
  c.save(); c.translate(x, y); c.scale(s, s);
  const trunk = [[-70, 0], [-50, -120], [-60, -260], [-30, -330], [30, -330], [60, -250], [50, -120], [80, 0]];
  wash(c, trunk, '#7a5a40', { a: .9, line: '#3d2a1c', lw: 4, seed: 71 });
  for (const [bx, by, ex, ey] of [[-40, -300, -260, -470], [20, -320, 220, -500], [0, -330, -40, -560], [40, -280, 300, -380], [-50, -260, -300, -330]]) {
    const br = tube([[bx, by], [(bx + ex) / 2, (by + ey) / 2 - 20], [ex, ey]], [46, 28, 12]); wash(c, br, '#7a5a40', { a: .9, edge: .4, seed: 72 + bx }); }
  for (let i = 0; i < 9; i++) { const rx = -230 + i * 50 + hash(i) * 30, ry = -300 - hash(i * 3) * 120; stroke(c, [[rx, ry], [rx + 4 + Math.sin(t * .8 + i) * 3, ry + 120], [rx + 2, ry + 200 + hash(i * 5) * 120]], 2.2, '#5a4030', { a: .5, seed: 80 + i }); }   // aerial roots
  // crown: masses of shade, then thousands of leaves in three values; each mass sways a little
  const masses = [[-260, -470, 190], [0, -560, 230], [240, -500, 200], [-120, -400, 170], [130, -400, 180], [-360, -380, 120], [360, -390, 120], [0, -680, 160]];
  for (const [mx, my, r] of masses) { c.save(); c.globalCompositeOperation = 'multiply'; const g = c.createRadialGradient(mx, my, 0, mx, my, r); g.addColorStop(0, 'rgba(70,96,52,.75)'); g.addColorStop(.8, 'rgba(70,96,52,.5)'); g.addColorStop(1, 'rgba(70,96,52,0)'); c.fillStyle = g; c.beginPath(); c.arc(mx, my, r, 0, TAU); c.fill(); c.restore(); }
  const cols = ['#4f6a38', '#6f8a46', '#93a85a', '#b9b467'];
  for (let i = 0; i < (o.leaves ?? 900); i++) { const m = masses[i % masses.length], an = hash(i * 1.7) * TAU, rr = Math.sqrt(hash(i * 2.3)) * m[2] * 1.05;
    const lx = m[0] + Math.cos(an) * rr + Math.sin(t * 1.3 + m[0] * .01) * 4 * wind, ly = m[1] + Math.sin(an) * rr * .85;
    const lit = clamp(((-lx - ly * .6) / 700) + .35 + (hash(i * 9) - .5) * .5, 0, .999), col = cols[Math.floor(lit * cols.length)];
    peepalLeaf(c, lx, ly, .62 + hash(i * 4) * .3, Math.PI + (hash(i * 5) - .5) * 1.6 + Math.sin(t * 2 + i) * .08 * wind, col, t * (2.5 + hash(i) * 3) * wind + i); }
  c.restore();
}
// ============================================================== village architecture
function house(c, x, y, w, h, o = {}) {   // a lime-washed village house: wall, ochre dado band, tiled sloping roof or flat parapet, an indigo door, a small window
  const s = o.seed || 1, wallC = o.wall || '#ecdcbc', R = (k) => hash(s * 13 + k);
  const wall = [[x, y], [x, y - h], [x + w, y - h], [x + w, y]]; wash(c, wall, wallC, { a: .75, raw: true, edge: .45, ew: 10, line: '#7a6248', lw: 2.4, seed: s * 3 });
  const dado = [[x, y], [x, y - h * .18], [x + w, y - h * .18], [x + w, y]]; wash(c, dado, o.dado || '#c99a5c', { a: .55, raw: true, edge: .3, seed: s * 3 + 1 });
  if (o.flat) { const par = [[x - 6, y - h], [x - 6, y - h - 22], [x + w + 6, y - h - 22], [x + w + 6, y - h]]; wash(c, par, wallC, { a: .8, raw: true, line: '#7a6248', lw: 2, seed: s * 3 + 2 }); }
  else { const roof = [[x - 24, y - h + 4], [x + w * .5, y - h - w * .32], [x + w + 24, y - h + 4]]; wash(c, roof, o.roof || '#b0613e', { a: .85, raw: true, edge: .5, line: '#5a2c1a', lw: 2.6, seed: s * 3 + 2 });
    for (let k = 1; k < 9; k++) { const u = k / 9; stroke(c, [[x - 24 + (w + 48) * u, y - h + 4], [x + w * .5 + (u - .5) * w * .3, y - h - w * .3 + 8]], 1.6, '#6e321e', { a: .4, seed: s * 50 + k }); } }
  if (o.door !== false) { const dx = x + w * (o.dx ?? .35), dw = w * .22, dh = h * .62; const door = [[dx, y], [dx, y - dh], [dx + dw, y - dh], [dx + dw, y]]; wash(c, door, o.doorC || '#3f5f86', { a: .85, raw: true, edge: .5, line: '#22324a', lw: 2.2, seed: s * 3 + 3 });
    stroke(c, [[dx + dw / 2, y - dh + 4], [dx + dw / 2, y - 2]], 1.6, '#1e2c40', { a: .5, seed: s * 3 + 4 }); }
  if (o.win !== false) { const wx = x + w * (o.wx ?? .7), wy = y - h * .62, ww = w * .14; const win = [[wx, wy], [wx, wy - ww * 1.1], [wx + ww, wy - ww * 1.1], [wx + ww, wy]]; wash(c, win, o.lit ? '#f0c27a' : '#4a4038', { a: .85, raw: true, line: '#3a2a20', lw: 2, seed: s * 3 + 5 });
    for (let k = 1; k < 3; k++) stroke(c, [[wx + ww * k / 3, wy - ww * 1.1], [wx + ww * k / 3, wy]], 1.6, '#3a2a20', { a: .6, seed: s * 3 + 6 + k }); }
  // a little texture: cracks and stains in the lime
  for (let k = 0; k < 4; k++) stroke(c, [[x + w * R(k), y - h * (.3 + .5 * R(k + 9))], [x + w * R(k) + 6, y - h * (.3 + .5 * R(k + 9)) + 30]], 1.2, '#8a7458', { a: .35, seed: s * 70 + k });
}
function shadowPool(c, x, y, w, h, a = .35, col = '#6a5a7a') { c.save(); c.globalCompositeOperation = 'multiply'; c.translate(x, y); c.scale(1, h / w); const g = c.createRadialGradient(0, 0, 0, 0, 0, w); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, w, 0, TAU); c.fill(); c.restore(); }
function longShadow(c, pts, a = .3, col = '#7a6a8a') { c.save(); c.globalCompositeOperation = 'multiply'; c.filter = 'blur(6px)'; c.fillStyle = rgba(col, a); c.fill(pathOf(pts)); c.restore(); }
