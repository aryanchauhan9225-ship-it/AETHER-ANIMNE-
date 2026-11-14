// आखिरी रोशनी — night coast in Watercolor Brush (Lemo-Opuscar). Classic script on engine.js globals.
// Independent layers, each a pure function of t: sky + stars, far fog, sea (rows of drifting wave strokes, swell, foam),
// far cliff, headland + lighthouse, surf, rotating beam (lights fog and water), near fog.
const N = { skyTop: '#060b15', skyMid: '#0d182a', skyLow: '#1b2c44', seaFar: '#1b2d44', seaMid: '#112238', seaDeep: '#091524', crest: '#7089a4', foam: '#c6d2dc',
  fog: '#7e91a6', rock: '#0a111b', rock2: '#18263a', rockLit: '#31445a', tower: '#4f5f70', towerSh: '#232e3b', gold: '#f2b45a', hot: '#ffe6ae' };
const LAMP = { x: 1262, y: 266 }, HZ = 600, FOCUS = [1230, 400];

// soft watercolour puddle (radial falloff), optional blend mode
function blob(c, x, y, r, col, a, sx = 1, sy = 1, mode = null) {
  if (a <= .003) return;
  c.save(); if (mode) c.globalCompositeOperation = mode; c.translate(x, y); c.scale(sx, sy);
  const g = c.createRadialGradient(0, 0, r * .08, 0, 0, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(.55, rgba(col, a * .55)); g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.restore();
}
function wash(c, pts, col, a, seed, jit = 4) {
  withSeed(seed, () => { for (let k = 0; k < 3; k++) { c.beginPath(); pts.forEach((p, i) => { const x = p[0] + rnd(-jit, jit), y = p[1] + rnd(-jit, jit); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fillStyle = rgba(col, a * .4); c.fill(); } });
}
function solid(c, pts, col) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = col; c.fill(); }
function band(c, y0, y1, col, a, seed, amp = 10, t = 0) {
  c.beginPath(); c.moveTo(-700, y1 + 4);
  for (let x = -700; x <= W + 700; x += 40) c.lineTo(x, y0 + (fbm(x * .0045 + seed * 7.1 + t * .03) - .5) * amp * 2);
  c.lineTo(W + 700, y1 + 4); c.closePath(); c.fillStyle = rgba(col, a); c.fill();
}
// camera: every layer scales about the focus by its own depth factor k (far layers move less = parallax push-in)
function cam(c, Z, k) { const s = 1 + (Z - 1) * k; c.setTransform(s, 0, 0, s, FOCUS[0] * (1 - s), FOCUS[1] * (1 - s)); }

// —— the lamp and its two opposed beams ——
// the lamp is driven per scene: LAMPF.on(t) gives brightness 0..1, LAMPF.t0 the time the rotation is referenced to
let LAMPF = { t0: 5, on: t => { if (t < 5) return 0; if (t < 5.7) return hash(Math.floor(t * 16)) > .45 ? .25 + .75 * seg(t, 5, 5.7) : .08; return 1; } };
function lampOn(t) { return LAMPF.on(t); }
function beams(t) {
  const on = lampOn(t), th = (t - LAMPF.t0) * Math.PI * 2 / 5.2 + 2.75, out = [];
  for (const a of [th, th + Math.PI]) { const cs = Math.cos(a), sn = Math.sin(a); out.push({ d: cs >= 0 ? 1 : -1, len: 170 + 1500 * Math.pow(Math.abs(cs), .9), ac: Math.abs(cs), toward: sn, I: on * (.5 + .5 * sn) * (.55 + .45 * Math.abs(cs)) + on * .12 }); }
  return out;
}
const beamHW = (B, dx) => 12 + dx * (.085 + .2 * (1 - B.ac));
function beamAt(B, x, y) {   // light the beam puts on a point of the fog
  const dx = (x - LAMP.x) * B.d; if (dx <= 0) return 0; const f = dx / B.len; if (f >= 1) return 0;
  const hw = beamHW(B, dx) * 1.6, dy = Math.abs(y - (LAMP.y + dx * .03)); if (dy >= hw) return 0;
  return B.I * Math.pow(1 - f, 1.1) * (1 - (dy / hw) * (dy / hw));
}
function drawBeam(c, B) {
  if (B.I <= .01) return;
  const x1 = LAMP.x + B.d * B.len, y1 = LAMP.y + B.len * .03, hw = beamHW(B, B.len);
  c.save(); c.globalCompositeOperation = 'screen';
  for (const [wm, a, blur] of [[1.5, .2, 14], [.8, .34, 5]]) {
    const g = c.createLinearGradient(LAMP.x, 0, x1, 0); g.addColorStop(0, rgba(N.hot, a * B.I)); g.addColorStop(.35, rgba(N.gold, a * .7 * B.I)); g.addColorStop(1, rgba(N.gold, 0));
    c.filter = `blur(${blur}px)`; c.fillStyle = g; c.beginPath(); c.moveTo(LAMP.x, LAMP.y - 7 * wm); c.lineTo(x1, y1 - hw * wm); c.lineTo(x1, y1 + hw * wm); c.lineTo(LAMP.x, LAMP.y + 7 * wm); c.closePath(); c.fill();
  }
  c.restore();
}

// —— sky ——
function drawSky(c, t) {
  for (let i = 0; i < 7; i++) { const u = i / 7, col = u < .5 ? mixc(N.skyTop, N.skyMid, u * 2) : mixc(N.skyMid, N.skyLow, (u - .5) * 2); band(c, lerp(-300, HZ, u), HZ + 8, col, .55, 20 + i, 18, t); }
  for (let i = 0; i < 70; i++) { const x = hash(i * 3.7) * 2400 - 240, y = hash(i * 9.1) * 470 - 60, tw = .35 + .65 * Math.pow(.5 + .5 * Math.sin(t * (1 + hash(i) * 2.5) + i), 2); c.fillStyle = rgba('#dfe7f2', .5 * tw * (.4 + .6 * hash(i * 5.3))); c.beginPath(); c.arc(x, y, .8 + 1.4 * hash(i * 2.1), 0, 7); c.fill(); }
  for (let k = 0; k < 6; k++) { const span = 3200, x = ((hash(k * 3.1) * span - t * (7 + 5 * hash(k))) % span + span) % span - 600, y = 120 + hash(k * 5.7) * 330; blob(c, x, y, 260 + 160 * hash(k), '#2a3b54', .22, 2.2, .32); }   // drifting cloud bands
}
// —— sea: graded washes, rolling swell, rows of wave strokes that drift, breathe and bend; light from the lamp and beams ——
function drawSea(c, t, B) {
  const bottom = H + 240, R = 16, yOf = u => HZ + (bottom - HZ) * Math.pow(u, 1.55), on = lampOn(t);
  solid(c, [[-700, HZ], [W + 700, HZ], [W + 700, bottom], [-700, bottom]], N.seaFar);
  for (let i = 1; i < 6; i++) { const u = i / 6, col = u < .4 ? mixc(N.seaFar, N.seaMid, u / .4) : mixc(N.seaMid, N.seaDeep, (u - .4) / .6); band(c, yOf(u) - 2, bottom, col, .6, 40 + i, 3 + u * 26, t * (1 + u * 3)); }
  for (let k = 0; k < 5; k++) { const u = ((k / 5 + t * .04) % 1), y = yOf(u), h = 8 + u * 70; band(c, y, y + h, '#03070d', .16 + .16 * u, 70 + k, 6 + u * 26, t * 4); }   // swell rolling in
  for (let r = 0; r < R; r++) {
    const u = (r + .6) / R, y = yOf(u), y2 = yOf(u + 1 / R), n = Math.round(lerp(30, 10, u)), L = lerp(36, 340, u), w = lerp(2, 17, u * u), sp = lerp(8, 95, u * u), span = W + 1500;
    for (let i = 0; i < n; i++) {
      const id = r * 53 + i, ph = hash(id) * 6.283, life = .5 + .5 * Math.sin(t * (.6 + hash(id * 3) * .6) + ph); if (life < .1) continue;
      const x = ((hash(id * 1.7) * span + t * sp) % span + span) % span - 750, yy = lerp(y, y2, hash(id * 2.9)) + Math.sin(t * 1.3 + ph) * lerp(.6, 9, u), len = L * (.55 + hash(id * 4.1) * .9), bend = len * (.05 + .05 * Math.sin(t * .9 + ph * 2));
      const lit = on * Math.max(0, 1 - Math.abs(x + len / 2 - LAMP.x) / (90 + 420 * u)) * .5;      // the lamp's path on the water
      const col = lit > .05 ? mixc(N.crest, N.gold, Math.min(1, lit * 1.6)) : hash(id * 6.3) < .5 ? N.crest : '#3d556f';
      withSeed(5000 + id, () => drawS(c, mk(qcurve(x, yy, x + len, yy + rnd(-2, 2) * u * 6, -bend, 9), w, col, { prof: 'leaf', a: (lerp(.16, .5, u) + lit * .5) * life, rough: .3 }), 1));
      if (hash(id * 8.7) < .26 && u > .15) withSeed(9000 + id, () => drawS(c, mk(qcurve(x + len * .15, yy - w * .7, x + len * .8, yy - w * .7, -bend * .8, 7), Math.max(1.3, w * .3), N.foam, { prof: 'leaf', a: .5 * life, nb: 0 }), 1));
    }
  }
  // beam light skating over the water under each beam (flecks re-seeded 15×/s)
  const f = Math.floor(t * 15);
  for (const b of B) { if (b.I < .05) continue; for (let i = 0; i < 70; i++) { const dx = hash(i * 3.3 + f * 1.7) * b.len * .9, u = Math.pow(hash(i * 7.1 + f), 1.4) * .5, x = LAMP.x + b.d * dx, a = b.I * (1 - dx / b.len) * (.6 - u);
      c.fillStyle = rgba(N.hot, Math.max(0, a) * .8); c.beginPath(); c.ellipse(x, yOf(u) + 2, 10 + u * 70, 1 + u * 3.5, 0, 0, 7); c.fill(); } }
  const g = c.createLinearGradient(0, HZ - 30, 0, HZ + 80); g.addColorStop(0, rgba(N.fog, 0)); g.addColorStop(.4, rgba(N.fog, .3)); g.addColorStop(1, rgba(N.fog, 0)); c.fillStyle = g; c.fillRect(-700, HZ - 30, W + 1400, 110);   // horizon haze
}
// —— land ——
const headTop = x => HZ + 14 - (x < 860 ? 0 : 92 * ss(seg(x, 860, 1130)) + 150 * ss(seg(x, 1380, 1900)) + (fbm(x * .013) - .5) * 26 * seg(x, 860, 1000));
function drawFarCliff(c) {
  const p = [[1320, HZ + 10]]; for (let x = 1320; x <= 2700; x += 30) p.push([x, HZ + 8 - 250 * ss(seg(x, 1320, 2000)) - (fbm(x * .008 + 4) - .5) * 60]); p.push([2700, HZ + 20]);
  solid(c, p, N.rock2); wash(c, p, '#22344b', .5, 201, 5);
}
function drawHeadland(c, t) {
  const p = [[830, HZ + 30]]; for (let x = 830; x <= 2700; x += 22) p.push([x, headTop(x)]); p.push([2700, HZ + 260], [1500, HZ + 120], [1100, HZ + 70], [900, HZ + 46]);
  solid(c, p, N.rock); wash(c, p, '#111c2a', .6, 210, 4);
  withSeed(211, () => { for (let i = 0; i < 26; i++) { const x = rnd(880, 2300), y0 = headTop(x) + rnd(4, 20); drawS(c, mk(qcurve(x, y0, x + rnd(-30, 50), y0 + rnd(30, 120), rnd(-14, 14), 6), rnd(5, 16), i % 3 ? '#152233' : N.rockLit, { prof: 'tip', a: rnd(.25, .5) }), 1); }
    const top = []; for (let x = 860; x <= 2300; x += 24) top.push([x, headTop(x) + 2]); drawS(c, mk(top, 3.2, N.rockLit, { prof: 'even', nb: 0, a: .6, rough: .5 }), 1); });
  // keeper's cottage, dark
  solid(c, [[1118, headTop(1150) + 2], [1118, 528], [1150, 506], [1184, 528], [1184, headTop(1150) + 2]], '#0d1622'); withSeed(213, () => drawS(c, mk([[1114, 529], [1150, 505], [1188, 529]], 3, N.rockLit, { prof: 'even', nb: 0, a: .5 }), 1));
}
function drawLighthouse(c, t) {
  const on = lampOn(t), bx = LAMP.x, by = headTop(LAMP.x) + 4, ty = LAMP.y + 34;
  const body = [[bx - 44, by], [bx - 27, ty], [bx + 27, ty], [bx + 44, by]];
  solid(c, body, N.tower); wash(c, [[bx - 44, by], [bx - 27, ty], [bx - 2, ty], [bx - 6, by]], N.towerSh, .9, 220, 2);
  for (const u of [.3, .62]) { const y = lerp(ty, by, u), hw = lerp(27, 44, u), y2 = y + 34, hw2 = lerp(27, 44, u + .12); solid(c, [[bx - hw, y], [bx + hw, y], [bx + hw2, y2], [bx - hw2, y2]], '#141d29'); }   // dark bands
  solid(c, [[bx - 7, by], [bx - 7, by - 26], [bx + 7, by - 26], [bx + 7, by]], '#0a1018');
  withSeed(221, () => { drawS(c, mk([[bx + 43, by], [bx + 26, ty]], 3, '#9fb0c2', { prof: 'even', nb: 0, a: .45 }), 1); drawS(c, mk([[bx - 44, by], [bx - 27, ty]], 2.2, '#05090f', { prof: 'even', nb: 0, a: .7 }), 1); });
  solid(c, [[bx - 40, ty], [bx + 40, ty], [bx + 36, ty - 8], [bx - 36, ty - 8]], '#0b121b');                            // gallery
  for (let i = -3; i <= 3; i++) { c.fillStyle = '#0b121b'; c.fillRect(bx + i * 11 - 1, ty - 22, 2, 14); } c.fillRect(bx - 37, ty - 23, 74, 2.5);
  // lantern room: dark glass until the lamp wakes
  const gl = [[bx - 21, ty - 8], [bx - 21, LAMP.y - 22], [bx + 21, LAMP.y - 22], [bx + 21, ty - 8]];
  solid(c, gl, mixc('#141f2d', N.hot, on)); for (const dx of [-21, -7, 7, 21]) { c.fillStyle = '#070c13'; c.fillRect(bx + dx - 1.5, LAMP.y - 22, 3, 48); }
  solid(c, [[bx - 27, LAMP.y - 22], [bx + 27, LAMP.y - 22], [bx + 5, LAMP.y - 52], [bx - 5, LAMP.y - 52]], '#080d14'); c.fillStyle = '#080d14'; c.fillRect(bx - 1.5, LAMP.y - 66, 3, 16);
  if (on > 0) { blob(c, bx, LAMP.y, 62, N.hot, .95 * on, 1, 1, 'screen'); blob(c, bx, LAMP.y + 60, 150, N.gold, .2 * on, .6, 1.3, 'screen'); }   // glow on the tower's own stone
}
// surf breaking along the rocks: three surges out of phase
function drawSurf(c, t) {
  for (let i = 0; i < 26; i++) { const u = i / 25, x = lerp(820, 1560, u) + (hash(i * 3) - .5) * 40, y = lerp(HZ + 34, HZ + 150, Math.pow(u, 1.2)) + hash(i * 7) * 14, ph = t * 1.05 - u * 4 + hash(i) * 2, sw = Math.pow(.5 + .5 * Math.sin(ph), 3);
    withSeed(300 + i, () => drawS(c, mk(qcurve(x - 46 - 22 * sw, y + 8 * sw, x + 46 + 22 * sw, y + 6 * sw, -(8 + 12 * sw), 7), 4 + 9 * sw, N.foam, { prof: 'leaf', nb: 2, a: .12 + .5 * sw }), 1));
    if (sw > .7) blob(c, x, y - 10, 30 + 30 * sw, N.foam, .1 * sw, 1.6, .7); }
}
// —— fog: four banks at different depths, each drifting at its own speed; every puff is lit by the beams as they pass ——
const FOG = [{ k: .72, y: 575, n: 11, r: 230, sp: 46, a: .26, sy: .34 }, { k: 1, y: 330, n: 10, r: 210, sp: -38, a: .17, sy: .5 }, { k: 1.12, y: 640, n: 11, r: 250, sp: 72, a: .24, sy: .36 }, { k: 1.5, y: 930, n: 9, r: 400, sp: 120, a: .26, sy: .38 }];
function drawFog(c, t, L, B) {
  const span = 3400;
  for (let i = 0; i < L.n; i++) {
    const id = L.k * 100 + i, x = ((hash(id * 3.1) * span + t * L.sp * (.7 + .6 * hash(id))) % span + span) % span - 740, y = L.y + (hash(id * 5.3) - .5) * 120 + Math.sin(t * .35 + id) * 14, r = L.r * (.7 + .6 * hash(id * 7.7));
    blob(c, x, y, r, N.fog, L.a * (.6 + .4 * Math.sin(t * .4 + id * 2)), 1.9, L.sy);
    let lit = 0; for (const b of B) lit += beamAt(b, x, y) + .5 * beamAt(b, x - r * .8, y) + .5 * beamAt(b, x + r * .8, y);
    if (lit > .01) blob(c, x, y, r * .95, N.gold, Math.min(.5, lit * .42), 1.9, L.sy, 'screen');
  }
}
