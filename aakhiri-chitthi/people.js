'use strict';
// आखिरी चिट्ठी — the four characters, one design each, painted in transparent washes with brushed contours.
//  POSTMAN (कक्का, ~62): khaki half-sleeve shirt and trousers, khaki peaked cap with a brass badge, round spectacles, grey hair and moustache,
//          brown leather satchel across the body, worn sandals. Kind, lined face.
//  AMMA (~68): sage-green cotton saree with a maroon border, maroon blouse, the pallu over her grey hair in a bun, a small maroon bindi,
//          two thin gold bangles. The same face construction as the bride, aged: softer jaw, lines at the eyes and mouth.
//  BRIDE (Amma at ~22, memory only): red wedding saree with a gold border, pallu over the head, black hair, sindoor, maang tikka, red-and-gold bangles.
//  BABUJI (her father, ~50, memory only): white kurta and dhoti, a brown shawl, black hair greying at the temples, a full moustache.
// Head units: ~150 tall, origin at the cheekbone, profile faces +x. Bodies: feet at (0,0), ~600 tall, facing +x (o.dir = -1 mirrors).

const SK = { amma: '#e2b896', bride: '#e8bd98', post: '#c99a74', babu: '#cf9f78' };
const SKD = { amma: '#b98466', bride: '#c08a68', post: '#9a6a4c', babu: '#a07050' };
const LINE = '#4a3426';
const FEM = [[20, 122], [21, 88], [26, 72], [44, 66], [55, 56], [52, 46], [57, 40], [53, 34.5], [59, 30], [56, 24], [58, 20], [66, 13], [58, -2], [49, -15], [50, -22], [46, -40], [38, -60], [10, -86], [-40, -78], [-66, -30], [-62, 14], [-36, 60], [-26, 122]];
const FEM_OLD = [[20, 122], [21, 90], [28, 76], [42, 70], [53, 60], [51, 48], [56, 42], [52, 36], [58, 31], [55, 25], [57, 21], [65, 14], [57, -2], [49, -15], [50, -22], [46, -40], [38, -60], [10, -86], [-40, -78], [-66, -30], [-62, 14], [-36, 60], [-26, 122]];
const MALE = [[22, 124], [22, 92], [26, 78], [42, 72], [54, 60], [53, 46], [58, 41], [54, 36], [60, 31], [57, 25], [59, 21], [70, 14], [62, -2], [53, -14], [55, -22], [50, -40], [42, -58], [10, -86], [-40, -80], [-68, -30], [-64, 18], [-40, 64], [-30, 124]];

// ---------------------------------------------------------------- profile head
// e: { blink, open (lid extra), gaze, down, brow, worry, smile, sad, wet, tear, mouth, t }
function eyeP(c, who, e, ex, ey, sc) {
  const op = clamp((1 - (e.blink || 0)) * (1 + (e.open || 0) * .25) - (e.down || 0) * .35, 0, 1.3), L = 22 * sc, up = 7.5 * sc * op, dn = 3.6 * sc * Math.max(.2, op);
  const x0 = ex + L * .45, x1 = ex - L * .5;   // inner (front) and outer corners
  const eye = new Path2D(); eye.moveTo(x0, ey); eye.bezierCurveTo(x0 - L * .3, ey - up * 1.2, x1 + L * .25, ey - up, x1, ey - 1); eye.bezierCurveTo(x1 + L * .3, ey + dn, x0 - L * .3, ey + dn * 1.1, x0, ey); eye.closePath();
  if (op > .08) { paperFill(c, eye); c.save(); c.clip(eye); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(236,226,214,.9)'; c.fill(eye);
    const ix = ex + L * .2 + (e.gaze || 0) * L * .12, iy = ey - up * .15 + (e.down || 0) * 2.5 * sc;
    c.fillStyle = 'rgba(70,42,26,.95)'; c.beginPath(); c.ellipse(ix, iy, 4.2 * sc, 5.6 * sc, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(20,12,8,.95)'; c.beginPath(); c.ellipse(ix + .6 * sc, iy, 2 * sc, 2.8 * sc, 0, 0, TAU); c.fill(); c.restore();
    softDot(c, ix + 1.6 * sc, iy - 2 * sc, 1.6 * sc, '#ffffff', .95, 'screen');
    if (e.wet) { softDot(c, ix - 2 * sc, iy + 2.5 * sc, 2.4 * sc, '#ffffff', .6 * e.wet, 'screen'); stroke(c, [[x0 - 2, ey + dn * .7], [ex, ey + dn * 1.05], [x1 + 3, ey + 1]], 1.3 * sc, '#ffffff', { a: .55 * e.wet, seed: 7 }); } }
  // lids: a heavier brushed upper lid, a light lower lid, the crease above
  stroke(c, [[x0 + 1, ey], [x0 - L * .3, ey - up * 1.18], [x1 + L * .25, ey - up], [x1 - 2, ey]], 2.4 * sc, '#2a1a12', { a: .85, seed: 11 });
  stroke(c, [[x0, ey + .5], [ex, ey + dn * 1.05], [x1 + 2, ey]], 1.1 * sc, '#5a3a28', { a: .5, seed: 12 });
  stroke(c, [[x0 - 2, ey - up - 3 * sc], [ex, ey - up * 1.2 - 4.5 * sc], [x1 + 2, ey - up - 1 * sc]], 1 * sc, '#7a5440', { a: .4, seed: 13 });
  if (who === 'amma' || who === 'bride') for (let k = 0; k < 4; k++) { const u = .25 + k * .18, x = lerp(x1, x0, u), y = ey - up * (1.05 - Math.abs(u - .5) * .6); stroke(c, [[x, y], [x - 2.6 * sc, y - 2.6 * sc * Math.max(.3, op)]], .9 * sc, '#2a1a12', { a: .7, seed: 20 + k }); }
  if (e.tear > 0) { const k = e.tear, ty = lerp(ey + 4, ey + 46, ss(k)); stroke(c, [[x1 + 4, ey + 3], [x1 + 6, (ey + ty) / 2], [x1 + 9, ty]], 1.6 * sc, '#ffffff', { a: .45, seed: 30 }); softDot(c, x1 + 9, ty, 2.6 * sc, '#ffffff', .8, 'screen'); }
}
function headP(c, who, e = {}) {
  const old = who === 'amma', male = who === 'post' || who === 'babu', cont = male ? MALE : old ? FEM_OLD : FEM, sk = SK[who], skd = SKD[who];
  const face = wash(c, cont, sk, { a: .82, edge: .55, ew: 9, line: LINE, lw: 2.2, la: .55, seed: 101, k: 4 });
  softDot(c, 30, 14, 16, old ? '#c98a7a' : '#d98a80', .28, 'multiply');   // cheek warmth
  // ear
  wash(c, [[-4, -10], [-14, -6], [-16, 10], [-8, 22], [0, 18], [-2, 4]], sk, { a: .8, line: LINE, lw: 1.6, seed: 102 });
  stroke(c, [[-6, -4], [-11, 4], [-6, 14]], 1.2, skd, { a: .6, seed: 103 });
  // nose / lips detail strokes
  stroke(c, [[58, 14], [54, 16], [55, 20]], 1.4, LINE, { a: .6, seed: 104 });
  const sm = e.smile || 0, sd = e.sad || 0, mo = e.mouth || 0;
  if (!male) { const lip = new Path2D(); lip.moveTo(58, 30); lip.quadraticCurveTo(53, 28, 49, 35 - sm * 2 + sd * 2); lip.quadraticCurveTo(53, 41 + mo * 3, 57, 40); lip.quadraticCurveTo(54, 35, 58, 30); glaze(c, lip, old ? '#b0605a' : '#c0404a', .65); }
  stroke(c, [[old ? 52 : 53, 35 + mo], [48, 35.5 + mo * .5], [44, 35 - sm * 3.2 + sd * 3]], 1.5, '#4a2a22', { a: .75, seed: 105 });
  if (mo > .05) { const m = new Path2D(); m.ellipse(50, 36 + mo * 1.5, 3.5, 2 + mo * 2.5, 0, 0, TAU); glaze(c, m, '#4a2020', .7); }
  // brows: raise lifts both, worry lifts the inner (front) end and draws it in
  const br = e.brow || 0, wo = e.worry || 0;
  stroke(c, [[49, -25 - br * 4 - wo * 5], [38, -31 - br * 5 - wo * 2], [24, -31 - br * 4], [14, -28 - br * 2]], (male ? 3.8 : 2.6), old ? '#8a8078' : male && who === 'post' ? '#9a948c' : '#2a1a12', { a: .8, seed: 106 });
  if (wo > .2) stroke(c, [[46, -34 - wo * 4], [44, -40 - wo * 4]], 1.1, skd, { a: .4 * wo, seed: 107 });
  eyeP(c, who, e, 34, -10, 1);
  // age: crow's feet, smile fold, forehead lines, neck
  if (old || who === 'post') { for (let k = 0; k < 3; k++) stroke(c, [[16, -16 + k * 6], [8, -18 + k * 7]], 1, skd, { a: .5, seed: 110 + k });
    stroke(c, [[54, 22], [48, 34], [47, 46]], 1.3, skd, { a: .55, seed: 114 }); for (let k = 0; k < 2; k++) stroke(c, [[42, -50 + k * 7], [20, -54 + k * 7]], 1, skd, { a: .4, seed: 115 + k });
    stroke(c, [[24, 86], [16, 98]], 1.1, skd, { a: .45, seed: 117 }); stroke(c, [[2, 34], [10, 44]], 1, skd, { a: .4, seed: 118 }); }
  // hair / headwear per character
  if (who === 'amma') {
    wash(c, [[40, -58], [30, -78], [-10, -90], [-50, -78], [-70, -36], [-64, 10], [-46, 46], [-30, 30], [-16, 8], [0, -24], [20, -44]], '#b9b4ac', { a: .8, line: '#6a645c', lw: 1.6, seed: 120 });
    for (let k = 0; k < 6; k++) stroke(c, [[34 - k * 5, -60 + k], [-20 - k * 4, -82 + k * 6], [-60 + k * 3, -30 + k * 8]], 1.1, '#8a8478', { a: .5, seed: 121 + k });
    wash(c, [[-60, -16], [-92, -30], [-98, 6], [-76, 22]], '#b0aaa0', { a: .85, line: '#6a645c', lw: 1.6, seed: 128 });   // bun
    softDot(c, 47, -40, 3.2, '#7a2a2a', .9, 'multiply');   // bindi
  } else if (who === 'bride') {
    wash(c, [[40, -58], [30, -80], [-10, -92], [-52, -80], [-72, -36], [-66, 12], [-48, 52], [-30, 32], [-16, 8], [0, -24], [20, -44]], '#2a1e18', { a: .9, line: '#120c08', lw: 1.6, seed: 130 });
    for (let k = 0; k < 5; k++) stroke(c, [[32 - k * 5, -62 + k], [-20 - k * 4, -84 + k * 6], [-62 + k * 3, -30 + k * 8]], 1.1, '#4a3a30', { a: .5, seed: 131 + k });
    stroke(c, [[34, -62], [12, -88]], 3, '#c8322a', { a: .9, seed: 136 });   // sindoor in the parting
    stroke(c, [[16, -86], [30, -72], [40, -62]], 1.4, '#c89a40', { a: .9, seed: 137 }); softDot(c, 41, -57, 6, '#d8a840', .95, 'multiply'); softDot(c, 41, -57, 3, '#fff2c0', .8, 'screen');
    softDot(c, 47, -40, 3.4, '#c8322a', .95, 'multiply');
    const nr = new Path2D(); nr.arc(57, 22, 6, -1.9, 2.4); c.save(); c.strokeStyle = 'rgba(200,154,64,.95)'; c.lineWidth = 1.6; c.stroke(nr); c.restore();
  } else if (who === 'babu') {
    wash(c, [[42, -56], [34, -78], [-6, -92], [-48, -82], [-70, -40], [-66, 4], [-44, 18], [-30, 0], [-14, -14], [10, -34], [30, -46]], '#2e2620', { a: .9, line: '#120c08', lw: 1.6, seed: 140 });
    for (let k = 0; k < 4; k++) stroke(c, [[-20 - k * 8, -10 - k * 4], [-30 - k * 8, -40 - k * 6]], 1.4, '#9a948c', { a: .55, seed: 141 + k });   // grey at the temple
    wash(c, [[58, 26], [52, 31], [40, 33], [30, 30], [26, 22], [34, 25], [44, 26.5], [52, 25]], '#2e2620', { a: .9, line: '#120c08', lw: 1.4, seed: 146, k: 3 });
  } else if (who === 'post') {
    wash(c, [[24, -40], [10, -46], [-30, -40], [-62, -28], [-66, 8], [-46, 40], [-30, 24], [-16, 4], [0, -22]], '#a8a49e', { a: .8, line: '#6a645c', lw: 1.6, seed: 150 });
    wash(c, [[58, 26], [52, 31], [40, 33], [30, 30], [26, 22], [34, 25], [44, 26.5], [52, 25]], '#a6a29c', { a: .9, line: '#6a645c', lw: 1.4, seed: 151, k: 3 });
    // khaki peaked cap with a brass badge
    wash(c, [[48, -44], [44, -70], [10, -94], [-40, -90], [-70, -60], [-70, -36], [-30, -42], [10, -44]], '#b29a6a', { a: .88, line: '#5a4a30', lw: 2, seed: 152 });
    wash(c, [[40, -46], [74, -42], [76, -36], [44, -36]], '#6a5a3c', { a: .9, line: '#3a3020', lw: 1.6, seed: 153 });
    softDot(c, 30, -64, 6, '#c8a040', .95, 'multiply'); softDot(c, 30, -64, 2.6, '#fff0c0', .7, 'screen');
    // round spectacles: rim around the eye, arm back to the ear
    c.save(); c.strokeStyle = 'rgba(60,44,30,.85)'; c.lineWidth = 2; c.beginPath(); c.ellipse(36, -9, 8, 12, 0, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(28, -10); c.lineTo(-6, -6); c.stroke(); c.restore();
    softDot(c, 38, -14, 5, '#ffffff', .35, 'screen');
  }
}
// a bust under a close-up head (head units): neck, shoulders in the character's clothes; Amma's pallu draped over the head and shoulder
function bustP(c, who, o = {}) {
  const sk = SK[who], br = o.breath || 0;
  wash(c, [[24, 80], [26, 150], [-34, 160], [-30, 80]], sk, { a: .82, raw: true, edge: .4, line: LINE, lw: 1.8, seed: 160 });
  if (who === 'post') { wash(c, [[40, 130 + br], [90, 170 + br], [130, 330], [-200, 330], [-170, 170 + br], [-70, 128 + br]], '#c9b07c', { a: .85, line: LINE, lw: 2, la: .5, seed: 161 });
    wash(c, [[30, 126 + br], [60, 160 + br], [20, 176 + br], [-20, 150 + br]], '#b89c64', { a: .85, line: LINE, lw: 1.6, seed: 162 }); stroke(c, [[-40, 150 + br], [10, 230], [50, 330]], 9, '#5a3420', { a: .9, seed: 163 }); }
  else if (who === 'amma') { wash(c, [[36, 136 + br], [90, 176 + br], [120, 330], [-200, 330], [-170, 180 + br], [-60, 130 + br]], '#7a2a2a', { a: .85, line: LINE, lw: 2, la: .5, seed: 164 }); }
}
function pallu(c, br = 0) {   // Amma's sage pallu over the back of the head, falling over the shoulder (head units)
  wash(c, [[36, -84], [6, -102], [-50, -96], [-84, -56], [-100, 10], [-120, 120], [-180, 330], [-40, 330], [-10, 200 + br], [40, 150 + br], [-30, 120], [-60, 40], [-62, -20], [-40, -74], [0, -88]], '#b4c0a2', { a: .82, line: LINE, lw: 1.8, la: .5, seed: 170 });
  stroke(c, [[36, -84], [0, -100], [-50, -94], [-84, -56], [-104, 20], [-126, 140], [-170, 330]], 7, '#7a2a2a', { a: .8, seed: 171 });
  for (let k = 0; k < 3; k++) stroke(c, [[-60 + k * 8, -40], [-80 + k * 10, 120], [-110 + k * 14, 300]], 1.4, '#8a9a7c', { a: .45, seed: 172 + k });
}
// ---------------------------------------------------------------- front head (for the turn and the photograph)
function headF(c, who, e = {}) {
  const sk = SK[who], male = who === 'post' || who === 'babu';
  wash(c, [[0, -88], [40, -74], [52, -30], [48, 20], [30, 58], [0, 72], [-30, 58], [-48, 20], [-52, -30], [-40, -74]], sk, { a: .82, line: LINE, lw: 2, seed: 201 });
  for (const d of [-1, 1]) { const ex = d * 21, ey = -8, op = 1 - (e.blink || 0);
    if (op > .1) { const ey2 = new Path2D(); ey2.ellipse(ex, ey, 9, 4.5 * op, 0, 0, TAU); paperFill(c, ey2); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(70,42,26,.95)'; c.beginPath(); c.arc(ex + (e.gaze || 0) * 3, ey, 3.8 * op, 0, TAU); c.fill(); c.restore(); }
    stroke(c, [[ex - 10, ey], [ex, ey - 5 * op - 1], [ex + 10, ey]], 2, '#2a1a12', { a: .85, seed: 202 + d });
    stroke(c, [[ex - 11, ey - 15 - (e.brow || 0) * 3], [ex + d * 2, ey - 18 - (e.brow || 0) * 3], [ex + 11, ey - 15]], 2.4, male ? '#2a1e18' : '#3a2a20', { a: .7, seed: 204 + d }); }
  stroke(c, [[2, -2], [5, 18], [0, 22], [-4, 21]], 1.5, LINE, { a: .6, seed: 206 });
  stroke(c, [[-11, 38], [0, 40 + (e.smile || 0) * 3], [11, 38]], 2, '#8a3a32', { a: .8, seed: 207 });
  if (who === 'bride') { wash(c, [[0, -96], [44, -80], [56, -36], [52, 30], [62, 70], [40, 40], [42, -40], [0, -66], [-42, -40], [-40, 40], [-62, 70], [-52, 30], [-56, -36], [-44, -80]], '#2a1e18', { a: .9, seed: 208 }); stroke(c, [[0, -94], [0, -66]], 3, '#c8322a', { a: .9, seed: 209 }); softDot(c, 0, -24, 3.5, '#c8322a', .9, 'multiply'); }
  if (who === 'amma') { wash(c, [[0, -96], [44, -80], [54, -40], [44, -46], [0, -70], [-44, -46], [-54, -40], [-44, -80]], '#b9b4ac', { a: .85, seed: 210 }); softDot(c, 0, -24, 3.2, '#7a2a2a', .9, 'multiply'); }
  if (who === 'babu') { wash(c, [[0, -96], [46, -78], [54, -36], [42, -52], [0, -70], [-42, -52], [-54, -36], [-46, -78]], '#2e2620', { a: .9, seed: 211 }); wash(c, [[-22, 30], [0, 26], [22, 30], [26, 38], [0, 33], [-26, 38]], '#2e2620', { a: .9, seed: 212, k: 3 }); }
  if (who === 'post') { wash(c, [[-22, 30], [0, 26], [22, 30], [26, 38], [0, 33], [-26, 38]], '#a6a29c', { a: .9, seed: 213, k: 3 }); wash(c, [[0, -100], [48, -86], [56, -52], [0, -60], [-56, -52], [-48, -86]], '#b29a6a', { a: .9, seed: 214 }); }
}

// ---------------------------------------------------------------- hands (close-up rig): wrist at (0,0), fingers toward +x
// o: curl (0 open .. 1 fist), pinch (thumb to index), spread, old (veins, knuckle lines), side 'back' | 'palm', who
function handR(c, x, y, s, ang, o = {}) {
  const who = o.who || 'amma', sk = SK[who], skd = SKD[who], cu = (o.curl ?? .25) * .55, pi = o.pinch || 0, sp = o.spread ?? .15;
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s * (o.flipY ? -1 : 1));
  if (o.sleeve) wash(c, [[-140, -34], [-4, -34], [6, 0], [-4, 34], [-140, 34]], o.sleeve, { a: .85, line: LINE, lw: 2, seed: 300 });
  const fingers = [[68, -19, 42, 9], [74, -6, 48, 9.5], [72, 7, 45, 9], [64, 18, 36, 8]];
  // far fingers first (behind the palm when curled)
  fingers.forEach(([kx, ky, len, w], i) => { const fa = (i - 1.5) * sp * .3, c1 = cu * (1 + i * .12), seg = [];
    let px = kx, py = ky, a = fa; seg.push([px, py]); for (let k = 0; k < 3; k++) { a += c1 * (k === 0 ? .35 : .8); const l = len / 3 * (k === 0 ? 1.15 : .95); px += Math.cos(a) * l; py += Math.sin(a) * l; seg.push([px, py]); }
    const fp = tube(seg, [w * 1.45, w * 1.38, w * 1.25, w * 1.05]); wash(c, fp, sk, { a: .82, line: LINE, lw: 1.5, la: .5, seed: 310 + i, k: 3 });
    if (o.old) for (let k = 1; k < 3; k++) stroke(c, [[seg[k][0] - 2, seg[k][1] - w * .6], [seg[k][0] + 1, seg[k][1] + w * .6]], .9, skd, { a: .5, seed: 320 + i * 3 + k });
    if (o.side !== 'palm') { const tip = seg[3], nail = new Path2D(); nail.ellipse(tip[0] - 4, tip[1], 5, w * .55, a, 0, TAU); glaze(c, nail, '#f4dccc', .5, 'screen'); } });
  const palm = [[-6, -24], [30, -30], [70, -26], [74, 0], [66, 26], [30, 30], [-6, 22]];
  wash(c, palm, sk, { a: .82, line: LINE, lw: 1.8, la: .5, seed: 330 });
  if (o.old) { for (let k = 0; k < 3; k++) stroke(c, [[6 + k * 8, -16 + k * 12], [40 + k * 6, -18 + k * 14], [64, -14 + k * 12]], 1.1, '#9a8aa0', { a: .35, seed: 331 + k }); for (let k = 0; k < 4; k++) softDot(c, 68, -20 + k * 12, 3, skd, .4, 'multiply'); }
  // thumb: from the base of the palm toward the index tip as it pinches
  const tb = [[16, -26], [38, -42 - 6 * (1 - pi)], [58 + 10 * pi, -40 + 10 * pi], [72 + 14 * pi, -32 + 12 * pi]];
  wash(c, tube(tb, [20, 16, 13.5, 11.5]), sk, { a: .84, line: LINE, lw: 1.6, la: .55, seed: 340, k: 3 });
  if (o.bangle) for (let k = 0; k < 2; k++) { const b = new Path2D(); b.ellipse(-8 - k * 9, 0, 4, 36, 0, 0, TAU); c.save(); c.strokeStyle = o.bangle === 'red' ? (k ? 'rgba(200,150,60,.95)' : 'rgba(190,40,40,.95)') : 'rgba(200,154,70,.95)'; c.lineWidth = 4; c.stroke(b); c.restore(); }
  c.restore();
}

// ---------------------------------------------------------------- bodies
function legsWalk(c, o, cloth, clothD, len, shoe) {
  const ph = o.phase || 0, wk = o.walk || 0;
  for (const side of [-1, 1]) { const p = ph + (side > 0 ? 0 : Math.PI), a = Math.sin(p) * .38 * wk, lift = Math.max(0, Math.sin(p + 1.2)) * 16 * wk, knee = Math.max(0, Math.sin(p + 2.0)) * .6 * wk;
    const hip = [side * 5, -len], kn = [hip[0] + Math.sin(a) * len * .5, hip[1] + Math.cos(a) * len * .5], ft = [kn[0] + Math.sin(a - knee) * len * .5, -lift];
    wash(c, tube([hip, kn, [ft[0], ft[1] - 10]], [44, 34, 26]), side < 0 ? clothD : cloth, { a: .85, line: LINE, lw: 1.8, la: .45, seed: 400 + side, k: 3 });
    wash(c, [[ft[0] - 12, ft[1] - 12], [ft[0] + 28, ft[1] - 8], [ft[0] + 32, ft[1]], [ft[0] - 14, ft[1]]], shoe, { a: .9, raw: true, line: LINE, lw: 1.6, seed: 402 + side }); }
}
function armIK(c, sx, sy, tx, ty, L1, L2, sleeveC, skin, o = {}) {   // returns elbow, hand; sleeve to the elbow (short sleeve) or to the wrist
  const d = Math.min(Math.hypot(tx, ty), L1 + L2 - 1), an = Math.atan2(ty, tx), cc = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1), a1 = an + Math.acos(cc) * (o.bend ?? 1);
  const el = [sx + Math.cos(a1) * L1, sy + Math.sin(a1) * L1], hd = [sx + tx * d / Math.hypot(tx, ty), sy + ty * d / Math.hypot(tx, ty)];
  if (o.short) { wash(c, tube([el, hd], [24, 18]), skin, { a: .82, line: LINE, lw: 1.6, la: .45, seed: 420 + (o.seed || 0), k: 3 }); wash(c, tube([[sx, sy], [lerp(sx, el[0], 1.05), lerp(sy, el[1], 1.05)]], [36, 30]), sleeveC, { a: .85, line: LINE, lw: 1.8, la: .45, seed: 421 + (o.seed || 0), k: 3 }); }
  else wash(c, tube([[sx, sy], el, [lerp(el[0], hd[0], .86), lerp(el[1], hd[1], .86)]], [32, 26, 22]), sleeveC, { a: .85, line: LINE, lw: 1.8, la: .45, seed: 422 + (o.seed || 0), k: 3 });
  const fa = Math.atan2(hd[1] - el[1], hd[0] - el[0]);
  c.save(); c.translate(hd[0], hd[1]); c.rotate(fa); wash(c, [[-8, -9], [10, -11], [24, -6], [30, 0], [22, 7], [6, 10], [-8, 8]], skin, { a: .85, line: LINE, lw: 1.4, la: .5, seed: 425 + (o.seed || 0) }); c.restore();
  return { el, hd, fa };
}
// POSTMAN — o: t, phase, walk, view ('side' | 'back'), arm: {near: [tx,ty], far: [tx,ty]}, head (tilt, + = up), e (expression), bag swing
function drawPostman(c, x, y, s, o = {}) {
  const t = o.t || 0, wk = o.walk || 0, ph = o.phase || 0, bob = -Math.abs(Math.cos(ph)) * 7 * wk, br = Math.sin(t * 1.6) * 1.5;
  c.save(); c.translate(x, y + bob * s); c.scale(s * (o.dir || 1), s);
  const KH = '#c9b07c', KHD = '#a08a5c', TR = '#a8946a', TRD = '#86744e', BAG = '#7a4a2a';
  if (o.view === 'back') {
    for (const side of [-1, 1]) { const p = ph + (side > 0 ? 0 : Math.PI), lift = Math.max(0, Math.sin(p)) * 26 * wk, sh = Math.cos(p) * 6 * wk;
      wash(c, tube([[side * 16, -300], [side * 16 + sh * .5, -150], [side * 15 + sh, -10 - lift * .4]], [46, 38, 28]), side < 0 ? TRD : TR, { a: .85, line: LINE, lw: 1.8, la: .45, seed: 500 + side, k: 3 });
      wash(c, [[side * 15 + sh - 13, -lift * .4 - 6], [side * 15 + sh + 13, -lift * .4 - 6], [side * 15 + sh + 14, -lift * .4 + 6], [side * 15 + sh - 14, -lift * .4 + 6]], '#5a3a26', { a: .9, raw: true, seed: 502 + side }); }
    wash(c, [[-48, -500 + br], [48, -500 + br], [56, -420], [52, -300], [-52, -300], [-56, -420]], KH, { a: .85, line: LINE, lw: 2, la: .5, seed: 503 });
    stroke(c, [[0, -490], [0, -306]], 1.4, KHD, { a: .5, seed: 504 });
    for (const side of [-1, 1]) { const sw = Math.sin(ph + (side > 0 ? Math.PI : 0)) * 10 * wk; armIK(c, side * 48, -486, side * 14 + sw * .2, 210 - Math.abs(sw), 116, 112, KH, SK.post, { short: true, bend: side > 0 ? -1 : 1, seed: 510 + side }); }
    stroke(c, [[-40, -496], [10, -420], [44, -330]], 7, '#5a3420', { a: .9, seed: 505 });   // satchel strap across the back
    wash(c, [[30, -360 + Math.sin(ph) * 4 * wk], [80, -360 + Math.sin(ph) * 4 * wk], [84, -280], [26, -280]], BAG, { a: .88, line: LINE, lw: 1.8, seed: 506 });
    c.save(); c.translate(0, -550); c.scale(.55, .55); wash(c, [[-26, 120], [-30, 60], [-48, 0], [-50, -50], [-30, -86], [30, -86], [50, -50], [48, 0], [30, 60], [26, 120]], SK.post, { a: .82, line: LINE, lw: 2, seed: 507 });
    wash(c, [[-50, -20], [-52, -56], [-30, -90], [30, -90], [52, -56], [50, -20], [30, -30], [0, -34], [-30, -30]], '#a8a49e', { a: .85, seed: 508 }); wash(c, [[-56, -50], [-50, -90], [0, -110], [50, -90], [56, -50], [0, -62]], '#b29a6a', { a: .9, line: '#5a4a30', lw: 2, seed: 509 });
    for (const d of [-1, 1]) wash(c, [[d * 48, -14], [d * 60, -6], [d * 58, 18], [d * 48, 20]], SK.post, { a: .82, seed: 511 + d }); c.restore();
    c.restore(); return {};
  }
  // side view
  const farT = o.arm?.far || [Math.sin(ph) * -80 * wk + 4, 218], nearT = o.arm?.near || [Math.sin(ph) * 90 * wk + 10, 216];
  armIK(c, -6, -486, farT[0], farT[1], 118, 114, KHD, SKD.post, { short: true, seed: 520 });
  legsWalk(c, o, TR, TRD, 300, '#5a3a26');
  const shirt = [[-40, -500 + br], [6, -510 + br], [36, -496], [46, -440], [40, -380], [44, -300], [-44, -296], [-46, -380], [-50, -450]];
  wash(c, shirt, KH, { a: .85, line: LINE, lw: 2, la: .5, seed: 521 });
  for (const yy of [-450, -400, -350]) softDot(c, 30, yy, 2.5, '#6a5a3a', .8, 'multiply');
  wash(c, [[8, -470], [30, -470], [30, -440], [8, -440]], KHD, { a: .6, raw: true, edge: .3, seed: 522 });   // pocket
  stroke(c, [[-44, -302], [44, -306]], 6, '#5a3a26', { a: .8, seed: 523 });   // belt
  // satchel: strap over the far shoulder, bag at the near hip, swinging with the stride
  const bs = Math.sin(ph) * 8 * wk + (o.bagTilt || 0);
  stroke(c, [[-24, -506], [6, -420], [40, -326]], 7, '#5a3420', { a: .9, seed: 524 });
  c.save(); c.translate(36, -312); c.rotate(bs * .012); wash(c, [[-34, -20], [44, -20], [50, 70], [-30, 70]], BAG, { a: .9, line: LINE, lw: 2, la: .6, seed: 525 }); wash(c, [[-36, -22], [46, -22], [46, 20], [-36, 14]], '#6a3e22', { a: .85, line: LINE, lw: 1.6, seed: 526 }); softDot(c, 6, 10, 4, '#b8903a', .9, 'multiply');
  for (let k = 0; k < 3; k++) wash(c, [[-20 + k * 10, -26], [-4 + k * 10, -40 - k * 3], [6 + k * 10, -26]], '#efe2c8', { a: .6, raw: true, seed: 527 + k }); c.restore();   // letters peeking out
  c.save(); c.translate(10, -556 + br * .5); c.rotate(-(o.head || 0)); c.scale(.58, .58);
  wash(c, [[24, 96], [24, 140], [-30, 140], [-30, 96]], SK.post, { a: .82, raw: true, seed: 528 }); headP(c, 'post', { t, ...(o.e || {}) }); c.restore();
  const near = armIK(c, 12, -482, nearT[0], nearT[1], 120, 116, KH, SK.post, { short: true, seed: 530 });
  if (o.holdEnv && near) envelopeSmall(c, near.hd[0] + 14, near.hd[1] - 12, .55, near.fa - .3);
  c.restore();
  const M = new DOMMatrix().translate(x, y + bob * s).scale(s * (o.dir || 1), s); const at = (px, py) => { const q = new DOMPoint(px, py).matrixTransform(M); return [q.x, q.y]; };
  return { hand: at(near.hd[0], near.hd[1]), head: at(30, -566) };
}
function envelopeSmall(c, x, y, s, a) { c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s); wash(c, [[-60, -38], [60, -38], [60, 38], [-60, 38]], '#e8d4a8', { a: .85, raw: true, line: '#7a6040', lw: 1.6, seed: 600 }); stroke(c, [[-58, -36], [0, 6], [58, -36]], 1.4, '#9a8058', { a: .6, seed: 601 }); softDot(c, 38, -20, 9, '#c0402e', .7, 'multiply'); c.restore(); }

// AMMA seated — o: t, dir, breath, head (tilt), headTurn (0 profile → 1 front → 2 profile mirrored), arms: 'lap' | 'reach' | 'hold' | 'heart' | 'place', k, e
function drawAmma(c, x, y, s, o = {}) {
  const t = o.t || 0, brA = (o.breath ?? 1) * Math.sin(t * 1.25) * 2.6, SAR = '#b4c0a2', SARD = '#8a9a7c', BOR = '#7a2a2a', BL = '#7a2a2a';
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s);
  // the chair: a simple old wooden chair seen from the side
  const WOOD = '#8a6040';
  wash(c, [[-70, -250], [70, -250], [70, -232], [-70, -232]], WOOD, { a: .9, raw: true, line: LINE, lw: 1.8, seed: 700 });
  for (const xx of [-64, 56]) wash(c, [[xx, -232], [xx + 10, -232], [xx + 10, 0], [xx, 0]], WOOD, { a: .9, raw: true, line: LINE, lw: 1.6, seed: 701 + xx });
  wash(c, [[-74, -560], [-60, -560], [-60, -250], [-74, -250]], WOOD, { a: .9, raw: true, line: LINE, lw: 1.6, seed: 703 });
  // legs under the saree (knees forward), feet
  wash(c, [[-50, -300], [80, -290], [96, -250], [92, -200], [84, -10], [50, -6], [56, -200], [-40, -230]], SAR, { a: .85, line: LINE, lw: 2, la: .5, seed: 704 });
  stroke(c, [[84, -14], [52, -10]], 6, BOR, { a: .85, seed: 705 }); wash(c, [[52, -8], [94, -8], [98, 2], [50, 2]], SK.amma, { a: .85, raw: true, seed: 706 });
  for (let k = 0; k < 4; k++) stroke(c, [[70 + k * 4, -240], [64 + k * 5, -120], [60 + k * 6, -16]], 1.4, SARD, { a: .5, seed: 707 + k });   // pleats
  // torso, a little bent with age, breathing
  const tor = [[-46, -560 + brA], [8, -572 + brA], [40, -546 + brA], [52, -470], [46, -390], [60, -300], [-50, -290], [-56, -400], [-60, -500]];
  wash(c, tor, BL, { a: .85, line: LINE, lw: 2, la: .5, seed: 710 });
  // the pallu: over the head and the far shoulder, falling across the back
  wash(c, [[-64, -580 + brA], [-30, -640 + brA], [20, -652 + brA], [36, -620 + brA], [10, -600 + brA], [-20, -560], [-40, -470], [-30, -380], [-70, -300], [-84, -420], [-80, -520]], SAR, { a: .82, line: LINE, lw: 2, la: .5, seed: 711 });
  stroke(c, [[-30, -640 + brA], [-74, -560], [-82, -420], [-70, -300]], 8, BOR, { a: .85, seed: 712 });
  wash(c, [[40, -546 + brA], [60, -470], [56, -390], [70, -300], [20, -296], [24, -400], [30, -480]], SAR, { a: .82, line: LINE, lw: 1.8, la: .5, seed: 713 });   // saree across the front
  stroke(c, [[42, -540 + brA], [60, -470], [56, -390], [70, -304]], 6, BOR, { a: .8, seed: 714 });
  // head
  const ht = o.headTurn || 0;
  c.save(); c.translate(18, -620 + brA); c.rotate(-(o.head || 0)); c.scale(.56, .56);
  wash(c, [[22, 96], [22, 140], [-28, 140], [-28, 96]], SK.amma, { a: .82, raw: true, seed: 715 });
  if (ht < .5 || ht > 1.5) { if (ht > 1.5) c.scale(-1, 1); headP(c, 'amma', { t, ...(o.e || {}) }); } else headF(c, 'amma', { t, ...(o.e || {}) });
  // the pallu edge over the top of the head (drawn over the hair)
  wash(c, [[-80, -60], [-50, -96], [0, -104], [34, -86], [20, -76], [-20, -84], [-60, -60], [-70, 0], [-90, 10]], SAR, { a: .8, line: LINE, lw: 1.8, la: .5, seed: 716 });
  stroke(c, [[34, -86], [0, -102], [-50, -94], [-82, -56]], 7, BOR, { a: .8, seed: 717 });
  c.restore();
  // arms by pose
  const k = ss(o.k ?? 1), pose = o.arms || 'lap';
  const P = { lap: [[40, 150], [60, 150]], reach: [[150, 30], [140, 50]], hold: [[90, 100], [110, 96]], read: [[96, 60], [118, 56]], heart: [[30, 50], [40, 62]], place: [[108, 196], [112, 200]] }[pose];
  const L0 = [[40, 150], [60, 150]];
  const far = armIK(c, -20, -540 + brA, lerp(L0[0][0], P[0][0], k), lerp(L0[0][1], P[0][1], k), 116, 112, BL, SKD.amma, { seed: 720 });
  const prop = o.letter ? o.letter : null;
  const near = armIK(c, 16, -536 + brA, lerp(L0[1][0], P[1][0], k), lerp(L0[1][1], P[1][1], k), 118, 114, BL, SK.amma, { seed: 730 });
  for (const h of [far, near]) { c.save(); c.translate(lerp(h.el[0], h.hd[0], .86), lerp(h.el[1], h.hd[1], .86)); c.rotate(h.fa); for (let j = 0; j < 2; j++) { const b = new Path2D(); b.ellipse(-j * 5, 0, 2.4, 11, 0, 0, TAU); c.strokeStyle = 'rgba(196,150,60,.95)'; c.lineWidth = 2.2; c.stroke(b); } c.restore(); }
  if (prop) prop(c, (far.hd[0] + near.hd[0]) / 2 + 10, (far.hd[1] + near.hd[1]) / 2 - 6, (far.fa + near.fa) / 2);
  c.restore();
  const M = new DOMMatrix().translate(x, y).scale(s * (o.dir || 1), s); const at = (px, py) => { const q = new DOMPoint(px, py).matrixTransform(M); return [q.x, q.y]; };
  return { hand: at(near.hd[0], near.hd[1]), head: at(28, -626) };
}
// BRIDE standing (memory) — o: t, dir, head, e, arms 'rest' | 'joined' (namaste), walk/phase
function drawBride(c, x, y, s, o = {}) {
  const t = o.t || 0, wk = o.walk || 0, ph = o.phase || 0, bob = -Math.abs(Math.cos(ph)) * 6 * wk, br = Math.sin(t * 1.4) * 1.6, RED = '#c0302a', REDD = '#8a1a18', GOLD = '#c8a048';
  c.save(); c.translate(x, y + bob * s); c.scale(s * (o.dir || 1), s);
  const sw = Math.sin(ph) * 14 * wk;
  wash(c, [[-50, -320], [46, -330], [70 + sw, -12], [-64 - sw * .5, -10]], RED, { a: .88, line: LINE, lw: 2, la: .5, seed: 800 });   // the saree skirt
  stroke(c, [[-64 - sw * .5, -18], [70 + sw, -20]], 10, GOLD, { a: .85, seed: 801 }); for (let k = 0; k < 5; k++) stroke(c, [[-20 + k * 16, -320], [-30 + k * 20 + sw * .4, -20]], 1.4, REDD, { a: .45, seed: 802 + k });
  for (const d of [-1, 1]) wash(c, [[d * 10 + (d > 0 ? sw : 0) - 10, -8], [d * 10 + (d > 0 ? sw : 0) + 26, -6], [d * 10 + (d > 0 ? sw : 0) + 26, 4], [d * 10 + (d > 0 ? sw : 0) - 12, 4]], SK.bride, { a: .85, raw: true, seed: 805 + d });
  const aJ = o.arms === 'joined' ? ss(o.k ?? 1) : 0;
  armIK(c, -8, -486, lerp(-6, 64, aJ), lerp(214, 20, aJ), 112, 108, RED, SKD.bride, { seed: 810 });
  wash(c, [[-42, -500 + br], [8, -510 + br], [36, -494], [46, -430], [40, -330], [-50, -320], [-54, -430]], RED, { a: .88, line: LINE, lw: 2, la: .5, seed: 811 });
  // pallu over the head and down the back, with its gold border
  wash(c, [[-56, -540], [-26, -606], [24, -616], [40, -584], [10, -566], [-20, -520], [-40, -420], [-30, -300], [-70, -240], [-84, -400], [-76, -500]], RED, { a: .78, line: LINE, lw: 1.8, la: .5, seed: 812 });
  stroke(c, [[38, -586], [20, -612], [-26, -604], [-64, -540], [-82, -400], [-70, -244]], 8, GOLD, { a: .9, seed: 813 });
  for (let k = 0; k < 12; k++) softDot(c, -60 + hash(k) * 90, -560 + hash(k * 3) * 280, 2.4, '#e8c060', .9, 'multiply');   // gold butis
  c.save(); c.translate(12, -560 + br * .4); c.rotate(-(o.head || 0)); c.scale(.56, .56); wash(c, [[22, 96], [22, 140], [-28, 140], [-28, 96]], SK.bride, { a: .82, raw: true, seed: 814 });
  headP(c, 'bride', { t, ...(o.e || {}) });
  wash(c, [[-84, -60], [-50, -98], [0, -108], [36, -90], [20, -78], [-20, -86], [-60, -60], [-74, 0], [-94, 10]], RED, { a: .72, line: LINE, lw: 1.6, la: .5, seed: 815 });
  stroke(c, [[36, -90], [0, -106], [-52, -96], [-86, -56]], 6, GOLD, { a: .85, seed: 816 }); c.restore();
  const near = armIK(c, 14, -482, lerp(4, 70, aJ), lerp(214, 24, aJ), 114, 110, RED, SK.bride, { seed: 820 });
  for (let j = 0; j < 4; j++) { c.save(); c.translate(lerp(near.el[0], near.hd[0], .82 - j * .04), lerp(near.el[1], near.hd[1], .82 - j * .04)); c.rotate(near.fa); const b = new Path2D(); b.ellipse(0, 0, 2.6, 11, 0, 0, TAU); c.strokeStyle = j % 2 ? 'rgba(200,154,60,.95)' : 'rgba(180,30,30,.95)'; c.lineWidth = 2.6; c.stroke(b); c.restore(); }
  c.restore();
  const M = new DOMMatrix().translate(x, y + bob * s).scale(s * (o.dir || 1), s); const at = (px, py) => { const q = new DOMPoint(px, py).matrixTransform(M); return [q.x, q.y]; };
  return { head: at(28, -566), hand: at(near.hd[0], near.hd[1]) };
}
// BABUJI standing (memory) — o: t, dir, head, e, arm 'rest' | 'bless' (hand raised over her head) | 'door' (hand on the door frame), k
function drawBabu(c, x, y, s, o = {}) {
  const t = o.t || 0, br = Math.sin(t * 1.3 + 1) * 1.8, KU = '#f0e8d8', KUD = '#cfc4ae', SH = '#8a6a48';
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s);
  armIK(c, -8, -490, -4, 214, 116, 112, KUD, SKD.babu, { seed: 900 });
  for (const d of [-1, 1]) wash(c, tube([[d * 8, -300], [d * 10, -150], [d * 10, -12]], [52, 46, 36]), d < 0 ? KUD : KU, { a: .82, line: LINE, lw: 1.8, la: .45, seed: 901 + d, k: 3 });
  for (const d of [-1, 1]) wash(c, [[d * 10 - 14, -12], [d * 10 + 26, -8], [d * 10 + 28, 2], [d * 10 - 16, 2]], '#6a4a30', { a: .9, raw: true, seed: 903 + d });
  wash(c, [[-46, -506 + br], [6, -516 + br], [38, -500], [50, -440], [46, -360], [54, -250], [-52, -246], [-50, -360], [-54, -450]], KU, { a: .82, line: LINE, lw: 2, la: .5, seed: 905 });
  wash(c, [[-48, -510 + br], [10, -520 + br], [30, -494], [6, -440], [-6, -330], [-30, -300], [-56, -380], [-60, -470]], SH, { a: .82, line: LINE, lw: 1.8, la: .5, seed: 906 });   // shawl
  stroke(c, [[28, -494], [6, -440], [-6, -330]], 5, '#c89a50', { a: .7, seed: 907 });
  c.save(); c.translate(12, -566 + br * .4); c.rotate(-(o.head || 0)); c.scale(.58, .58); wash(c, [[22, 96], [22, 140], [-30, 140], [-30, 96]], SK.babu, { a: .82, raw: true, seed: 908 }); headP(c, 'babu', { t, ...(o.e || {}) }); c.restore();
  const k = ss(o.k ?? 1), P = { rest: [6, 214], bless: [176, -86], door: [120, -40] }[o.arm || 'rest'];
  const near = armIK(c, 14, -486, lerp(6, P[0], k), lerp(214, P[1], k), 120, 116, KU, SK.babu, { seed: 910 });
  c.restore();
  const M = new DOMMatrix().translate(x, y).scale(s * (o.dir || 1), s); const at = (px, py) => { const q = new DOMPoint(px, py).matrixTransform(M); return [q.x, q.y]; };
  return { head: at(28, -572), hand: at(near.hd[0], near.hd[1]) };
}
