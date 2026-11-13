// Sea, sky, mist, gulls: everything here moves every frame (waves drift and breathe, clouds travel, glitter flickers).
// Classic script sharing engine.js globals. All randomness is seeded so any frame renders alone.
const C = { skyTop: '#9fb6c6', skyMid: '#cfd3c8', skyLow: '#f2d3a6', sun: '#f6c98a', seaFar: '#a8c2cc', seaMid: '#5f95b1', seaDeep: '#2c6b94', ultra: '#1f4a7a',
  smoke: '#5e554f', hull: '#22262e', stone: '#dccba4', ochre: '#9a4a32', wood: '#8a5a36', coat: '#2b3340', skin: '#b78763', turban: '#efe6d2' };

// smooth closed blob through noisy radii (soft watercolour puddle); fill = flat or radial
function blob(c, x, y, r, col, a, seed, sx = 1, sy = 1, soft = true) {
  withSeed(seed, () => {
    const n = 12, ph = rnd(0, 50), P = [];
    for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2, rr = r * (.74 + .5 * vnoise(ph + i * 1.3)); P.push([x + Math.cos(an) * rr * sx, y + Math.sin(an) * rr * sy]); }
    c.beginPath();
    for (let i = 0; i <= n; i++) { const p = P[i % n], q = P[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; i ? c.quadraticCurveTo(p[0], p[1], mx, my) : c.moveTo(mx, my); }
    c.closePath();
    if (soft) { c.save(); c.translate(x, y); c.scale(sx, sy); c.translate(-x, -y); const g = c.createRadialGradient(x, y, r * .1, x, y, r * 1.2); g.addColorStop(0, rgba(col, a)); g.addColorStop(.5, rgba(col, a * .6)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 1.2, 0, 7); c.fill(); c.restore(); return; }
    else c.fillStyle = rgba(col, a);
    c.fill();
  });
}
// opaque base under a wash (for foreground objects that must hide what is behind them)
function solid(c, pts, col) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = col; c.fill(); }
// wash: polygon in 3 jittered passes (pooled edges)
function wash(c, pts, col, a, seed, jit = 4) {
  withSeed(seed, () => { for (let k = 0; k < 3; k++) { c.beginPath(); pts.forEach((p, i) => { const x = p[0] + rnd(-jit, jit), y = p[1] + rnd(-jit, jit); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fillStyle = rgba(col, a * .4); c.fill(); } });
}
// horizontal band with wavy top edge
function band(c, y0, y1, col, a, seed, amp = 10, t = 0) {
  c.beginPath(); c.moveTo(-40, y1 + 4);
  for (let x = -40; x <= W + 40; x += 40) c.lineTo(x, y0 + (fbm(x * .0045 + seed * 7.1 + t * .03) - .5) * amp * 2);
  c.lineTo(W + 40, y1 + 4); c.closePath(); c.fillStyle = rgba(col, a); c.fill();
}

// —— sky: wash bands, sun (unpainted paper + warm halo), travelling clouds ——
function drawSky(c, hz, t, pan = 0, sunX = 1420) {
  const top = -260, n = 7;
  for (let i = 0; i < n; i++) { const u0 = i / n, y0 = lerp(top, hz, u0), col = u0 < .5 ? mixc(C.skyTop, C.skyMid, u0 * 2) : mixc(C.skyMid, C.skyLow, (u0 - .5) * 2); band(c, y0, hz + 6, col, .34, 20 + i, 16, t); }
  const sx = sunX - pan * .25, sy = hz - 118;
  const g = c.createRadialGradient(sx, sy, 20, sx, sy, 520); g.addColorStop(0, rgba(C.sun, .75)); g.addColorStop(.35, rgba(C.sun, .28)); g.addColorStop(1, rgba(C.sun, 0)); c.fillStyle = g; c.fillRect(0, top, W, hz - top + 10);
  c.save(); c.beginPath(); c.arc(sx, sy, 46, 0, 7); c.clip(); c.drawImage(PAPER_IMG, 0, 0); c.fillStyle = rgba('#fff3da', .55); c.fillRect(sx - 60, sy - 60, 120, 120); c.restore();
  for (let k = 0; k < 7; k++) {   // clouds: clusters of soft blobs drifting left, lit warm underneath
    const span = W + 900, bx = ((hash(k * 3.1) * span - t * (9 + 5 * hash(k)) - pan * .4) % span + span) % span - 450, by = hz - 90 - hash(k * 5.7) * 330, s = .7 + hash(k * 2.3) * .9;
    for (let j = 0; j < 6; j++) blob(c, bx + (j - 2.5) * 62 * s + hash(k + j) * 30, by + hash(k * 9 + j) * 26 * s, (46 + hash(j * 7 + k) * 44) * s, j % 2 ? '#ffffff' : '#8fa2b4', j % 2 ? .3 : .17, 900 + k * 10 + j, 1.5, .62);
    blob(c, bx, by + 30 * s, 110 * s, C.skyLow, .16, 990 + k, 1.9, .3);
  }
}

// —— sea: perspective rows from the horizon; washes + drifting brush-stroke waves + foam + sun glitter ——
// o: { bottom, pan, drift (px/s at the nearest row), rows, sunX, glitter }
function drawSea(c, hz, t, o = {}) {
  const bottom = o.bottom ?? H + 60, R = o.rows ?? 17, pan = o.pan ?? 0, drift = o.drift ?? 90, sunX = (o.sunX ?? 1420) - pan * .25;
  const yOf = u => hz + (bottom - hz) * Math.pow(u, 1.55);
  // graded washes, far (pale, greyed) → near (deep, saturated)
  for (let i = 0; i < 6; i++) { const u = i / 6, col = u < .4 ? mixc(C.seaFar, C.seaMid, u / .4) : mixc(C.seaMid, C.seaDeep, (u - .4) / .6); band(c, yOf(u) - 2, bottom, col, i ? .5 : .85, 40 + i, 3 + u * 26, t * (1 + u * 3)); }
  band(c, yOf(.55), bottom, C.ultra, .2, 61, 30, t * 3);
  // swell shading: broad dark bands rolling toward the viewer
  for (let k = 0; k < 5; k++) { const u = ((k / 5 + t * .035) % 1), y = yOf(u), h = 6 + u * 60; band(c, y, y + h, C.ultra, .1 + .1 * u, 70 + k, 6 + u * 26, t * 4); }
  // wave strokes
  for (let r = 0; r < R; r++) {
    const u = (r + .6) / R, y = yOf(u), y2 = yOf(u + 1 / R), n = Math.round(lerp(26, 9, u)), L = lerp(34, 330, u), w = lerp(2.2, 19, u * u), sp = drift * lerp(.12, 1, u * u), span = W + 700;
    for (let i = 0; i < n; i++) {
      const id = r * 53 + i, ph = hash(id) * 6.283, life = .5 + .5 * Math.sin(t * (.55 + hash(id * 3) * .5) + ph);
      if (life < .12) continue;
      const x = ((hash(id * 1.7) * span - t * sp - pan * lerp(.3, 1.3, u)) % span + span) % span - 350;
      const yy = lerp(y, y2, hash(id * 2.9)) + Math.sin(t * 1.25 + ph) * lerp(.6, 9, u), len = L * (.55 + hash(id * 4.1) * .9);
      const bend = len * (.05 + .05 * Math.sin(t * .9 + ph * 2));
      const col = hash(id * 6.3) < .28 ? C.ultra : hash(id * 6.3) < .7 ? C.seaDeep : C.seaMid;
      withSeed(5000 + id, () => drawS(c, mk(qcurve(x, yy, x + len, yy + rnd(-2, 2) * u * 6, -bend, 9), w, col, { prof: 'leaf', a: lerp(.34, .78, u) * life, rough: .3 }), 1));
      if (hash(id * 8.7) < .34 && u > .12)   // foam: the paper showing on the crest
        withSeed(9000 + id, () => drawS(c, mk(qcurve(x + len * .15, yy - w * .7, x + len * .8, yy - w * .7, -bend * .8, 7), Math.max(1.4, w * .34), PAPER, { prof: 'leaf', a: .9 * life, nb: 0 }), 1));
    }
  }
  if (o.glitter !== false) {   // sun glitter: flecks of bare paper, re-seeded 12 times a second
    const f = Math.floor(t * 12);
    for (let i = 0; i < 90; i++) { const u = Math.pow(hash(i * 3.3 + f * 1.7), 1.6), y = yOf(u * .8) + 3, sp2 = 30 + u * 260, x = sunX + (hash(i * 7.7 + f) - .5) * sp2 * 2, ww = 6 + u * 46;
      c.fillStyle = rgba('#fff6e2', .5 + .4 * hash(i + f)); c.beginPath(); c.ellipse(x, y, ww, 1.2 + u * 3.4, 0, 0, 7); c.fill(); }
  }
  // horizon mist: paper breathing over the far water (atmospheric depth)
  const g = c.createLinearGradient(0, hz - 30, 0, hz + 70); g.addColorStop(0, rgba(PAPER, 0)); g.addColorStop(.45, rgba('#f3e6cf', .62)); g.addColorStop(1, rgba(PAPER, 0)); c.fillStyle = g; c.fillRect(0, hz - 30, W, 100);
}
// distant headland in the haze (a far layer for parallax)
function drawCoast(c, hz, pan) {
  const x0 = 120 - pan * .35; c.beginPath(); c.moveTo(x0 - 200, hz + 2);
  for (let i = 0; i <= 20; i++) c.lineTo(x0 - 200 + i * 34, hz - 4 - 34 * Math.sin(i / 20 * Math.PI) * (.6 + .5 * fbm(i * .6 + 3)));
  c.lineTo(x0 + 480, hz + 2); c.closePath(); c.fillStyle = rgba('#8fa3b3', .38); c.fill();
}
// gulls: two ink strokes flapping
function drawGull(c, x, y, s, t, ph) {
  const a = .5 * Math.sin(t * 8 + ph) + .15;
  for (const d of [-1, 1]) withSeed(77 + (d + 1), () => drawS(c, mk(qcurve(x, y, x + d * 22 * s, y - Math.sin(a) * 16 * s, d * 6 * s, 6), 3.2 * s, INK2, { prof: 'tip', nb: 0, a: .8 }), 1));
}
