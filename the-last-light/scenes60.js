// आखिरी रोशनी — the nine scenes. Each scene is fn(c, t, lt): t = film time, lt = time inside the scene.
// Builds on scene.js (sea, fog, coast, beams) and figure.js (the photographer). Pure functions of t.
const SC = { s1: [0, 6], s2: [6, 12], s3: [12, 18], s4: [18, 25], s5: [25, 32], s6: [32, 39], s7: [39, 46], s8: [46, 53], s9: [53, 60] };
const K = { flash1: 4.9, lamp5: 27.3, rise5: 28.6, sil5: 30.2, hand6: 33.6, open6: 34.8, msgPhoto: 49.2, msgText: 50.9, flood9: 54.6, turn9: 54.9, black: 56.9, title: 57.2, q: 57.9 };
const STONE = '#4a5463', STONE_D = '#2c3440', STONE_L = '#7d8a9b';
const rset = (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; };
const clampv = (x, a, b) => Math.max(a, Math.min(b, x));

// —— storm sky: heavy cloud masses rolling fast at two depths, distant sheet lightning (soft, not a horror flash) ——
function stormSky(c, t, hz, pan = 0, dark = 1) {
  c.fillStyle = N.skyTop; c.fillRect(-800, -800, W + 1600, hz + 900);
  for (let i = 0; i < 6; i++) { const u = i / 6; band(c, lerp(-500, hz, u), hz + 8, u < .5 ? mixc(N.skyTop, N.skyMid, u * 2) : mixc(N.skyMid, N.skyLow, (u - .5) * 2), .55, 30 + i, 22, t); }
  const lt = Math.max(0, Math.sin(t * 1.7) * Math.sin(t * .63 + 1)) ** 12 * .5;   // occasional glow inside the clouds
  for (const [n, y0, y1, sp, r, a, col] of [[9, -120, 260, 34, 330, .4, '#18263a'], [8, 40, 420, 62, 260, .45, '#0b1424'], [6, 200, 480, 95, 220, .3, '#22324a']]) {
    const span = W + 2400;
    for (let i = 0; i < n; i++) { const id = sp * 7 + i, x = ((hash(id * 3.3) * span + t * sp * (.8 + .4 * hash(id)) - pan * sp * .004) % span + span) % span - 1200, y = lerp(y0, y1, hash(id * 5.1)) + Math.sin(t * .4 + id) * 10;
      for (let j = 0; j < 4; j++) blob(c, x + (j - 1.5) * r * .7, y + hash(id + j) * 50, r * (.7 + .5 * hash(id * 2 + j)), col, a * dark, 1.6, .5);
      if (lt > .02) blob(c, x, y + 40, r * 1.2, '#8fa6c4', lt * .35 * hash(id), 1.6, .5, 'screen'); }
  }
}
// —— the abandoned tower, close: tapered stone, peeling bands, cracks, rust streaks, boarded door, upper window, gallery, lantern ——
// returns lantern centre and window rect (screen units of the current transform)
function tower(c, cx, baseY, h, t, o = {}) {
  const wb = h * .2, wt = h * .12, topY = baseY - h, X = (u, side) => cx + side * lerp(wb, wt, u) / 2, Y = u => lerp(baseY, topY, u);
  const body = [[X(0, -1), Y(0)], [X(1, -1), Y(1)], [X(1, 1), Y(1)], [X(0, 1), Y(0)]];
  solid(c, body, STONE); wash(c, [[X(0, -1), Y(0)], [X(1, -1), Y(1)], [cx - wt * .1, Y(1)], [cx - wb * .12, Y(0)]], STONE_D, .9, 701, 3);   // shadow side
  for (const [u0, u1] of [[.18, .27], [.52, .61]]) { solid(c, [[X(u0, -1), Y(u0)], [X(u1, -1), Y(u1)], [X(u1, 1), Y(u1)], [X(u0, 1), Y(u0)]], '#1a212b');   // dark bands, peeling to stone in patches
    withSeed(702 + u0 * 100, () => { for (let k = 0; k < 7; k++) { const u = lerp(u0, u1, rnd()), x = lerp(X(u, -1), X(u, 1), rnd(.15, .9)); blob(c, x, Y(u), h * rnd(.012, .03), STONE, .8, 1.4, .7, null); } }); }
  withSeed(710, () => {   // rust streaks, cracks, stains
    for (let k = 0; k < 16; k++) { const u = rnd(.05, .95), x = lerp(X(u, -1), X(u, 1), rnd(.1, .9)), L = h * rnd(.04, .16); drawS(c, mk(qcurve(x, Y(u), x + rnd(-4, 4), Y(u) + L, rnd(-5, 5), 6), rnd(2, 6), k % 3 ? '#5a3a2a' : '#1b222c', { prof: 'tip', nb: 0, a: rnd(.25, .5) }), 1); }
    for (let k = 0; k < 6; k++) { let x = lerp(X(.4, -1), X(.4, 1), rnd(.2, .8)), y = Y(rnd(.1, .9)); const p = [[x, y]]; for (let s = 0; s < 6; s++) { x += rnd(-12, 12); y += rnd(8, 26); p.push([x, y]); } drawS(c, mk(p, 1.6, '#0d1218', { prof: 'even', nb: 0, a: .7 }), 1); }
  });
  withSeed(715, () => drawS(c, mk([[X(0, 1) - 4, Y(0)], [X(1, 1) - 3, Y(1)]], 4, STONE_L, { prof: 'even', nb: 0, a: .45 }), 1));   // moonlit edge
  // boarded, arched door at the base
  const dw = wb * .3, dh = h * .12; solid(c, [[cx - dw / 2, baseY], [cx - dw / 2, baseY - dh * .75], [cx, baseY - dh], [cx + dw / 2, baseY - dh * .75], [cx + dw / 2, baseY]], '#0c0f14');
  withSeed(716, () => { for (let k = 0; k < 3; k++) { const y = baseY - dh * (.25 + k * .22); drawS(c, mk([[cx - dw * .62, y + rnd(-5, 5)], [cx + dw * .62, y + rnd(-8, 8)]], dh * .06, '#5a4636', { prof: 'even', nb: 2, a: .9 }), 1); } });
  // small windows up the tower; the upper one (u=.74) is "the window"
  const win = { x: cx - wt * .14, y: Y(.76), w: wt * .28, h: h * .055 };
  for (const u of [.36, .76]) { const wy = Y(u), ww = lerp(wb, wt, u) * .28, wh = h * .055; solid(c, [[cx - ww / 2, wy + wh], [cx - ww / 2, wy + wh * .25], [cx, wy], [cx + ww / 2, wy + wh * .25], [cx + ww / 2, wy + wh]], '#070a0e'); }
  if (o.winLight > 0) { const wl = o.winLight; solid(c, [[win.x, win.y + win.h], [win.x, win.y + win.h * .25], [cx, win.y], [win.x + win.w, win.y + win.h * .25], [win.x + win.w, win.y + win.h]], mixc('#070a0e', '#f2b45a', Math.min(1, wl)));
    blob(c, cx, win.y + win.h / 2, win.w * 2.4, N.gold, .35 * wl, 1, 1.2, 'screen'); }
  if (o.sil > 0) {   // a figure standing in the window, black against the lamp-light, swaying very slightly
    c.save(); c.globalAlpha = o.sil; const sx = cx + Math.sin(t * .8) * win.w * .03, sb = win.y + win.h;
    solid(c, [[sx - win.w * .36, sb], [sx - win.w * .34, sb - win.h * .42], [sx - win.w * .14, sb - win.h * .55], [sx + win.w * .14, sb - win.h * .55], [sx + win.w * .34, sb - win.h * .42], [sx + win.w * .36, sb]], '#05070a');
    c.fillStyle = '#05070a'; c.beginPath(); c.ellipse(sx, sb - win.h * .7, win.w * .13, win.h * .15, 0, 0, 7); c.fill(); c.restore();
  }
  // gallery + rusted rail (one section hanging broken), lantern with broken panes, dome
  const gy = Y(1), gw = wt * 1.5;
  solid(c, [[cx - gw / 2, gy], [cx + gw / 2, gy], [cx + gw / 2 - 8, gy - h * .02], [cx - gw / 2 + 8, gy - h * .02]], '#11161d');
  withSeed(720, () => { for (let i = 0; i <= 8; i++) { const x = cx - gw / 2 + i * gw / 8, droop = i === 6 || i === 7 ? h * .02 : 0; drawS(c, mk([[x, gy - h * .02], [x + (droop ? 6 : 0), gy - h * .065 + droop]], 3, '#3a2a22', { prof: 'even', nb: 0, a: .9 }), 1); }
    drawS(c, mk([[cx - gw / 2, gy - h * .065], [cx + gw * .2, gy - h * .065], [cx + gw * .38, gy - h * .04]], 3.5, '#4a3226', { prof: 'even', nb: 0, a: .9 }), 1); });
  const ly0 = gy - h * .02, ly1 = ly0 - h * .1, lw = wt * .78, on = o.lamp ?? 0;
  solid(c, [[cx - lw / 2, ly0], [cx - lw / 2, ly1], [cx + lw / 2, ly1], [cx + lw / 2, ly0]], mixc('#121b27', N.hot, on));
  if (on <= 0) withSeed(722, () => { for (let k = 0; k < 4; k++) { const x = cx - lw / 2 + rnd(.1, .9) * lw, y = lerp(ly1, ly0, rnd(.2, .8)); drawS(c, mk([[x, y], [x + rnd(-14, 14), y + rnd(8, 22)]], 1.4, '#6a7a8c', { prof: 'even', nb: 0, a: .5 }), 1); } });   // cracked glass glints
  for (let i = 0; i <= 4; i++) { c.fillStyle = '#05080c'; c.fillRect(cx - lw / 2 + i * lw / 4 - 3, ly1, 6, ly0 - ly1); }
  solid(c, [[cx - lw * .62, ly1], [cx + lw * .62, ly1], [cx + lw * .12, ly1 - h * .055], [cx - lw * .12, ly1 - h * .055]], '#080c12');
  if (on > 0) blob(c, cx, (ly0 + ly1) / 2, lw * 1.6, N.hot, .9 * on, 1, 1, 'screen');
  return { lamp: [cx, (ly0 + ly1) / 2], win };
}
function grassTufts(c, t, y, x0, x1, n, seed, s = 1, col = '#1a2534', wind = 1) {
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, hash(seed + i * 1.7)), h = (30 + 60 * hash(seed + i * 3.1)) * s, sw = (Math.sin(t * 2.2 + i * .7) * .5 + .7) * 18 * s * wind;
    for (let k = 0; k < 3; k++) withSeed(seed * 10 + i * 3 + k, () => drawS(c, mk(qcurve(x + k * 6 * s, y, x + k * 6 * s + sw + rnd(-6, 6) * s, y - h * rnd(.6, 1), rnd(-6, 6) * s, 6), 5 * s, col, { prof: 'tip', nb: 0, a: .85 }), 1)); }
}
function gull(c, x, y, s, t, ph) { const a = .5 * Math.sin(t * 7 + ph) + .1; for (const d of [-1, 1]) withSeed(77 + d, () => drawS(c, mk(qcurve(x, y, x + d * 22 * s, y - Math.sin(a) * 16 * s, d * 6 * s, 6), 3 * s, '#c9d3df', { prof: 'tip', nb: 0, a: .6 }), 1)); }
function subtitleBand(c) { const g = c.createLinearGradient(0, H - 210, 0, H); g.addColorStop(0, 'rgba(2,4,8,0)'); g.addColorStop(1, 'rgba(2,4,8,.55)'); c.fillStyle = g; c.fillRect(0, H - 210, W, 210); }

// ============================================================ S1 — storm, sea, the distant lighthouse; its light flashes
function scene1(c, t, lt) {
  LAMP.x = 1262; LAMP.y = 266;
  LAMPF = { t0: K.flash1, on: t => t < K.flash1 ? 0 : t < K.flash1 + .12 ? 1 : t < K.flash1 + .2 ? .2 : t < K.flash1 + 1.0 ? 1 - .15 * seg(t, K.flash1 + .5, K.flash1 + 1) : Math.max(0, 1 - (t - K.flash1 - 1.0) / .5) };
  const Z = lerp(.84, .97, ss(lt / 6)), B = beams(t);
  rset(c); const camP = (k) => { const s = 1 + (Z - 1) * k; c.setTransform(s, 0, 0, s, FOCUS[0] * (1 - s) + (1 - k) * lt * -12, FOCUS[1] * (1 - s)); };
  camP(.35); stormSky(c, t, HZ, 0);
  camP(.72); drawFog(c, t, FOG[0], B);
  camP(.85); drawFarCliff(c);
  camP(1); drawSea(c, t, B); drawHeadland(c, t); drawSurf(c, t); drawLighthouse(c, t); for (const b of B) drawBeam(c, b); drawFog(c, t, FOG[1], B);
  camP(1.12); drawFog(c, t, FOG[2], B); camP(1.5); drawFog(c, t, FOG[3], B);
  rset(c); const on = lampOn(t); if (on > 0) { blob(c, (LAMP.x - FOCUS[0]) * Z + FOCUS[0], (LAMP.y - FOCUS[1]) * Z + FOCUS[1], 260, N.hot, .4 * on, 1, 1, 'screen'); c.fillStyle = rgba(N.gold, .05 * on); c.fillRect(0, 0, W, H); }
}
// ============================================================ S2 — the abandoned tower, tilt from the boarded door to the dead lantern
function scene2(c, t, lt) {
  rset(c); const u = eio(seg(lt, .4, 5.8)), ty = lerp(-60, 1180, u), Z = lerp(1.05, 1.0, u);
  stormSky(c, t, 700, 0, 1.1);   // fixed sky (very far) while the tower slides down the frame
  c.setTransform(Z, 0, 0, Z, W / 2 * (1 - Z), H / 2 * (1 - Z) + ty);
  drawSeaBand(c, t, 880);
  const T = tower(c, 960, 1060, 1900, t, { lamp: 0 });
  // rocks + grass at the foot, blowing
  solid(c, [[300, 1060], [700, 1030], [960, 1050], [1300, 1020], [1700, 1060], [1700, 1300], [300, 1300]], '#0a0f16');
  grassTufts(c, t, 1062, 380, 1600, 26, 31, 1.3, '#1d2a3a');
  for (let i = 0; i < 4; i++) { const a = t * (.4 + .07 * i) + i * 1.6; gull(c, 960 + Math.cos(a) * (260 + 60 * i), -720 + Math.sin(a) * 90, 1.2, t, i); }
  rset(c); c.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 6; i++) { const x = ((i * 520 + t * 70) % 2600 + 2600) % 2600 - 340, y = 300 + 520 * hash(i * 2.3) - u * 200; blob(c, x, y, 380, N.fog, .14, 2, .45); }
}
function drawSeaBand(c, t, y) {   // a strip of sea behind a close subject
  solid(c, [[-900, y], [W + 900, y], [W + 900, y + 400], [-900, y + 400]], N.seaMid);
  for (let i = 0; i < 40; i++) { const x = ((hash(i * 1.3) * 3600 + t * 40) % 3600) - 900, yy = y + 10 + hash(i * 3.7) * 160; withSeed(800 + i, () => drawS(c, mk(qcurve(x, yy, x + 120 + hash(i) * 120, yy, -10, 8), 6, N.crest, { prof: 'leaf', a: .35 * (.5 + .5 * Math.sin(t * .9 + i)) }), 1)); }
}
// ============================================================ S3 — the village and its legend; villagers look toward the lighthouse
function scene3(c, t, lt) {
  rset(c); const pan = eio(lt / 6) * 560;
  const L = (k) => c.setTransform(1, 0, 0, 1, -pan * k, 0);
  L(.15); stormSky(c, t, 560, pan, .8);
  L(.3); solid(c, [[0, 560], [3000, 560], [3000, 1200], [0, 1200]], N.seaFar);
  for (let i = 0; i < 26; i++) { const x = ((hash(i * 3.1) * 3000 + t * 18) % 3000), y = 575 + hash(i * 7.7) * 90; withSeed(820 + i, () => drawS(c, mk(qcurve(x, y, x + 80, y, -6, 6), 4, N.crest, { prof: 'leaf', a: .28 * (.5 + .5 * Math.sin(t + i)) }), 1)); }
  // the far headland with the dark lighthouse (right, revealed by the pan)
  solid(c, [[1900, 575], [2150, 520], [2400, 470], [2700, 450], [2900, 480], [2900, 600], [1900, 600]], '#0c1522');
  solid(c, [[2408, 474], [2416, 380], [2440, 380], [2448, 474]], '#3a4554'); solid(c, [[2410, 380], [2446, 380], [2434, 362], [2422, 362]], '#121a24');
  L(.55);   // the village on the slope
  solid(c, [[-100, 700], [400, 610], [900, 590], [1400, 640], [1900, 700], [1900, 1200], [-100, 1200]], '#0e1724');
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 180 + hash(i) * 60, y = 640 - Math.sin(i / 8 * Math.PI) * 50 + hash(i * 2) * 30, w = 110 + hash(i * 3) * 60, h = 70 + hash(i * 5) * 40;
    solid(c, [[x, y + h], [x, y], [x + w / 2, y - h * .55], [x + w, y], [x + w, y + h]], i % 2 ? '#1a2432' : '#141d29');
    solid(c, [[x - 6, y + 2], [x + w / 2, y - h * .6], [x + w + 6, y + 2], [x + w + 6, y - 6], [x + w / 2, y - h * .68], [x - 6, y - 6]], '#0a1018');
    for (let k = 0; k < 2; k++) { const on = hash(i * 7 + k) > .3 ? .75 + .25 * Math.sin(t * (2 + hash(i + k)) + i) : 0; if (on) { const wx = x + w * (.2 + .45 * k), wy = y + h * .35; c.fillStyle = rgba(N.gold, .85 * on); c.fillRect(wx, wy, 18, 20); blob(c, wx + 9, wy + 10, 50, N.gold, .25 * on, 1, 1, 'screen'); } }
    if (i % 3 === 0) for (let k = 0; k < 8; k++) { const a = ((t * .6 + k / 8) % 1); blob(c, x + w * .75 + a * 120 + Math.sin(a * 6 + i) * 10, y - h * .7 - a * 200, 20 + a * 60, '#4a5668', .3 * (1 - a), 1.3, .9); }   // chimney smoke drifting
  }
  // harbour: boats bobbing on the black water
  for (let i = 0; i < 4; i++) { const x = 1250 + i * 170, y = 740 + Math.sin(t * 1.3 + i) * 5, r = Math.sin(t * 1.1 + i * 2) * .06;
    c.save(); c.translate(x, y); c.rotate(r); solid(c, [[-60, 0], [60, 0], [44, 22], [-44, 22]], '#0a0e14'); withSeed(840 + i, () => drawS(c, mk([[0, 0], [2, -110]], 3, '#2a3240', { prof: 'even', nb: 0, a: .9 }), 1)); c.restore(); }
  L(1);   // villagers on the path in the foreground, looking right toward the lighthouse; one lantern
  solid(c, [[-200, 900], [800, 880], [1600, 900], [2600, 880], [2600, 1200], [-200, 1200]], '#070b11');
  const vill = [[740, 1.0, 0], [860, .9, 1], [980, 1.05, 2], [1110, .75, 3]];
  for (const [x, s, k] of vill) {
    const y = 896, br = Math.sin(t * 1.4 + k) * 2;
    c.save(); c.translate(x, y); c.scale(s, s);
    solid(c, [[-28, 0], [-34, -150 + br], [-20, -210 + br], [20, -210 + br], [34, -150 + br], [28, 0]], '#05080c');   // shawled figure
    c.fillStyle = '#05080c'; c.beginPath(); c.ellipse(4, -236 + br, 20, 25, 0, 0, 7); c.fill();
    if (k === 2) { withSeed(860, () => drawS(c, mk([[22, -190], [82, -230 - 6 * Math.sin(t * 1.2)]], 9, '#05080c', { prof: 'tip', nb: 0, a: 1 }), 1)); }   // pointing
    if (k === 0) { const sw = Math.sin(t * 2) * 4; withSeed(861, () => drawS(c, mk([[26, -150], [30 + sw, -100]], 2, '#05080c', { prof: 'even', nb: 0, a: 1 }), 1)); c.fillStyle = rgba(N.hot, .95); c.fillRect(22 + sw, -100, 16, 22); blob(c, 30 + sw, -88, 120, N.gold, .45, 1, 1, 'screen'); }
    c.restore();
  }
  rset(c); for (let i = 0; i < 5; i++) { const x = ((i * 560 - t * 60) % 2800 + 2800) % 2800 - 400; blob(c, x, 760 + 120 * hash(i), 360, N.fog, .14, 2.2, .4); }
}
// ============================================================ S4 — the photographer walks the fog path; camera tracks with him
const WALK = { speed: 120, stride: 150 };
function scene4(c, t, lt) {
  rset(c); const dist = lt * WALK.speed, ph = dist / WALK.stride * Math.PI, pan = dist;
  const L = (k) => c.setTransform(1, 0, 0, 1, -pan * k, 0);
  L(.06); stormSky(c, t, 620, pan, .9);
  L(.12); solid(c, [[-200, 620], [2600, 620], [2600, 1100], [-200, 1100]], N.seaFar);
  solid(c, [[1300, 625], [1500, 560], [1700, 520], [2000, 505], [2300, 540], [2300, 640], [1300, 640]], '#0d1521');
  solid(c, [[1712, 524], [1720, 410], [1746, 410], [1754, 524]], '#323c4a'); solid(c, [[1714, 410], [1752, 410], [1740, 390], [1726, 390]], '#121a24');   // the lighthouse ahead, dark
  for (let i = 0; i < 30; i++) { const x = ((hash(i * 3.1) * 2800 + t * 24) % 2800) - 200, y = 640 + hash(i * 7.7) * 120; withSeed(870 + i, () => drawS(c, mk(qcurve(x, y, x + 90, y, -5, 6), 4, N.crest, { prof: 'leaf', a: .25 * (.5 + .5 * Math.sin(t * 1.1 + i)) }), 1)); }
  L(.4); for (let i = 0; i < 8; i++) { const x = i * 420 + 100; solid(c, [[x, 800], [x + 160, 720 - hash(i) * 60], [x + 340, 780], [x + 400, 820]], '#0f1824'); }   // rolling cliff tops
  L(.75); blob(c, 0, 0, 1, '#000', 0); for (let i = 0; i < 6; i++) { const x = ((i * 700 - pan * .0) % 4200); blob(c, x + 300, 790, 500, N.fog, .2, 2.2, .35); }
  L(1);   // the path he walks on
  solid(c, [[-300, 872], [4000, 860], [4000, 1200], [-300, 1200]], '#0a1018');
  withSeed(880, () => { for (let k = 0; k < 40; k++) { const x = -200 + k * 110 + rnd(-30, 30); drawS(c, mk(qcurve(x, 880 + rnd(0, 30), x + rnd(60, 140), 884 + rnd(0, 30), rnd(-4, 4), 6), rnd(3, 7), '#1e2a3a', { prof: 'leaf', a: .5 }), 1); } });
  grassTufts(c, t, 872, -200, 4000, 60, 41, 1, '#16202d', 1.2);
  // the photographer (screen x stays ~ 760: the camera tracks him)
  photographer(c, 760 + dist, 884, 1.05, { view: 'side', phase: ph, walk: 1, wind: .7, t });
  L(1.6);   // fence posts and grass close to the lens slide past faster
  for (let i = 0; i < 9; i++) { const x = i * 520 + 200; solid(c, [[x, 1100], [x + 6, 860], [x + 34, 856], [x + 40, 1100]], '#05080c'); withSeed(890 + i, () => drawS(c, mk(qcurve(x + 20, 900, x + 540, 910, -30, 10), 3, '#05080c', { prof: 'even', nb: 0, a: .9 }), 1)); }
  grassTufts(c, t, 1095, -200, 6000, 40, 47, 2.2, '#04070b', 1.4);
  rset(c); for (let i = 0; i < 6; i++) { const x = ((i * 520 - t * 140) % 3100 + 3100) % 3100 - 500; blob(c, x, 650 + 380 * hash(i * 1.9), 420, N.fog, .2, 2, .4); }
}
// ============================================================ S5 — the lamp wakes; a figure stands in the upper window
function scene5(c, t, lt) {
  LAMPF = { t0: K.lamp5, on: t => t < K.lamp5 ? 0 : t < K.lamp5 + .6 ? (hash(Math.floor(t * 16)) > .45 ? .3 + .7 * seg(t, K.lamp5, K.lamp5 + .6) : .1) : 1 };
  rset(c); const up = eio(seg(t, K.rise5, K.sil5 + 1.2)), on = lampOn(t), fx = 1150, wyC = 1040 - 1800 * .76 + 50;
  // wide: the whole tower; then a push in that ends on the upper window (window centre glides to frame centre)
  const Z = lerp(.48, 1.85, up) * (1 + .02 * lt), sx = lerp(.48 * fx + 598, 960, up), sy = lerp(.48 * wyC + 551, 470, up);
  stormSky(c, t, 900, 0, 1);
  c.setTransform(Z, 0, 0, Z, sx - Z * fx, sy - Z * wyC);
  drawSeaBand(c, t, 950);
  const TW = tower(c, fx, 1040, 1800, t, { lamp: on, winLight: on * .9, sil: ss(seg(t, K.sil5, K.sil5 + .7)) });
  LAMP.x = TW.lamp[0]; LAMP.y = TW.lamp[1];
  const B = beams(t); for (const b of B) drawBeam(c, { ...b, len: b.len * 2.4 });
  solid(c, [[-1400, 1040], [800, 1010], [1600, 1040], [3600, 1010], [3600, 2200], [-1400, 2200]], '#070b11');
  grassTufts(c, t, 1040, -1300, 3500, 60, 51, 1.6, '#121b27', 1.1);
  rset(c); if (on > 0) { const lx = Z * TW.lamp[0] + sx - Z * fx, ly = Z * TW.lamp[1] + sy - Z * wyC; blob(c, lx, ly, 300 * Z, N.hot, .35 * on, 1, 1, 'screen'); c.fillStyle = rgba(N.gold, .05 * on); c.fillRect(0, 0, W, H); }
  for (let i = 0; i < 5; i++) { const x = ((i * 600 + t * 80) % 3000 + 3000) % 3000 - 400; blob(c, x, 760 + 220 * hash(i) + up * 300, 420, N.fog, .16, 2, .4); }
  // the photographer in the foreground, from behind, looking up; he drops out of frame as the camera rises
  photographer(c, 470, 1130 + up * 1100, 1.15, { view: 'back', t, wind: .6, look: .3 + up * .9, rim: on * .9 });
}
// ============================================================ S6 — the old door: his hand, the push, the dark inside
function scene6(c, t, lt) {
  rset(c); const op = eio(seg(t, K.open6, K.open6 + 1.8)), Z = lerp(1.0, 1.08, ss(lt / 4)) * lerp(1, 2.6, ei(seg(lt, 4.2, 7)));
  c.setTransform(Z, 0, 0, Z, (1 - Z) * 960, (1 - Z) * 560);
  // stone wall, curved slightly (the tower base), weathered
  c.fillStyle = STONE_D; c.fillRect(-200, -200, W + 400, H + 400);
  withSeed(900, () => { for (let r = 0; r < 12; r++) for (let k = 0; k < 9; k++) { const x = -160 + k * 260 + (r % 2) * 130, y = -160 + r * 115; solid(c, [[x + 4, y + 4], [x + 252, y + 4 + rnd(-3, 3)], [x + 252, y + 108], [x + 4, y + 108]], mixc(STONE, STONE_D, rnd(.2, .7))); } });
  withSeed(905, () => { for (let k = 0; k < 24; k++) { const x = rnd(0, W), y = rnd(0, H); drawS(c, mk(qcurve(x, y, x + rnd(-6, 6), y + rnd(60, 220), rnd(-6, 6), 6), rnd(3, 9), k % 2 ? '#3a2a22' : '#141a22', { prof: 'tip', nb: 0, a: rnd(.2, .45) }), 1); } });
  // doorway: dark interior with drifting dust catching a faint light from above
  const dx0 = 700, dx1 = 1220, dy0 = 190, dy1 = 1000;
  solid(c, [[dx0, dy1], [dx0, dy0 + 120], [(dx0 + dx1) / 2, dy0], [dx1, dy0 + 120], [dx1, dy1]], '#030508');
  for (let i = 0; i < 40; i++) { const x = dx0 + 40 + hash(i * 3.1) * (dx1 - dx0 - 80), y = dy0 + 140 + ((hash(i * 7.3) * 800 - t * 12 * (.4 + hash(i))) % 800 + 800) % 800, a = op * (.25 + .5 * hash(i * 9)); c.fillStyle = rgba('#c9d3df', a); c.beginPath(); c.arc(x + Math.sin(t + i) * 8, y, 1.6, 0, 7); c.fill(); }
  blob(c, (dx0 + dx1) / 2 + 60, dy0 + 240, 260, '#3c5068', .4 * op, .7, 1.6, 'screen');
  // the door: planks, iron straps, rusted hinges on the left; it swings inward (foreshortens toward the hinge)
  const dw = (dx1 - dx0) * Math.cos(op * 1.25), shake = op > 0 && op < .15 ? Math.sin(t * 60) * 3 : 0;
  c.save(); c.translate(dx0 + shake, 0);
  const dp = [[0, dy1], [0, dy0 + 120], [dw / 2, dy0 + 6 * op], [dw, dy0 + 120 - 40 * op], [dw, dy1 + 30 * op]];
  solid(c, dp, '#3d2e24'); wash(c, dp, '#241a14', .7, 910, 3);
  for (let k = 1; k < 6; k++) withSeed(911 + k, () => drawS(c, mk([[dw * k / 6, dy0 + 60], [dw * k / 6 + rnd(-3, 3), dy1]], 2.5, '#140e0a', { prof: 'even', nb: 0, a: .8 }), 1));
  for (const y of [dy0 + 230, dy1 - 220]) { solid(c, [[0, y], [dw, y - 10 * op], [dw, y + 26 - 10 * op], [0, y + 26]], '#1c1a1a'); withSeed(920 + y, () => drawS(c, mk([[4, y + 26], [dw * .6, y + 34]], 6, '#6a3a22', { prof: 'tip', nb: 2, a: .5 }), 1)); }
  c.fillStyle = '#2a2624'; c.beginPath(); c.arc(dw * .86, (dy0 + dy1) / 2 + 20, 18, 0, 7); c.fill();   // iron ring handle
  c.restore();
  for (const y of [dy0 + 220, dy1 - 230]) { solid(c, [[dx0 - 30, y], [dx0 + 20, y], [dx0 + 20, y + 46], [dx0 - 30, y + 46]], '#1a1412'); withSeed(930 + y, () => drawS(c, mk([[dx0 - 20, y + 46], [dx0 - 24, y + 160]], 5, '#7a4428', { prof: 'tip', nb: 2, a: .5 }), 1)); }   // hinges + rust run
  // weeds and dead leaves at the threshold, stirred by the wind
  grassTufts(c, t, dy1 + 10, 520, 1400, 18, 61, 1.4, '#16202c', 1.3);
  for (let i = 0; i < 6; i++) { const a = ((t * .4 + i / 6) % 1), x = 600 + a * 700 + Math.sin(a * 9 + i) * 30, y = dy1 - 10 - Math.abs(Math.sin(a * 12 + i)) * 40; c.save(); c.translate(x, y); c.rotate(a * 9 + i); solid(c, [[-9, 0], [0, -5], [9, 0], [0, 5]], '#4a3424'); c.restore(); }
  // his hand and sleeve reaching in from the right, pushing on the door
  const hr = eio(seg(t, K.hand6, K.open6)), hx = lerp(1700, dx0 + dw * .82 + 40, hr), hy = 640;
  if (hr > 0) { solid(c, [[W + 300, hy + 60], [hx + 70, hy + 34], [hx + 64, hy - 34], [W + 300, hy - 60]], FIG.coat); wash(c, [[W + 300, hy + 60], [hx + 70, hy + 34], [hx + 66, hy + 10], [W + 300, hy + 10]], FIG.coatSh, .8, 940, 2);
    c.fillStyle = FIG.skin; c.beginPath(); c.ellipse(hx + 36, hy, 40, 30, 0, 0, 7); c.fill(); for (let f = 0; f < 4; f++) { solid(c, quadP(hx + 10, hy - 18 + f * 12, hx - 30, hy - 22 + f * 13, 6, 5), FIG.skin); }
    blob(c, hx + 30, hy, 70, '#3c5068', .25, 1, 1, 'screen'); }
  rset(c); const fade = seg(lt, 6.0, 7.0); if (fade > 0) { c.fillStyle = rgba('#020306', fade * .9); c.fillRect(0, 0, W, H); }
}
// ============================================================ S7 — inside: empty; curtains, dust, the beam passing the windows
function scene7(c, t, lt) {
  rset(c); const pan = eio(lt / 7) * 220;
  c.setTransform(1, 0, 0, 1, -pan, 0);
  c.fillStyle = '#0a0f17'; c.fillRect(-200, -200, W + 800, H + 400);
  // curved stone wall bands (round room), floor
  for (let i = 0; i < 9; i++) { const y = i * 110; band(c, y, y + 112, i % 2 ? '#141c27' : '#111823', .9, 300 + i, 6, 0); }
  solid(c, [[-300, 800], [2600, 800], [2600, 1300], [-300, 1300]], '#0c1119');
  withSeed(950, () => { for (let k = 0; k < 18; k++) { const y = rnd(820, 1080); drawS(c, mk([[-200, y], [2500, y + rnd(-10, 10)]], rnd(1, 3), '#18202c', { prof: 'even', nb: 0, a: .6 }), 1); } });   // floorboards
  // two tall windows; the lamp above sweeps past them every 5.2 s: shafts swing across the floor
  const wins = [[620, 230], [1480, 230]], sweep = (k) => Math.pow(Math.max(0, Math.cos((t - 39.2) * Math.PI * 2 / 5.2 - k * 1.2)), 6);
  for (const [k, [wx, wy]] of wins.entries()) {
    solid(c, [[wx - 90, wy + 360], [wx - 90, wy + 60], [wx, wy], [wx + 90, wy + 60], [wx + 90, wy + 360]], mixc('#1e2c40', '#d8b878', sweep(k) * .8));
    c.fillStyle = '#070b11'; c.fillRect(wx - 3, wy, 6, 360); c.fillRect(wx - 90, wy + 190, 180, 6);
    const sh = .25 + .75 * sweep(k), skew = Math.sin((t - 39.2) * Math.PI * 2 / 5.2 - k * 1.2) * 220;
    c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(10px)';
    const g = c.createLinearGradient(0, wy, 0, 1000); g.addColorStop(0, rgba(sweep(k) > .1 ? N.gold : '#6a84a6', .32 * sh)); g.addColorStop(1, rgba('#6a84a6', 0)); c.fillStyle = g;
    c.beginPath(); c.moveTo(wx - 90, wy + 60); c.lineTo(wx + 90, wy + 60); c.lineTo(wx + 260 + skew, 1000); c.lineTo(wx - 60 + skew, 1000); c.closePath(); c.fill(); c.restore();
    // torn curtain strips, blowing in
    for (let s = 0; s < 4; s++) { const p = []; for (let i = 0; i <= 9; i++) { const v = i / 9; p.push([wx - 100 + s * 12 + Math.sin(t * 2.6 - v * 3 + s + k) * 30 * v + 50 * v * (.6 + .4 * Math.sin(t * .9 + s)), wy + 30 + v * 380]); }
      withSeed(960 + k * 10 + s, () => drawS(c, mk(p, 22 - s * 3, '#8a96a6', { prof: 'tip', nb: 2, a: .32 + .25 * sweep(k) }), 1)); }
  }
  // old chair on its side, a small table, the spiral stair going up on the right
  c.save(); c.translate(1080, 880); c.rotate(-1.3); solid(c, [[-50, 0], [50, 0], [50, -12], [-50, -12]], '#2a1e16'); solid(c, [[-50, -12], [-44, -120], [-34, -120], [-40, -12]], '#2a1e16'); c.restore();
  solid(c, [[300, 860], [440, 860], [440, 872], [300, 872]], '#2a1e16'); for (const x of [312, 428]) solid(c, [[x - 4, 872], [x + 4, 872], [x + 4, 960], [x - 4, 960]], '#2a1e16');
  for (let i = 0; i < 12; i++) { const y = 900 - i * 70, x = 1950 + Math.sin(i * .9) * 120; solid(c, [[x - 90, y], [x + 90, y - 10], [x + 90, y + 6], [x - 90, y + 16]], '#1c1612'); }
  withSeed(970, () => drawS(c, mk([[1900, 980], [1880, -100]], 10, '#0a0d12', { prof: 'even', nb: 0, a: 1 }), 1));
  // dust: drifts slowly, bright only inside the shafts
  for (let i = 0; i < 160; i++) { const x = hash(i * 3.1) * 2200, y = ((hash(i * 7.3) * 900 - t * 10 * (.3 + hash(i))) % 900 + 900) % 900 + 120 + Math.sin(t * .7 + i) * 10;
    let lit = .12; for (const [k, [wx]] of wins.entries()) { const skew = Math.sin((t - 39.2) * Math.PI * 2 / 5.2 - k * 1.2) * 220 * ((y - 230) / 770); if (Math.abs(x - (wx + 100 + skew)) < 150) lit += .7 * (.25 + .75 * sweep(k)); }
    c.fillStyle = rgba(lit > .3 ? '#f2dcb0' : '#9aaabd', Math.min(.9, lit)); c.beginPath(); c.arc(x, y, 1 + hash(i * 5) * 1.6, 0, 7); c.fill(); }
  // the photographer steps in from the left, stops, looks around (turns back once)
  const walkT = clampv((lt - .4) / 2.4, 0, 1), x = lerp(-60, 300, eo(walkT)), ph = lerp(0, 2.4 * Math.PI * 1.2, eo(walkT)), back = lt > 4.3 && lt < 5.8;
  photographer(c, x + pan * .0, 980, 1.25, { view: 'side', phase: ph, walk: walkT < 1 ? 1 - walkT * .6 : 0, wind: .15, t, flip: back, look: lt > 3.2 && lt < 4.3 ? .25 : 0 });
  rset(c); const vg = c.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1100); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(1,2,4,.7)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
}
// ============================================================ S8 — the camera: the photo, then the message
function scene8(c, t, lt) {
  rset(c); const Z = lerp(1, 1.22, eio(lt / 7)), jit = Math.sin(t * 1.3) * 4;
  c.setTransform(Z, 0, 0, Z, (1 - Z) * 960 + jit, (1 - Z) * 470);
  c.fillStyle = '#05080d'; c.fillRect(-300, -300, W + 600, H + 600);
  blob(c, 960, 430, 900, '#16212f', .6, 1.4, .8);   // dim room behind, out of focus
  for (let i = 0; i < 40; i++) { const x = hash(i * 3.1) * W, y = ((hash(i * 7.3) * H - t * 12) % H + H) % H; blob(c, x, y, 6 + hash(i) * 10, '#9aaabd', .2, 1, 1); }
  // camera body held in two hands
  solid(c, [[520, 300], [1400, 300], [1420, 320], [1420, 820], [1400, 840], [520, 840], [500, 820], [500, 320]], '#14171c');
  wash(c, [[520, 300], [1400, 300], [1420, 320], [1420, 360], [500, 360], [500, 320]], '#2a2f38', .8, 980, 2);
  c.fillStyle = '#0a0c10'; c.fillRect(1220, 250, 120, 50); c.fillStyle = '#3a3f48'; c.beginPath(); c.arc(1280, 258, 18, 0, 7); c.fill();   // shutter dial
  // screen: the photo of the tower window appears; then a message types itself over it
  const sx = 600, sy = 380, sw = 680, sh = 400, ph = seg(t, K.msgPhoto, K.msgPhoto + .5), flick = .9 + .1 * Math.sin(t * 40) * Math.sin(t * 3.1);
  c.fillStyle = '#0c1118'; c.fillRect(sx, sy, sw, sh);
  if (ph > 0) {
    c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip(); c.globalAlpha = ph * flick;
    c.fillStyle = '#0b1320'; c.fillRect(sx, sy, sw, sh);
    c.translate(sx + sw / 2 + 40, sy + sh / 2 - 20); c.scale(1.5, 1.5); c.translate(0, 1318); tower(c, 0, 0, 1800, t, { lamp: 1, winLight: 1, sil: 1 }); c.restore();
    c.save(); c.globalAlpha = .12 * ph; for (let y = sy; y < sy + sh; y += 4) { c.fillStyle = '#000'; c.fillRect(sx, y, sw, 2); } c.restore();   // screen lines
  }
  const msg = 'तुम बहुत देर से आए हो...', n = Math.floor(seg(t, K.msgText, K.msgText + 1.0) * 14);
  if (n > 0) { c.save(); c.font = "600 52px 'Noto Serif Devanagari'"; c.textAlign = 'center'; c.textBaseline = 'middle';
    const full = c.measureText(msg).width; c.beginPath(); c.rect(sx + sw / 2 - full / 2 - 10, sy + 280, (full + 20) * Math.min(1, n / 13), 90); c.clip();
    c.fillStyle = 'rgba(2,4,8,.7)'; c.fillRect(sx + 20, sy + 290, sw - 40, 70); c.fillStyle = rgba('#f4e2c0', .95 * flick); c.fillText(msg, sx + sw / 2, sy + 326); c.restore(); }
  blob(c, sx + sw / 2, sy + sh / 2, 520, ph > 0 ? N.gold : '#5a7898', .18, 1.2, .9, 'screen');   // the screen's glow on his hands
  // hands: palms behind the body's sides, fingers curled over the top and bottom edges, thumbs on the back; lit by the screen
  for (const d of [-1, 1]) { const ex = d < 0 ? 500 : 1420;
    solid(c, [[ex + d * 90, 460], [ex + d * 150, 900], [W / 2 + d * 1100, 1300], [W / 2 + d * 700, 1300], [ex - d * 10, 860]], FIG.coat);   // sleeves
    solid(c, [[ex + d * 6, 420], [ex + d * 80, 440], [ex + d * 110, 640], [ex + d * 80, 860], [ex + d * 6, 820]], FIG.skinSh);
    for (let f = 0; f < 4; f++) { const y = 420 + f * 48; solid(c, [[ex - d * 4, y], [ex - d * 46, y + 4], [ex - d * 50, y + 36], [ex - d * 4, y + 40]], f % 2 ? FIG.skinSh : FIG.skin); }
    solid(c, [[ex - d * 4, 720], [ex - d * 70, 700], [ex - d * 76, 740], [ex - d * 4, 770]], FIG.skin);   // thumb
    blob(c, ex - d * 30, 560, 110, '#f0c890', .18, 1, 1.4, 'screen'); }
  rset(c);
}
// ============================================================ S9 — the light floods in; he turns toward it; black
function scene9(c, t, lt) {
  rset(c); const fl = seg(t, K.flood9, K.flood9 + .6), Z = lerp(1, 1.1, eio(lt / 4));
  c.setTransform(Z, 0, 0, Z, (1 - Z) * 960, (1 - Z) * 560);
  c.fillStyle = '#0a0f17'; c.fillRect(-200, -200, W + 400, H + 400);
  for (let i = 0; i < 9; i++) band(c, i * 120, i * 120 + 122, i % 2 ? '#141c27' : '#111823', .9, 330 + i, 6, 0);
  // the window on the right: the beam fills it, a flood of gold light pours across the room
  const wx = 1560, wy = 180, beam = fl * (.85 + .15 * Math.sin(t * 13));
  solid(c, [[wx - 150, wy + 620], [wx - 150, wy + 90], [wx, wy], [wx + 150, wy + 90], [wx + 150, wy + 620]], mixc('#1e2c40', N.hot, beam));
  c.fillStyle = '#070b11'; c.fillRect(wx - 4, wy, 8, 620); c.fillRect(wx - 150, wy + 320, 300, 8);
  if (beam > 0) { c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(18px)'; const g = c.createLinearGradient(wx, 0, 200, 0); g.addColorStop(0, rgba(N.hot, .7 * beam)); g.addColorStop(1, rgba(N.gold, 0)); c.fillStyle = g;
    c.beginPath(); c.moveTo(wx - 150, wy + 90); c.lineTo(wx - 150, wy + 620); c.lineTo(-200, 1200); c.lineTo(-200, -100); c.closePath(); c.fill(); c.restore();
    for (let i = 0; i < 120; i++) { const x = hash(i * 3.1) * 1500 + 100, y = ((hash(i * 7.3) * 900 - t * 16) % 900 + 900) % 900 + 100; c.fillStyle = rgba('#fff0cc', .7 * beam * hash(i * 5)); c.beginPath(); c.arc(x, y, 1.4 + hash(i) * 1.6, 0, 7); c.fill(); } }
  // the photographer, waist up from behind; turns toward the light
  const tr = seg(t, K.turn9, K.turn9 + .9), view = tr < .34 ? 'back' : tr < .67 ? 'back3q' : 'side';
  photographer(c, 900, 1500, 3.0, { view, t, wind: .1, rim: beam, look: view === 'side' ? .08 : 0 });
  rset(c); const wo = seg(t, K.black - .9, K.black - .3); if (wo > 0) { c.fillStyle = rgba('#fff4dc', .85 * Math.sin(wo * Math.PI)); c.fillRect(0, 0, W, H); }
}
// —— end: black, then the title and the question ——
function endTitle(c, t) {
  rset(c); c.fillStyle = '#020306'; c.fillRect(0, 0, W, H);
  blob(c, W / 2, 470, 760, '#16202c', .5 * seg(t, K.title, K.title + 1), 1.4, .55);
  const p = eo(seg(t, K.title, K.title + .9)), q = eo(seg(t, K.q, K.q + .8));
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = "600 150px 'Noto Serif Devanagari'"; const w = c.measureText('आखिरी रोशनी').width;
  c.save(); c.beginPath(); c.rect(W / 2 - w / 2 - 40, 300, (w + 80) * p, 300); c.clip();
  c.shadowColor = rgba(N.gold, .8); c.shadowBlur = 40; c.fillStyle = rgba('#f6e3b8', .97); c.fillText('आखिरी रोशनी', W / 2, 450); c.restore();
  c.fillStyle = rgba(N.gold, .8 * p); c.fillRect(W / 2 - w * .3, 560, w * .6 * p, 2.5);
  c.font = "500 50px 'Noto Serif Devanagari'"; c.fillStyle = rgba('#c9d3df', .92 * q); c.fillText('क्या कुछ रहस्य कभी सुलझने नहीं चाहिए?', W / 2, 660);
  c.restore();
}
