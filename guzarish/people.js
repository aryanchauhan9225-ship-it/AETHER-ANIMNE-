'use strict';
// GUZARISH — the two characters, drawn in the Gilded Illumination grammar as Pahari-miniature profiles:
// flat pigment + darker inner rim + firm ink line + white-lead strokes and dots; jewellery and borders are real leaf (they catch light).
// One design each, used in every shot (same face, clothes, palette, proportions). Local units: feet at (0,0), facing +x.
//
//  HER  : lapis kameez with a gold gota border, ivory salwar, vermilion phulkari dupatta (orange floss lozenges, gold edge),
//         long black braid with a vermilion paranda, maang tikka, nath, jhumkas, red-and-gold bangles.
//  HIM  : ivory kurta, verdigris waistcoat with gold trim, white tehmat with a vermilion border, magenta turban with a fan crest
//         and a gold sarpech, moustache and a short beard, a verdigris parna over one shoulder.

const SKIN_F = '#e9c19c', SKIN_FD = '#c8916a', SKIN_M = '#d9a67c', SKIN_MD = '#b07752', HAIR = '#1b120c', HAIR_L = '#4a3424';
const LIP = '#b8394a', KAM = ULTRA, KAM_D = ULTRA_D, SAL = '#f1e8d6', SAL_D = '#cdbfa2', DUP = '#b8261c', DUP_D = '#7e160f', FLOSS = '#f2a24a';
const KUR = '#f3ecdc', KUR_D = '#cfc2a4', VEST = VERDI, VEST_D = VERDI_D, PAG = '#a8264f', PAG_D = '#6e1432', PAG_L = '#d8628a';
let FK = 1;   // ink scale inside a figure (lines stay painterly, not proportional to the figure's scale)
const inkF = (g, p, w = 2.4, c = INK) => ink(g, p, w * FK, c);
function paintF(g, p, fill, rim, rimW, lw = 2.4) { g.fillStyle = fill; g.fill(p); if (rim) rimShade(g, p, rim, rimW); inkF(g, p, lw); maskErase(g, p); }
const curveP = (pts, close = false) => P2(q => { const c = catmull(pts, 8); c.forEach((p, i) => i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1])); if (close) q.closePath(); });
function gem(g, x, y, r, dim) { const p = P2(q => q.arc(x, y, r, 0, TAU)); leaf(g, p, [x - r, y - r, 2 * r, 2 * r], { lw: 1.3 * FK, rimW: r * .5, dim }); }
function cord(g, pts, w, dim) { const p = curveP(pts); leafCord(g, p, w, { ink: 1.6 * FK }); }

// ============================================================== heads (head units: ~150 tall, origin near the cheekbone)
// o: gaze (-1 back .. 1 forward), up (-1 down .. 1 up), blink 0..1, smile 0..1, veil 0..1 (dupatta drawn over the face), t
function eyeF(g, o, ex, ey, L, Hh, man) {
  const op = 1 - clamp(o.blink || 0), cy = ey, up = Hh * op, dn = Hh * .62 * op, x0 = ex + L * .5, x1 = ex - L * .5;
  const eye = P2(q => { q.moveTo(x0, cy); q.bezierCurveTo(x0 - L * .25, cy - up * 1.25, x1 + L * .3, cy - up * 1.1, x1, cy - 1); q.bezierCurveTo(x1 + L * .3, cy + dn * 1.2, x0 - L * .25, cy + dn * 1.2, x0, cy); q.closePath(); });
  if (op > .06) {
    g.fillStyle = '#fbf3e6'; g.fill(eye);
    g.save(); g.clip(eye); const ix = ex + L * .12 + (o.gaze || 0) * L * .16, iy = cy - (o.up || 0) * Hh * .45 - Hh * .05;
    g.fillStyle = '#3a2214'; g.beginPath(); g.arc(ix, iy, Hh * 1.05, 0, TAU); g.fill(); g.fillStyle = '#0d0805'; g.beginPath(); g.arc(ix, iy, Hh * .55, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,252,240,.95)'; g.beginPath(); g.arc(ix + Hh * .35, iy - Hh * .35, Hh * .26, 0, TAU); g.fill();
    g.fillStyle = 'rgba(120,70,40,.25)'; g.fillRect(x1 - 5, cy - up * 1.3, L + 10, up * .5); g.restore();
  }
  // kohl: a heavy upper lid line drawn on past the outer corner toward the ear (the miniature "fish" eye)
  g.strokeStyle = '#140b06'; g.lineCap = 'round';
  g.lineWidth = (man ? 2.6 : 3.2) * FK * 1.25; g.beginPath(); g.moveTo(x0 + 1, cy); g.bezierCurveTo(x0 - L * .25, cy - up * 1.25, x1 + L * .3, cy - up * 1.1, x1, cy - 1); g.quadraticCurveTo(x1 - L * .35, cy - 2 - Hh * .3, x1 - L * .62, cy - Hh * .9); g.stroke();
  g.lineWidth = 1.7 * FK * 1.25; g.beginPath(); g.moveTo(x0, cy); g.bezierCurveTo(x0 - L * .25, cy + dn * 1.2, x1 + L * .3, cy + dn * 1.2, x1, cy - 1); g.lineTo(x1 - L * .45, cy - Hh * .55); g.stroke();
  if (!man) { g.lineWidth = 1.2 * FK; for (let k = 0; k < 5; k++) { const u = .15 + k * .17, x = lerp(x0, x1, u), y = cy - up * (1.05 - Math.abs(u - .5) * .9); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2 - k * .6, y - 3.2 - (op * 1.6)); g.stroke(); } }
  return eye;
}
function headWoman(g, o) {
  const t = o.t || 0, sm = o.smile || 0, dim = o.dim ?? DIM;
  // skull + face in one path (the hair covers the top and back)
  const face = curveP([[20, 122], [21, 88], [26, 72], [44, 66], [55, 56], [52, 46], [57, 40], [53, 34.5], [59, 30], [56, 24], [58, 20], [66, 13], [58, -2], [49, -15], [50, -22], [46, -40], [38, -60], [10, -86], [-40, -78], [-66, -30], [-62, 14], [-36, 60], [-26, 122]], true);
  paintF(g, face, SKIN_F, SKIN_FD, 6, 2.2);
  g.fillStyle = 'rgba(214,110,110,.22)'; g.beginPath(); g.ellipse(30, 14, 15, 11, 0, 0, TAU); g.fill();   // a little rose on the cheek
  // ear (half under the hair) and the jhumka swinging from it
  const ear = P2(q => q.ellipse(-8, 6, 7, 12, .15, 0, TAU)); paintF(g, ear, SKIN_F, SKIN_FD, 3, 1.6);
  // lips (a soft smile lifts the corner), nostril, brow
  const lips = curveP([[59, 30.5], [55, 33.5 - sm * 1.2], [50, 34.6 - sm * 2.2], [53, 36], [57, 39.5]], false);
  g.fillStyle = LIP; g.beginPath(); g.moveTo(59, 30); g.quadraticCurveTo(54, 28, 50, 34.5 - sm * 2.2); g.quadraticCurveTo(54, 41, 57.5, 39.5); g.quadraticCurveTo(54, 35, 59, 30); g.fill();
  g.strokeStyle = '#6e1a20'; g.lineWidth = 1.5 * FK; g.stroke(lips);
  g.strokeStyle = '#7a4a30'; g.lineWidth = 1.4 * FK; g.beginPath(); g.moveTo(58, 14); g.quadraticCurveTo(54, 15, 55, 19); g.stroke();
  g.strokeStyle = '#140b06'; g.lineWidth = 2.3 * FK; g.beginPath(); g.moveTo(48, -27); g.quadraticCurveTo(36, -35, 14, -30); g.stroke();
  eyeF(g, o, 32, -11, 28, 7.5, false);
  // hair: parted, smooth, over the ear, gathered at the nape into the braid (drawn by the body)
  const hair = curveP([[39, -58], [30, -82], [-10, -96], [-52, -80], [-72, -38], [-68, 14], [-50, 58], [-36, 62], [-30, 40], [-18, 22], [-14, -4], [0, -22], [16, -38], [32, -50]], true);
  paintF(g, hair, HAIR, '#000', 5, 2);
  g.strokeStyle = HAIR_L; g.lineWidth = 1.3 * FK; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(30 - k * 6, -60 + k * 2); g.quadraticCurveTo(-30 - k * 3, -84 + k * 6, -60 + k * 2, -20 + k * 10); g.stroke(); }
  hiLine(g, [[24, -76], [-8, -88], [-40, -78]], 1.4 * FK, .55);
  // jewellery: maang tikka on the parting, nath with a pearl chain, jhumka bell with pearls (swings)
  cord(g, [[8, -94], [26, -78], [38, -64]], 2.2 * FK, dim); gem(g, 41, -58, 6.5, dim); pearls(g, 41, -58, 9.5, 8, 1.2, .9);
  const nr = P2(q => q.arc(58, 22, 6.5, -1.9, 2.4)); leafCord(g, nr, 2.2 * FK, { ink: 1.4 * FK }); pearlLine(g, [[52, 27], [30, 34], [6, 30], [-12, 14]], 4.5, 1.1, .85);
  const sw = Math.sin(t * 2.6) * .22 + (o.swing || 0);
  g.save(); g.translate(-8, 16); g.rotate(sw); cord(g, [[0, 0], [0, 6]], 2 * FK, dim);
  const bell = P2(q => { q.moveTo(-8, 18); q.quadraticCurveTo(-8, 6, 0, 5); q.quadraticCurveTo(8, 6, 8, 18); q.closePath(); }); leaf(g, bell, [-9, 4, 18, 15], { lw: 1.3 * FK, rimW: 2, dim });
  pearlLine(g, [[-8, 21], [0, 23], [8, 21]], 4, 1.4, .95); gpush(0, 12, 20, .8); g.restore();
}
function headMan(g, o) {
  const t = o.t || 0, sm = o.smile || 0, dim = o.dim ?? DIM;
  const face = curveP([[22, 124], [22, 92], [26, 78], [42, 72], [54, 60], [53, 46], [58, 41], [54, 36], [60, 31], [57, 25], [59, 21], [70, 14], [62, -2], [53, -14], [55, -22], [50, -40], [42, -58], [10, -86], [-40, -80], [-68, -30], [-64, 18], [-40, 64], [-30, 124]], true);
  paintF(g, face, SKIN_M, SKIN_MD, 6, 2.2);
  const ear = P2(q => q.ellipse(-8, 4, 8, 13, .15, 0, TAU)); paintF(g, ear, SKIN_M, SKIN_MD, 3, 1.6);
  g.strokeStyle = '#6a3a24'; g.lineWidth = 1.5 * FK; g.beginPath(); g.moveTo(60, 14); g.quadraticCurveTo(55, 15, 56, 20); g.stroke();
  g.strokeStyle = '#120a05'; g.lineWidth = 3.4 * FK; g.beginPath(); g.moveTo(53, -26); g.quadraticCurveTo(38, -34, 16, -28); g.stroke();
  eyeF(g, o, 34, -11, 26, 6.5, true);
  // beard along the jaw and chin, moustache with lifted ends; the lips show between them
  const beard = curveP([[-12, 26], [-4, 50], [20, 66], [40, 72], [54, 60], [53, 47], [46, 48], [40, 56], [24, 52], [6, 36], [0, 18]], true);
  paintF(g, beard, HAIR, '#000', 4, 1.8);
  g.fillStyle = '#9c4a3c'; g.beginPath(); g.moveTo(58, 36); g.quadraticCurveTo(52, 34 - sm * 2, 48, 38 - sm * 2); g.quadraticCurveTo(52, 44, 56, 42); g.closePath(); g.fill();
  const mou = curveP([[58, 27], [52, 31], [42, 32], [32, 29], [26, 20 - sm * 2], [30, 24], [40, 26.5], [50, 26], [57, 24]], true); paintF(g, mou, HAIR, '#000', 2, 1.6);
  hiLine(g, [[50, 28], [40, 29.5], [32, 27]], 1 * FK, .4);
  // turban: wrapped bands rising to the back, a starched fan (turra) and a gold sarpech; the hair below it
  const hairb = curveP([[-14, -6], [-34, 2], [-56, 30], [-44, 50], [-26, 30], [-12, 14]], true); paintF(g, hairb, HAIR, '#000', 3, 1.6);
  const turra = curveP([[-26, -100], [-30, -138], [-6, -150], [18, -132], [6, -104]], true); paintF(g, turra, PAG_L, PAG, 5, 2);
  g.strokeStyle = PAG; g.lineWidth = 1.4 * FK; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-10, -104); g.lineTo(-26 + k * 10, -140 + Math.abs(k - 2) * 4); g.stroke(); }
  const pag = curveP([[48, -40], [52, -64], [36, -96], [0, -114], [-46, -104], [-76, -64], [-74, -22], [-58, 0], [-30, -8], [0, -24], [26, -34]], true);
  paintF(g, pag, PAG, PAG_D, 9, 2.4);
  g.strokeStyle = PAG_D; g.lineWidth = 2 * FK; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(46 - k * 3, -44 - k * 10); g.quadraticCurveTo(-10 - k * 4, -40 - k * 12, -66 + k * 4, -8 - k * 14); g.stroke(); }
  hiLine(g, [[44, -60], [10, -92], [-30, -100]], 1.6 * FK, .6); hiLine(g, [[40, -48], [0, -60], [-50, -40]], 1.3 * FK, .4);
  gem(g, 28, -70, 8, dim); pearls(g, 28, -70, 12, 10, 1.4, .9); cord(g, [[28, -78], [26, -96]], 3 * FK, dim);
  gpush(28, -70, 26, 1);
}

// ============================================================== bodies
// o: t, s (scale), phase (walk radians), walk (0..1), wind (0..1), gaze, up, blink, smile, head (tilt rad, + = up),
//    arm: { kind: 'rest' | 'dupatta' | 'diya' | 'letter' | 'reach' | 'heart' | 'offer', k: 0..1 }, veil 0..1, dupLift (her)
function legs(g, o, cloth, clothD, len, cuffY, shoe, shoeD, step) {
  const ph = o.phase || 0, wk = o.walk || 0;
  for (const side of [-1, 1]) {   // far leg first
    const a = Math.sin(ph + (side > 0 ? 0 : Math.PI)) * .36 * wk, lift = Math.max(0, Math.sin(ph + (side > 0 ? 0 : Math.PI) + 1.2)) * 14 * wk;
    const hip = [side * 6, -len], knee = [hip[0] + Math.sin(a) * len * .5, hip[1] + Math.cos(a) * len * .5], ft = [hip[0] + Math.sin(a) * len * .98 + (lift ? 4 : 0), -lift];
    const leg = tubePath([hip, knee, [ft[0], ft[1] - 12]], [46, 40, 26]);
    paintF(g, leg, side < 0 ? clothD : cloth, clothD, 8, 2.2);
    if (step) for (let k = 1; k < 5; k++) { const y = lerp(knee[1], ft[1] - 14, k / 5); g.strokeStyle = clothD; g.lineWidth = 1.5 * FK; g.beginPath(); g.moveTo(ft[0] - 12, y); g.quadraticCurveTo(ft[0], y + 4, ft[0] + 12, y - 1); g.stroke(); }
    const sh = curveP([[ft[0] - 14, ft[1] - 2], [ft[0] - 12, ft[1] - 12], [ft[0] + 12, ft[1] - 11], [ft[0] + 30, ft[1] - 6], [ft[0] + 34, ft[1] - 12]], false);
    const shoeP = P2(q => { q.moveTo(ft[0] - 14, ft[1]); q.lineTo(ft[0] - 13, ft[1] - 12); q.quadraticCurveTo(ft[0] + 10, ft[1] - 16, ft[0] + 26, ft[1] - 6); q.quadraticCurveTo(ft[0] + 36, ft[1] - 12, ft[0] + 34, ft[1] - 4); q.quadraticCurveTo(ft[0] + 20, ft[1] + 2, ft[0] - 14, ft[1]); q.closePath(); });
    paintF(g, shoeP, side < 0 ? shoeD : shoe, shoeD, 4, 1.8); void sh;
    pearlLine(g, [[ft[0] - 8, ft[1] - 9], [ft[0] + 20, ft[1] - 9]], 6, 1.3, .8);
  }
}
function armPose(o, man) {   // shoulder-relative targets for the near hand, by pose
  const A = o.arm || { kind: 'rest', k: 1 }, k = ss(A.k ?? 1), sw = Math.sin((o.phase || 0) + Math.PI) * .3 * (o.walk || 0);
  const rest = [Math.sin(sw) * 150 + 10, 230];
  const v = A.v ?? 0, poses = { rest, unveil: [lerp(6, 60, v), lerp(-118, -44, v)], dupatta: [40, -34], diya: [120, 120], letter: [118, 44], reach: [128, -170], heart: [44, 70], offer: [190, 40], veil: [62, -88] };
  const p = poses[A.kind] || rest; return [lerp(rest[0], p[0], k), lerp(rest[1], p[1], k), A.kind, k];
}
function arm(g, sx, sy, tgt, L1, L2, sleeve, sleeveD, skin, skinD, o, back) {
  const [tx, ty] = tgt, d = Math.min(Math.hypot(tx, ty), L1 + L2 - 1), an = Math.atan2(ty, tx), c = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1), a1 = an + Math.acos(c);
  const el = [sx + Math.cos(a1) * L1, sy + Math.sin(a1) * L1], hd = [sx + tx * d / Math.hypot(tx, ty), sy + ty * d / Math.hypot(tx, ty)];
  const sl = tubePath([[sx, sy], el, [lerp(el[0], hd[0], .8), lerp(el[1], hd[1], .8)]], [34, 28, 22]);
  paintF(g, sl, sleeve, sleeveD, 8, 2.2);
  const fa = Math.atan2(hd[1] - el[1], hd[0] - el[0]);
  g.save(); g.translate(hd[0], hd[1]); g.rotate(fa);
  const hand = curveP([[-12, -10], [6, -12], [22, -8], [30, -3], [26, 2], [14, 3], [20, 8], [10, 11], [-6, 10], [-14, 6]], true);
  paintF(g, hand, skin, skinD, 3, 1.6);
  g.strokeStyle = skinD; g.lineWidth = 1 * FK; for (const y of [-3, 1]) { g.beginPath(); g.moveTo(6, y); g.lineTo(24, y - 2); g.stroke(); }
  g.restore();
  return { el, hd, fa };
}
function bangles(g, x, y, a, dim) { for (let k = 0; k < 4; k++) { const off = -16 + k * 6; const p = P2(q => q.ellipse(x + Math.cos(a) * off, y + Math.sin(a) * off, 4, 15, a, 0, TAU)); if (k % 2) leaf(g, p, [x - 20, y - 20, 40, 40], { lw: 1.1 * FK, rimW: 1.5, dim }); else { g.fillStyle = VERM; g.fill(p); inkF(g, p, 1.1); maskErase(g, p); } } gpush(x, y, 30, .7); }

// —— the dupatta: a long translucent phulkari veil from the crown, down the back, its free end flying in the wind ——
function dupattaPts(o, man) {
  const t = o.t || 0, w = o.wind ?? .4, lift = o.dupLift || 0, pts = [];
  let x = -14, y = -598, a = Math.PI * .62;
  for (let i = 0; i < 14; i++) {
    pts.push([x, y]);
    const u = i / 13, tgt = lerp(Math.PI * .55, Math.PI * (.6 + .28 * w) - lift * .5, ss(u * 1.6));
    a = lerp(a, tgt, .5) + Math.sin(t * 3.1 - i * .7) * .15 * w * u + Math.sin(t * 1.3 - i * .35) * .07 * w;
    const L = i < 3 ? 34 : 26 + 26 * w; x += Math.cos(a) * L; y += Math.sin(a) * L;
  }
  return pts;
}
function dupatta(g, o, front) {
  const pts = dupattaPts(o), ws = pts.map((_, i) => lerp(78, 122, i / 13) + Math.sin((o.t || 0) * 4 - i) * 6 * (o.wind ?? .4));
  const p = tubePath(pts, ws, true, true);
  g.save(); g.globalAlpha = front ? .9 : .97; paintF(g, p, DUP, DUP_D, 10, 2.2); g.restore();
  g.save(); g.clip(p); g.fillStyle = FLOSS;   // phulkari: orange floss lozenges in a lattice, a white-lead dot in each
  const b = [-260, -640, 420, 520];
  for (let y = b[1]; y < b[1] + b[3]; y += 26) for (let x = b[0] + ((y / 26) % 2) * 13; x < b[0] + b[2]; x += 26) { g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x + 7, y); g.lineTo(x, y + 8); g.lineTo(x - 7, y); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(255,250,236,.85)'; for (let y = b[1] + 13; y < b[1] + b[3]; y += 26) for (let x = b[0] + ((y / 26 + .5) % 2) * 13; x < b[0] + b[2]; x += 26) { g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill(); }
  g.restore();
  // gota (gold) along both long edges
  const n = pts.length, edge = s => pts.map((q, i) => { const a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)], dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1; return [q[0] - dy / l * ws[i] / 2 * s * .92, q[1] + dx / l * ws[i] / 2 * s * .92]; });
  for (const s of [-1, 1]) leafCord(g, curveP(edge(s)), 5 * FK, { ink: 1.6 * FK });
  for (let i = 2; i < n; i += 3) gpush(...edge(1)[i], 40, .7);
  return pts;
}

function drawWoman(g, x, y, s, o = {}) {
  FK = Math.pow(s, -.72); const t = o.t || 0, wk = o.walk || 0, ph = o.phase || 0, bob = -Math.abs(Math.cos(ph)) * 8 * wk, dim = o.dim ?? DIM;
  g.save(); g.translate(x, y + bob * s); g.scale(s * (o.dir || 1), s);
  const sway = Math.sin(t * 1.1) * 2;
  // braid + paranda behind everything, swinging
  const bs = Math.sin(t * 1.7 + ph) * (.05 + .12 * wk) + (o.wind ?? .3) * -.08;
  const braid = []; for (let i = 0; i <= 10; i++) { const u = i / 10, a = Math.PI / 2 + .25 + bs * u * 2; braid.push([-34 + Math.cos(a) * 280 * u - u * 10, -520 + Math.sin(a) * 280 * u]); }
  const bp = tubePath(braid, braid.map((_, i) => 26 - i * 1.3)); paintF(g, bp, HAIR, '#000', 4, 1.8);
  g.strokeStyle = HAIR_L; g.lineWidth = 1.2 * FK; for (let i = 1; i < 10; i++) { const [a, b] = [braid[i - 1], braid[i]]; g.beginPath(); g.moveTo(a[0] - 10, a[1]); g.quadraticCurveTo(b[0] + 8, (a[1] + b[1]) / 2, b[0] - 8, b[1]); g.stroke(); }
  const te = braid[10]; for (let k = -2; k <= 2; k++) { const tp = tubePath([te, [te[0] + k * 6 + bs * 40, te[1] + 60]], [8, 5]); paintF(g, tp, VERM, VERM_D, 2, 1.4); }
  gem(g, te[0], te[1] + 6, 8, dim);
  // dupatta tail behind
  if (o.dup !== false) dupatta(g, o);
  // far arm, legs, kameez
  const far = arm(g, -8 + sway, -486, [-40, 220], 120, 112, KAM_D, '#0c1450', SKIN_FD, '#9a6a4a', o, true);
  legs(g, o, SAL, SAL_D, 172, -10, VERM, VERM_D, true);
  const fl = Math.sin(t * 2.4) * 6 * (o.wind ?? .3) + Math.sin(ph) * 8 * wk;
  const kam = curveP([[-42 + sway, -490], [-8, -500], [30, -494], [44, -456], [46, -420], [30, -372], [40, -320], [62, -240], [80 + fl, -164], [10, -152], [-62 + fl * .6, -160], [-54, -250], [-42, -330], [-36, -380], [-48, -440]], true);
  paintF(g, kam, KAM, KAM_D, 12, 2.4);
  g.save(); g.clip(kam); for (let yy = -460; yy < -170; yy += 34) for (let xx = -60; xx < 80; xx += 30) triad(g, xx + ((yy / 34) % 2) * 15, yy, 1.8, .85); g.restore();
  leafCord(g, curveP([[-60 + fl * .6, -168], [10, -160], [78 + fl, -172]]), 9 * FK, { ink: 1.8 * FK }); pearlLine(g, [[-58, -180], [10, -173], [74 + fl, -184]], 8, 1.5, .9);
  leafCord(g, curveP([[-6, -498], [22, -470], [32, -444]]), 5 * FK, { ink: 1.4 * FK });
  hiLine(g, [[40, -440], [30, -380], [52, -280], [70, -190]], 1.6 * FK, .55);
  g.strokeStyle = KAM_D; g.lineWidth = 2 * FK; for (const xx of [-20, 18]) { g.beginPath(); g.moveTo(xx, -330); g.quadraticCurveTo(xx + 6, -250, xx + 14 + fl * .4, -168); g.stroke(); }
  gpush(10, -166, 60, .7);
  // neck + head
  g.save(); g.translate(14 + sway, -560); g.rotate(-(o.head || 0)); g.scale(.6, .6);
  const neck = curveP([[22, 90], [24, 150], [-26, 150], [-24, 90]], true); paintF(g, neck, SKIN_F, SKIN_FD, 4, 1.8);
  pearlLine(g, [[22, 128], [0, 136], [-22, 128]], 6, 1.6, .95);
  headWoman(g, { ...o, dim });
  g.restore();
  // the dupatta's front fall over the near shoulder (or the veil across the face)
  if (o.dup !== false) { const v = ss(o.veil || 0), L = (a, b) => [lerp(a[0], b[0], v), lerp(a[1], b[1], v)];
    const edge = [L([30, -604], [52, -604]), L([36, -592], [66, -556]), L([20, -572], [62, -520]), L([-6, -548], [44, -488])];
    const front = curveP([[-6, -630], ...edge, [-30, -500], [-46, -470], [-48, -540], [-36, -600]], true);
    g.save(); g.globalAlpha = .5 + .3 * v; paintF(g, front, DUP, DUP_D, 8, 2); g.restore(); leafCord(g, curveP([[-6, -630], ...edge]), 5 * FK, { ink: 1.4 * FK }); }
  // near arm + props
  const [tx, ty, kind, k] = armPose(o, false), near = arm(g, 18 + sway, -478, [tx, ty], 122, 116, KAM, KAM_D, SKIN_F, SKIN_FD, o, false);
  bangles(g, lerp(near.el[0], near.hd[0], .78), lerp(near.el[1], near.hd[1], .78), near.fa, dim);
  let prop = null;
  if (kind === 'diya' && k > .3) prop = diyaPlate(g, near.hd[0] + 18, near.hd[1] - 6, dim);
  if (kind === 'letter' && k > .3 && o.letter) prop = o.letter(g, near.hd[0] + 24, near.hd[1] - 40);
  g.restore();
  const M = new DOMMatrix().translate(x, y + bob * s).scale(s * (o.dir || 1), s), at = (px, py) => { const q = new DOMPoint(px, py).matrixTransform(M); return [q.x, q.y]; };
  return { hand: at(near.hd[0], near.hd[1]), head: at(30, -566), eye: at(14 + 32 * .6, -560 - 11 * .6), prop: prop ? at(prop[0], prop[1]) : null };
}
function diyaPlate(g, x, y, dim) {   // a brass plate with a clay diya, its flame
  const pl = P2(q => q.ellipse(x, y, 46, 9, 0, 0, TAU)); leaf(g, pl, [x - 46, y - 9, 92, 18], { lw: 1.6 * FK, dim });
  const d = P2(q => { q.moveTo(x - 20, y - 6); q.quadraticCurveTo(x, y + 8, x + 22, y - 8); q.lineTo(x + 28, y - 12); q.quadraticCurveTo(x, y - 14, x - 20, y - 6); q.closePath(); }); paintF(g, d, '#9a4a2a', '#6a2a14', 3, 1.6);
  return [x + 24, y - 16];
}

function drawMan(g, x, y, s, o = {}) {
  FK = Math.pow(s, -.72); const t = o.t || 0, wk = o.walk || 0, ph = o.phase || 0, bob = -Math.abs(Math.cos(ph)) * 9 * wk, dim = o.dim ?? DIM, w = o.wind ?? .3;
  g.save(); g.translate(x, y + bob * s); g.scale(s * (o.dir || 1), s);
  const sway = Math.sin(t * 1.05 + 1) * 2;
  // parna (stole) tail behind the shoulder, in the wind
  const pr = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pr.push([-36 - u * (30 + 90 * w) + Math.sin(t * 3 - i * .8) * 10 * w * u, -496 + u * (230 - 90 * w) + Math.sin(t * 2.2 - i) * 8 * w * u]); }
  paintF(g, tubePath(pr, pr.map((_, i) => 34 - i * 1.5)), VERDI, VERDI_D, 7, 2);
  pearlLine(g, pr.map(p => [p[0], p[1] + 16]), 10, 1.4, .7);
  const far = arm(g, -10 + sway, -490, [-30, 224], 124, 116, KUR_D, '#a89a7a', SKIN_MD, '#80502e', o, true); void far;
  // tehmat: a straight wrap to the ankle, vermilion border, folds that open with the stride
  const ph2 = Math.sin(ph) * 18 * wk;
  legs(g, o, '#efe6d2', '#c7b896', 170, -10, '#6a3a1e', '#3e200e', false);
  const teh = curveP([[-50, -330], [44, -330], [52 + ph2, -150], [40 + ph2 * .6, -60], [-44 - ph2 * .4, -56], [-52 - ph2, -150]], true); paintF(g, teh, '#f4ecdb', '#cbbd9c', 10, 2.2);
  leafCord(g, curveP([[-44 - ph2 * .4, -66], [0, -62], [40 + ph2 * .6, -70]]), 7 * FK, { ink: 1.6 * FK });
  g.strokeStyle = VERM; g.lineWidth = 7 * FK; g.beginPath(); g.moveTo(-40 - ph2 * .4, -80); g.lineTo(38 + ph2 * .6, -84); g.stroke();
  g.strokeStyle = '#cbbd9c'; g.lineWidth = 1.8 * FK; for (const xx of [-24, 6, 30]) { g.beginPath(); g.moveTo(xx, -320); g.quadraticCurveTo(xx + 8 + ph2 * .3, -200, xx + ph2 * .5, -70); g.stroke(); }
  // kurta to the knee, waistcoat over it
  const kur = curveP([[-46 + sway, -496], [0, -508], [40, -500], [52, -440], [50, -360], [58, -250], [62, -176], [-56, -172], [-52, -260], [-50, -380], [-54, -450]], true);
  paintF(g, kur, KUR, KUR_D, 12, 2.4);
  hiLine(g, [[44, -440], [48, -330], [56, -200]], 1.6 * FK, .6);
  const vest = curveP([[-48 + sway, -494], [-2, -504], [30, -496], [42, -452], [40, -390], [44, -330], [-46, -326], [-48, -400], [-52, -450]], true); paintF(g, vest, VEST, VEST_D, 10, 2.3);
  leafCord(g, curveP([[30, -496], [36, -440], [40, -380], [44, -330]]), 6 * FK, { ink: 1.6 * FK }); leafCord(g, curveP([[-46, -328], [0, -326], [44, -330]]), 6 * FK, { ink: 1.6 * FK });
  g.save(); g.clip(vest); for (let yy = -480; yy < -330; yy += 30) for (let xx = -40; xx < 40; xx += 26) triad(g, xx + ((yy / 30) % 2) * 13, yy, 1.6, .7); g.restore();
  gpush(36, -420, 60, .7);
  // parna front fall over the shoulder
  const pf = curveP([[-40, -500], [-4, -512], [22, -470], [16, -380], [0, -300], [-16, -310], [-6, -400], [-20, -470]], true); paintF(g, pf, VERDI, VERDI_D, 7, 2);
  // head
  g.save(); g.translate(14 + sway, -566); g.rotate(-(o.head || 0)); g.scale(.6, .6);
  const neck = curveP([[22, 90], [24, 150], [-30, 150], [-28, 90]], true); paintF(g, neck, SKIN_M, SKIN_MD, 4, 1.8);
  headMan(g, { ...o, dim });
  g.restore();
  const [tx, ty, kind, k] = armPose(o, true), near = arm(g, 16 + sway, -482, [tx, ty], 126, 118, KUR, KUR_D, SKIN_M, SKIN_MD, o, false);
  const kara = P2(q => q.ellipse(lerp(near.el[0], near.hd[0], .82), lerp(near.el[1], near.hd[1], .82), 4, 14, near.fa, 0, TAU)); leafCord(g, kara, 4 * FK, { ink: 1.2 * FK });
  let prop = null; if (kind === 'offer' && k > .3 && o.flower) prop = o.flower(g, near.hd[0] + 28, near.hd[1] - 8);
  g.restore();
  const M = new DOMMatrix().translate(x, y + bob * s).scale(s * (o.dir || 1), s), at = (px, py) => { const q = new DOMPoint(px, py).matrixTransform(M); return [q.x, q.y]; };
  return { hand: at(near.hd[0], near.hd[1]), head: at(30, -572), eye: at(14 + 34 * .6, -566 - 11 * .6), prop: prop ? at(prop[0], prop[1]) : null };
}
