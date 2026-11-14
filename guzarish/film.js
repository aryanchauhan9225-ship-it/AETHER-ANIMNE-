'use strict';
// GUZARISH — Satinder Sartaaj, 02:10–02:59 (the supplied 49.03 s excerpt). An animated music video in the Gilded Illumination style
// (Pahari-miniature grammar). 1920×1080, 30 fps (the style's rate). Every picture is a pure function of t; the song is the only soundtrack.
//
// Sync map (measured from the audio: tempo 73 BPM, beat 0.8219 s from 0.446 s; vocal phrases from Whisper word timings, see audio/):
//   0–4.0 phrase tail · 5.1–8.5 the eyes line · 11.6–15.1 · 15.1–18.3 "…from Punjab" · 16.9–19.3 instrumental breath ·
//   21.2–24.7 hook 1 · 24.7–28.3 + 28.3–31.1 the moon-letters line twice · 31.9–35.0 · 35.0–38.0 the unveiling line ·
//   38.0–43.4 hook twice, densest bar (peak) · 45.1–48.8 closing ad-lib, music thinning.
const DUR = 1471 / 30;   // 49.0333 s = 1471 frames (the excerpt is 49.032 s)
const BEAT = .8219, B0 = .4457, B = k => B0 + BEAT * k;
const CUT = { s2: B(6), s3: B(13), s4: B(18), s5: B(25), s6: 24.62, s7: B(38), s7b: B(42), s8: B(46) };
// 5.377 11.130 15.240 20.993 | 24.62 | 31.678 34.966 38.253

// ---------------------------------------------------------------- the style's gold-light pass (from the Gilded Illumination demo, MIT)
let FR, FRg, MC, MCg;
function resetCtx(g) { if (g.reset) g.reset(); g.__gp = g.__sp = g.__paint = g.__gf = g.__gff = null; }
function lightAt(lights, x, y) { let v = 0; for (const L of lights) {
  if (L.type === 'r') { const d = Math.hypot(x - L.x, y - L.y) / L.r; if (d < 1) v += L.a * Math.pow(1 - d, 1.4); }
  else if (L.type === 'b') { const d = ((x - L.x) * L.nx + (y - L.y) * L.ny) / L.w; v += L.a * Math.exp(-d * d); }
  else if (L.type === 'o') { const d = (Math.hypot(x - L.x, y - L.y) - L.rad) / L.w; v += L.a * Math.exp(-d * d); } } return v; }
let GW, GWg, GWD, GWI;
function glintPass(M, lights, amb) {
  if (!lights.length && amb <= 0) { if (GWD) GWD.fill(0); return; }
  const md = MCg.getImageData(0, 0, W, H).data, img = ctx.getImageData(0, 0, W, H), fd = img.data;
  if (!GW) { GW = cnv(W / 4, H / 4); GWg = GW.getContext('2d'); GWD = new Float32Array(W / 4 * H / 4); GWI = GWg.createImageData(W / 4, H / 4); }
  GWD.fill(0); const QW = W / 4, inv = M.inverse(), ia = inv.a, ib = inv.b, ic = inv.c, id = inv.d, ie = inv.e, iff = inv.f;
  const Ls = lights.map(L => ({ ...L, r2: L.r ? L.r * L.r : 0 }));
  let ci = 1e9, cj = 1e9, nx = 1, ny = 0, th = 0, fam = 0, tone = 0, ox = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = (y * W + x) * 4, A = md[p + 3]; if (A < 6) continue;
    const wx = ia * x + ic * y + ie, wy = ib * x + id * y + iff, j = Math.floor(wy / LS), ro = rowOff(j), i = Math.floor((wx + ro) / LS);
    if (i !== ci || j !== cj) { ci = i; cj = j; ox = ro; th = leafTilt(i, j); nx = Math.cos(th); ny = Math.sin(th); const fa = .5 + .5 * Math.cos(th - .9); fam = fa * fa * fa * fa; tone = leafTone(i, j); }
    const lu = (wx + ox) / LS - i - .5, lv = wy / LS - j - .5, cup = 1 + .55 * (lu * nx + lv * ny);
    let R = amb * (.55 + .55 * fam);
    for (let k = 0; k < Ls.length; k++) { const L = Ls[k];
      if (L.type === 'r') { const dx = wx - L.x, dy = wy - L.y, d2 = dx * dx + dy * dy; if (d2 >= L.r2) continue; const d = Math.sqrt(d2), v = L.a * Math.pow(1 - d / L.r, 1.4); let f = .5 + .5 * (dx * nx + dy * ny) / (d + 1e-3); f *= f; R += v * (.5 + .75 * f); }
      else if (L.type === 'b') { const dd = ((wx - L.x) * L.nx + (wy - L.y) * L.ny) / L.w; if (dd > 3 || dd < -3) continue; const v = L.a * Math.exp(-dd * dd); let f = .5 + .5 * Math.cos(dd * 1.9 + th); f *= f; R += v * (.45 + .8 * f); }
      else { const dx = wx - L.x, dy = wy - L.y, dd = (Math.sqrt(dx * dx + dy * dy) - L.rad) / L.w; if (dd > 3 || dd < -3) continue; const v = L.a * Math.exp(-dd * dd); let f = .5 + .5 * Math.cos(dd * 2.2 + th); f *= f; R += v * (.5 + .8 * f); } }
    if (R < .004) continue;
    const k = A / 255 * Math.min(R * cup, 2.2) * (.9 + .2 * tone);
    if (k > .6) GWD[(y >> 2) * QW + (x >> 2)] += (k - .6);
    const f = .82 * (1 - Math.exp(-1.15 * k)), r0 = fd[p], g0 = fd[p + 1], b0 = fd[p + 2];
    fd[p] = Math.min(255, r0 * (1 + .5 * k) + (250 - r0) * f); fd[p + 1] = Math.min(232, g0 * (1 + .45 * k) + (204 - g0) * f); fd[p + 2] = Math.min(150, b0 * (1 + .2 * k) + (96 - b0) * f);
  }
  ctx.putImageData(img, 0, 0);
}
function glowPass(gain) { if (!GWD) return; const n = GWD.length, d = GWI.data;
  for (let i = 0; i < n; i++) { const v = Math.min(1, GWD[i] / 16 * gain); d[i * 4] = 255; d[i * 4 + 1] = 196; d[i * 4 + 2] = 110; d[i * 4 + 3] = 255 * v * v; }
  GWg.putImageData(GWI, 0, 0); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
  ctx.filter = 'blur(10px)'; ctx.globalAlpha = .5; ctx.drawImage(GW, 0, 0, W, H); ctx.filter = 'blur(36px)'; ctx.globalAlpha = .5; ctx.drawImage(GW, 0, 0, W, H); ctx.restore(); }
function flashes(M, lights) {
  ctx.setTransform(M); ctx.globalCompositeOperation = 'lighter'; const z = Math.hypot(M.a, M.b);
  for (const p of GP) { const v = lightAt(lights, p.x, p.y) * p.k; if (v < .6) continue; const a = clamp((v - .6) * 1.3), r = Math.min(p.r * (.4 + .45 * a), 140 / z);
    const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * .5); rg.addColorStop(0, `rgba(255,246,215,${.35 * a})`); rg.addColorStop(1, 'rgba(255,232,160,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(p.x, p.y, r * .5, 0, TAU); ctx.fill();
    ctx.fillStyle = `rgba(255,250,232,${.75 * a})`;
    for (const an of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) { const rr = an % (Math.PI / 2) ? r * .45 : r; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(an + .2); ctx.beginPath(); ctx.moveTo(-rr, 0); ctx.quadraticCurveTo(0, -rr * .06, rr, 0); ctx.quadraticCurveTo(0, rr * .06, -rr, 0); ctx.fill(); ctx.restore(); } }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- camera with depth layers
let CAM = { x: W / 2, y: H / 2, z: 1, r: 0 };
function layer(g, k = 1) { const c = CAM, z = Math.exp(Math.log(c.z) * k), x = W / 2 + (c.x - W / 2) * k, y = H / 2 + (c.y - H / 2) * k; const M = camMatrix({ x, y, z, r: c.r * k }); g.setTransform(M); setZoom(z); return M; }
const pulse = (t, c, w = .07) => Math.exp(-((t - c) / w) * ((t - c) / w));
const lz = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));

// ============================================================== SHOT 1 — Punjab at golden hour (0 – 5.38)
const S1 = { sun: [1520, 300], hav: [1450, 770, .45] };
const S1J = [S1.hav[0] - 230 * S1.hav[2], S1.hav[1] - 720 * S1.hav[2] + 300 * S1.hav[2] - 30 * S1.hav[2] - 95 * S1.hav[2]];
function shot1(g, t) {
  const push = ei(seg(t, 2.6, CUT.s2)), drift = t * 14;
  const c0 = { x: 820 + drift, y: 470, z: .94 }, z = lz(.94, 9, push), s0 = [W / 2 + (S1J[0] - c0.x) * c0.z, H / 2 + (S1J[1] - c0.y) * c0.z], sp = [lerp(s0[0], W / 2, ss(push)), lerp(s0[1], H / 2, ss(push))];
  CAM = { x: S1J[0] - (sp[0] - W / 2) / z, y: S1J[1] - (sp[1] - H / 2) / z, z, r: 0 };
  layer(g, .25); skyGold(g, -1600, -1400, 3600, 760, { dim: .32 });
  for (const [x, y, s, sp, sd] of [[200, 120, 1.4, 16, 3], [1100, 60, 1.1, 22, 5], [1900, 180, 1.2, 12, 7], [-500, 240, 1, 20, 9]]) cloud(g, ((x - t * sp) % 3400 + 3400) % 3400 - 900, y, s, { n: 5, seed: sd });
  layer(g, .35); sunDisc(g, S1.sun[0], S1.sun[1] + t * 4, 110, t, { dim: .3 });
  layer(g, .55); hill(g, [[-1200, 640], [-500, 560], [100, 600], [700, 540], [1300, 600], [1900, 560], [2700, 620]], 1400, ['#9fbfae', '#7a9c8a'], 11);
  layer(g, .75); hill(g, [[-1200, 700], [-400, 640], [300, 690], [900, 650], [1500, 700], [2400, 660]], 1400, ['#5f9a6a', '#3f7650'], 12);
  for (const [x, k] of [[-300, 'round'], [80, 'cypress'], [360, 'blossom'], [620, 'round'], [1040, 'cypress'], [1880, 'round']]) tree(g, x, 690, .55, t, k, x, .5);
  layer(g, 1); hill(g, [[900, 830], [1200, 760], [1500, 740], [1800, 780], [2300, 830]], 1400, ['#4d8a5a', '#2f6a40'], 13);
  haveli(g, S1.hav[0], S1.hav[1], S1.hav[2], t, { lit: 0 });
  river(g, [[-1200, 900], [-200, 870], [500, 920], [1200, 880], [2600, 930]], 70, t);
  mustard(g, -1300, 2800, 945, 1500, t, 21, .7, 1);
  flock(g, t, 2100, 260, -160, -8, .55, 5, 4);
  layer(g, 1.5); stalks(g, -1800, 3600, 1260, t, 31, 1.2, .8);
  return { lights: [{ type: 'b', x: S1.sun[0], y: S1.sun[1], nx: Math.cos(.4 + t * .05), ny: Math.sin(.4 + t * .05), w: 260, a: .9 }, { type: 'r', x: S1.sun[0], y: S1.sun[1], r: 900, a: .55 + .1 * Math.sin(t * 2) }], amb: .12, layerM: 1 };
}

// ============================================================== SHOT 2 — her, framed in the jharokha; the eyes (5.38 – 11.13)
const S2 = { x: 840, y: 1560, s: 2.25 };
function jharokhaFrame(g, t, cx, cy, w, h, dim) {   // the window she stands in: leaf spandrels around a cusped arch, vermilion frame, carved sill
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, spr = y0 + h * .3, top = y0 + h * .05;
  const sp = P2(q => { q.rect(x0, y0, w, spr - y0); archPath(cx, spr, w * .86, spr, top, 9, q); });
  g.save(); g.beginPath(); g.rect(x0 - 400, y0 - 400, w + 800, h + 800); archPath(cx, y1 + 400, w * .86, spr, top, 9, g); g.clip('evenodd');
  const outer = P2(q => q.rect(x0 - 600, y0 - 600, w + 1200, h + 1200)); g.fillStyle = '#e6d1b2'; g.fill(outer); rimShade(g, outer, '#b99a74', 30); maskErase(g, outer);
  const fr = P2(q => q.rect(x0, y0, w, h)); g.fillStyle = VERM; g.fill(fr); rimShade(g, fr, VERM_D, 18); maskErase(g, fr);
  leaf(g, P2(q => q.rect(x0 + 40, y0 + 40, w - 80, h * .36)), [x0, y0, w, h * .4], { dim, lw: 2.2 });
  for (const d of [-1, 1]) { const px = cx + d * w * .45; const pl = P2(q => q.rect(px - 34, spr, 68, y1 - spr)); g.fillStyle = '#f0e2cc'; g.fill(pl); rimShade(g, pl, '#c9ab84', 10); ink(g, pl, 2.4); maskErase(g, pl); pearlLine(g, [[px, spr + 30], [px, y1 - 30]], 22, 3, .85); }
  g.restore();
  ink(g, archPath(cx, y1 + 400, w * .86, spr, top, 9), 3);
  for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, x = lerp(x0 + 90, x1 - 90, u); triad(g, x, y0 + 70 + Math.sin(u * Math.PI) * 30, 3, .9); }
  gpush(cx, y0 + h * .2, w * .5, 1);
  const sill = P2(q => { q.moveTo(x0 - 60, y1 - 60); q.lineTo(x1 + 60, y1 - 60); q.lineTo(x1 + 20, y1 + 10); q.lineTo(x0 - 20, y1 + 10); q.closePath(); }); paint(g, sill, '#efe0c8', '#c09a72', 10, 2.4);
}
let S2EYE = [0, 0];
function shot2(g, t, lt) {
  // camera: from the full window to her eye (5.4–8.0), held through the blink, out again as she draws the dupatta (8.7–11.1)
  const pin = eio(seg(t, 5.5, 8.05)), pout = eio(seg(t, 8.75, 11.1)), zin = lz(1, 4.6, pin), z = pout > 0 ? lz(4.6, 1.12, pout) : zin;
  const ex = S2EYE[0] || 1050, ey = S2EYE[1] || 330, k = pout > 0 ? 1 - pout : pin;
  CAM = { x: lerp(960, ex - 40, k) + Math.sin(t * .5) * 6, y: lerp(560, ey + 10, k), z, r: lerp(0, -.02, k) };
  layer(g, .5); skyGold(g, -800, -600, 2700, 1700, { dim: .4 });
  for (const [x, y, s] of [[300, 230, 1.1], [1500, 380, .9]]) cloud(g, x - lt * 18, y, s, { n: 5, seed: x });
  layer(g, 1);
  const blink = Math.max(pulse(t, 7.86), pulse(t, 10.32)), gaze = .1 + .6 * ss(seg(t, 8.5, 8.9)) - .4 * ss(seg(t, 9.6, 10.3)), up = .55 * ss(seg(t, 8.5, 8.9)) - .55 * ss(seg(t, 9.8, 10.4));
  const r = drawWoman(g, S2.x, S2.y, S2.s, { t, wind: .55, blink, gaze, up, smile: .25 + .4 * ss(seg(t, 9.0, 9.8)), head: .03 + .06 * ss(seg(t, 8.5, 9.0)) - .05 * ss(seg(t, 9.8, 10.6)), arm: { kind: 'dupatta', k: ss(seg(t, 8.9, 9.9)) * (1 - ss(seg(t, 10.4, 11.1))) }, dupLift: .5 * ss(seg(t, 9.2, 10.4)), swing: .1 * Math.sin(t * 3) });
  S2EYE = r.eye;
  jharokhaFrame(g, t, 960, 560, 1700, 1180, .35);
  petals(g, t, -200, -100, 2200, 1200, 26, 41, 1.2, 1.6);
  return { lights: [{ type: 'b', x: 1500, y: 100, nx: Math.cos(.6), ny: Math.sin(.6), w: 240, a: .75 }, { type: 'b', x: lerp(-400, 2400, seg(t, 6.0, 8.2)), y: 300, nx: .9, ny: .44, w: 120, a: .9 * Math.sin(Math.PI * seg(t, 6.0, 8.2)) }], amb: .14 };
}
function dupattaWipe(g, u) {   // a sweep of phulkari fabric across the whole frame (the cut is hidden at u = .5)
  if (u <= 0 || u >= 1) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); setZoom(1); FK = .7;
  const x = lerp(2600, -2600, u), pts = []; for (let i = 0; i <= 12; i++) { const v = i / 12; pts.push([x + Math.sin(v * 5 + u * 6) * 160 + v * 900 - 450, lerp(-300, 1380, v)]); }
  const p = tubePath(pts, pts.map((_, i) => 2300 + Math.sin(i + u * 8) * 120), true, true);
  g.fillStyle = DUP; g.fill(p); rimShade(g, p, DUP_D, 60); ink(g, p, 4);
  g.save(); g.clip(p); g.fillStyle = FLOSS; for (let yy = -320; yy < 1400; yy += 60) for (let xx = x - 2400 + ((yy / 60) % 2) * 30; xx < x + 2400; xx += 60) { g.beginPath(); g.moveTo(xx, yy - 18); g.lineTo(xx + 16, yy); g.lineTo(xx, yy + 18); g.lineTo(xx - 16, yy); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(255,250,236,.9)'; for (let yy = -290; yy < 1400; yy += 60) for (let xx = x - 2400 + ((yy / 60 + .5) % 2) * 30; xx < x + 2400; xx += 60) { g.beginPath(); g.arc(xx, yy, 3.4, 0, TAU); g.fill(); } g.restore();
  g.restore();
}

// ============================================================== SHOT 3 — the arcade of lanterns; she walks with a diya (11.13 – 15.24)
const S3 = { v: 205, x0: 260, s: 1.18 };
const S3HAND = 150 * S3.s;
const S3L = [14, 15, 16, 17, 18].map(k => S3.x0 + (B(k) - CUT.s3) * S3.v + S3HAND);   // a lantern at each place her flame passes on a beat
function shot3(g, t, lt) {
  const x = S3.x0 + lt * S3.v; CAM = { x: x + 260, y: 560, z: 1.04, r: 0 };
  layer(g, .4); const sp = P2(q => q.rect(-800, -400, 4400, 1000)); g.fillStyle = '#16226a'; skyNight(g, -900, -600, 4400, 760, S3STARS, t, .6);
  leaf(g, P2(q => q.rect(-900, 560, 5300, 300)), [-900, 560, 5300, 300], { line: false, dim: .45 }); void sp;
  hill(g, [[-900, 640], [0, 600], [900, 630], [1800, 590], [2700, 640], [3600, 600], [4400, 640]], 1200, ['#3e6a58', '#26483a'], 14);
  for (let i = 0; i < 9; i++) tree(g, -400 + i * 520, 660, .5, t, i % 3 ? 'round' : 'cypress', i * 7, .4);
  layer(g, 1);
  // the arcade: wall, cusped arches between pillars, lanterns hanging in each arch
  const wall = P2(q => { q.rect(-600, -200, 4800, 1500); for (let i = 0; i < 12; i++) archPath(-260 + i * 380 + 190, 880, 300, 330, 150, 7, q); });
  g.fillStyle = '#ead6b8'; g.fill(wall, 'evenodd'); rimShade(g, wall, '#c3a07a', 16); ink(g, wall, 2.4); maskErase(g, wall);
  const band = P2(q => q.rect(-600, 60, 4800, 26)); paint(g, band, VERM, VERM_D, 4, 2);
  for (let i = 0; i < 12; i++) { const ax = -260 + i * 380 + 190; for (let k = 0; k < 3; k++) triad(g, ax - 60 + k * 60, 110, 2.6, .85); }
  const floor = P2(q => q.rect(-600, 880, 4800, 400)); paint(g, floor, '#cdb08c', '#9e7e58', 10, 2.4);
  g.strokeStyle = '#a88a64'; g.lineWidth = 2; for (let k = 0; k < 60; k++) { g.beginPath(); g.moveTo(-600 + k * 90, 880); g.lineTo(-900 + k * 110, 1280); g.stroke(); }
  const lit = [];
  S3L.forEach((lx, i) => { const L = clamp((x + S3HAND - lx + 40) / 70); lit.push(L); const pos = lantern(g, lx, 330, 1.25, L, t, i); if (L > 0) lit[i] = { L, pos }; });
  const w = drawWoman(g, x, 1020, S3.s, { t, phase: lt * S3.v / 62, walk: 1, wind: .65, arm: { kind: 'diya', k: 1 }, smile: .35, gaze: .2 });
  petals(g, t, x - 1200, -100, x + 1400, 1100, 16, 51, 1, 1.2);
  const lights = [{ type: 'r', x: w.prop[0], y: w.prop[1], r: 520, a: 1.1 }];
  lit.forEach(o => { if (o && o.pos) lights.push({ type: 'r', x: o.pos[0], y: o.pos[1] - 20, r: 340, a: .9 * o.L }); });
  return { lights, amb: .08, night: .25, lamps: [w.prop, ...lit.filter(o => o && o.pos).map(o => o.pos)] };
}
const S3STARS = makeStars(5, -900, -600, 4400, 520, 90, 6, 12);

// ============================================================== SHOT 4 — the arrival: he walks the field road toward the haveli (15.24 – 20.99)
const S4 = { stop: [17.25, 19.25], v: 150 };
function manX4(t) { const a = Math.min(t, S4.stop[0]) - CUT.s4, b = Math.max(0, Math.min(t, 99) - S4.stop[1]), slow = clamp((t - S4.stop[0]) / .5) * .5 * .25; return 520 + (a + b) * S4.v + slow * S4.v * .5; }
const S4STARS = makeStars(9, -1200, -900, 4400, 540, 120, 6, 15);
function shot4(g, t, lt) {
  const mx = manX4(t), walking = t < S4.stop[0] + .25 || t > S4.stop[1], night = ss(seg(t, 17.0, 19.3));
  CAM = { x: 560 + lt * 110, y: 520 - 40 * night, z: .9, r: 0 };
  layer(g, .2); skyGold(g, -1600, -1300, 4400, 800, { dim: .3 + .6 * night });
  if (night > 0) { g.save(); const e = lerp(-1300, 820, night); g.beginPath(); g.moveTo(-1600, -1400); g.lineTo(4400, -1400); for (let xx = 4400; xx >= -1600; xx -= 60) g.lineTo(xx, e + (fbm(xx * .004, 3) - .5) * 260 * (1 - night * .6)); g.closePath(); g.clip(); skyNight(g, -1600, -1400, 4400, 820, S4STARS, t, ss(seg(t, B(23) - .1, B(25)))); g.restore(); }
  cloud(g, 700 - lt * 26, 120, 1.1, { n: 6, seed: 19, col: night > .5 ? ['#8a8fc4', '#5c5f9a'] : ['#e6e1f1', '#b2a8cf'] });
  layer(g, .3); const sy = lerp(330, 760, ss(seg(t, 15.8, 19.0))); if (sy < 800) sunDisc(g, 1650, sy, 105, t, { dim: .25 + .5 * night });
  layer(g, .45); hill(g, [[-1200, 660], [-200, 600], [700, 650], [1500, 590], [2400, 640], [3400, 600], [4200, 650]], 1500, ['#8fb2a4', '#6a8f80'], 15);
  layer(g, .6); hill(g, [[-800, 760], [400, 700], [1200, 740], [2000, 690], [2800, 720], [3800, 700]], 1500, ['#5a8f64', '#3a6a48'], 16);
  haveli(g, 1900, 720, .42, t, { lit: ss(seg(t, 18.6, 20.5)) });
  for (const [x, k] of [[-200, 'round'], [500, 'cypress'], [900, 'blossom'], [1500, 'round'], [3100, 'cypress'], [3500, 'round']]) tree(g, x, 735, .6, t, k, x + 3, .5);
  layer(g, 1);
  mustard(g, -1200, 4600, 820, 905, t, 23, .6, .9);
  const road = P2(q => { q.moveTo(-1200, 905); q.lineTo(4600, 900); q.lineTo(4600, 1010); q.lineTo(-1200, 1015); q.closePath(); }); paint(g, road, '#d9c39a', '#b49a6e', 10, 2.2);
  g.fillStyle = 'rgba(140,110,70,.6)'; for (let k = 0; k < 80; k++) { const R = mulberry(k)(); g.beginPath(); g.arc(-1100 + k * 72, 930 + R * 70, 3, 0, TAU); g.fill(); }
  mustard(g, -1200, 4600, 1010, 1400, t, 24, .7, 1.1);
  tree(g, 1900, 1010, .95, t, 'blossom', 77, .6);
  const ph = (mx - 520) / 70;
  drawMan(g, mx, 975, 1.0, { t, phase: ph, walk: walking ? 1 : 0, wind: .6, head: !walking ? .1 * ss(seg(t, S4.stop[0] + .2, S4.stop[0] + .8)) : 0, up: !walking ? .7 : .1, gaze: .3,
    blink: pulse(t, 18.4), smile: !walking ? .3 : .1, arm: { kind: 'heart', k: ss(seg(t, 17.6, 18.2)) * (1 - ss(seg(t, 18.9, 19.4))) } });
  layer(g, 1.7); stalks(g, -2400, 6000, 1250, t, 37, 1.3, .9);
  flock(g, t, 2600, 180, -140, 0, .5, 4, 8);
  return { lights: [{ type: 'b', x: 1650, y: sy, nx: 1, ny: 0, w: 300, a: .9 * (1 - night) }, { type: 'r', x: 1650, y: sy, r: 1100, a: .5 * (1 - night) }, { type: 'b', x: lerp(-1000, 4000, seg(t, B(23), B(25))), y: 0, nx: 1, ny: .2, w: 200, a: .9 * night }], amb: .1, night: .55 * night };
}

// ============================================================== SHOT 5 — the haveli's grandeur at dusk (hook 1) (20.99 – 24.62)
const S5STARS = makeStars(13, -900, -1200, 2900, 200, 110, 6, 14);
function shot5(g, t, lt) {
  const u = eio(seg(t, CUT.s5, 24.5)); CAM = { x: 960, y: lerp(1160, 420, u), z: lz(1.55, .82, u), r: 0 };
  layer(g, .5); skyNight(g, -1400, -1600, 3400, 520, S5STARS, t, 1); moonDisc(g, 1650, -420, 120, { dim: .4 });
  layer(g, .75); hill(g, [[-900, 470], [0, 420], [960, 450], [1900, 410], [2900, 460]], 1600, ['#3d5a7a', '#283e58'], 17);
  layer(g, 1);
  const litK = [B(25), B(26), B(27), B(28), B(29)].map(b => ss(seg(t, b - .05, b + .25))), lit = .2 * litK[0] + .2 * litK[1] + .2 * litK[2] + .2 * litK[3] + .2 * litK[4];
  const hv = haveli(g, 960, 1000, 1.05, t, { lit, door: ss(seg(t, 22.4, 23.6)) });
  for (const d of [-1, 1]) for (let k = 0; k < 3; k++) tree(g, 960 + d * (720 + k * 200), 1100 + k * 30, .9 + k * .1, t, 'cypress', k * 5 + d, .3);
  const court = P2(q => q.rect(-900, 1000, 3700, 900)); paint(g, court, '#d8c3a2', '#b39a76', 14, 2.4);
  const chan = P2(q => { q.moveTo(900, 1000); q.lineTo(1020, 1000); q.lineTo(1300, 1900); q.lineTo(620, 1900); q.closePath(); }); g.save(); g.clip(chan); river(g, [[960, 980], [960, 1950]], 900, t); g.restore(); ink(g, chan, 2.4);
  for (let k = 0; k < 4; k++) { const fy = 1150 + k * 190, fx = 960, hgt = 70 + 20 * Math.sin(t * 6 + k);   // fountain jets
    g.strokeStyle = 'rgba(245,250,255,.9)'; g.lineWidth = 3; for (let j = -2; j <= 2; j++) { g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx + j * 14, fy - hgt * 1.4, fx + j * 34, fy - 4); g.stroke(); } pearls(g, fx, fy - hgt * .9, 22, 8, 2.4, .8); }
  for (let k = 0; k < 6; k++) for (const d of [-1, 1]) { const lx = 960 + d * (240 + k * 30), ly = 1060 + k * 160, s = .9 + k * .08; const post = P2(q => q.rect(lx - 7 * s, ly + 40 * s, 14 * s, 150 * s)); paint(g, post, '#5a3a22', '#3a2412', 3, 1.8); lantern(g, lx, ly, s, litK[Math.min(4, k)], t, k * 3 + d, true); }
  drawMan(g, lerp(520, 830, seg(t, 21.0, 24.4)), 1180, .62, { t, phase: lt * 4, walk: 1, wind: .3, up: .6, head: .08 });
  return { lights: [{ type: 'r', x: hv.gate[0], y: hv.gate[1] - 200, r: 900, a: .9 * lit }, { type: 'b', x: lerp(-200, 2200, seg(t, 21.0, 24.4)), y: 0, nx: 1, ny: -.3, w: 260, a: .7 }], amb: .06, night: .5 };
}

// ============================================================== SHOT 6 — letters from the moon (24.62 – 31.68)
const S6 = { moon: [1180, -980], her: [760, 1060, 1.45], land: 28.32 };
const S6STARS = makeStars(17, -1000, -1700, 3000, 700, 160, 6, 15);
function letterPath(i, t) {   // each letter leaves the moon on its own beat and spirals down; letter 0 lands in her hand
  const t0 = 25.88 + i * .41, T = 2.45 + (i % 3) * .25, u = clamp((t - t0) / T); if (t < t0) return null;
  const hand = S6HAND, endX = i === 0 ? hand[0] : 300 + (i * 397) % 1500, endY = i === 0 ? hand[1] : 1200 + (i % 2) * 300;
  const e = i === 0 ? eio(u) : u, x = lerp(S6.moon[0] + Math.cos(i * 2.1) * 120, endX, e) + Math.sin(e * Math.PI * 2 + i) * 160 * (1 - e), y = lerp(S6.moon[1] + 60, endY, e);
  return { x, y, rot: Math.sin(t * 2.2 + i) * .5 * (1 - (i === 0 ? ss(seg(u, .8, 1)) : 0)) + (i === 0 ? 0 : t * .4), s: lerp(.5, 1, e), u, t0 };
}
let S6HAND = [940, 520];
function shot6(g, t, lt) {
  const down = eio(seg(t, 25.9, 28.25)), pin = eio(seg(t, 28.7, 31.6));
  CAM = { x: lerp(S6.moon[0], 900, down) + lerp(0, -40, pin), y: lerp(S6.moon[1] + 40, 140, down) + lerp(0, 330, pin), z: pin > 0 ? lz(.62, 1.9, pin) : lz(1.35, .62, down), r: 0 };
  layer(g, 1);
  skyNight(g, -1600, -2400, 3600, 1000, S6STARS, t, 1);
  cloud(g, 300 + lt * 12, -500, 1.4, { n: 7, seed: 6, col: ['#7d84be', '#565b98'] }); cloud(g, 1900 - lt * 10, -180, 1.2, { n: 5, seed: 8, col: ['#7d84be', '#565b98'] });
  moonDisc(g, S6.moon[0], S6.moon[1], 230, { dim: .35 });
  hill(g, [[-1600, 860], [-400, 800], [700, 840], [1800, 790], [3600, 850]], 2000, ['#2f4d6a', '#1f3550'], 18);
  for (let i = 0; i < 14; i++) { const x = -600 + i * 230, y = 880 + (i % 3) * 14; g.fillStyle = 'rgba(255,200,120,.85)'; g.fillRect(x, y, 10, 8); }   // a far village's windows
  // the rooftop: parapet, a chhatri at the right, potted tulsi, lanterns along the edge
  const roof = P2(q => q.rect(-1600, 1080, 5200, 900)); paint(g, roof, '#d9c4a4', '#b0946e', 16, 2.4);
  const par = P2(q => { q.rect(-1600, 980, 5200, 100); }); paint(g, par, '#ead8bc', '#c3a37c', 10, 2.4);
  for (let x = -1560; x < 3600; x += 80) { const b = P2(q => { q.moveTo(x, 1080); q.lineTo(x, 1010); q.quadraticCurveTo(x + 20, 990, x + 40, 1010); q.lineTo(x + 40, 1080); q.closePath(); }); paint(g, b, '#c3a37c', '#9a7c58', 3, 1.6); }
  chhatri(g, 1700, 980, 260, 2);
  const landK = ss(seg(t, 28.0, 28.4));
  const r = drawWoman(g, S6.her[0], S6.her[1], S6.her[2], { t, wind: .5, head: .28 * (1 - ss(seg(t, 28.4, 29.0))) + .02, up: 1 - ss(seg(t, 28.4, 29.0)) * 1.3, gaze: .3, smile: .2 + .5 * ss(seg(t, 29.6, 30.6)),
    blink: pulse(t, 27.0), arm: { kind: t < 28.5 ? 'reach' : 'letter', k: t < 28.5 ? ss(seg(t, 26.6, 27.8)) : 1 },
    letter: (g2, lx, ly) => { letter(g2, lx, ly - 20, .75, ss(seg(t, 28.6, 29.3)), -.15, seg(t, 29.1, 30.8), 3); return [lx, ly - 20]; } });
  S6HAND = [r.hand[0] + 20, r.hand[1] - 40];
  for (let k = 0; k < 4; k++) lantern(g, 100 + k * 520, 960, 1.1, 1, t, k);
  for (let i = 6; i >= 0; i--) { const L = letterPath(i, t); if (!L) continue; if (i === 0 && t >= 28.5) continue; letter(g, L.x, L.y, L.s * 1.9, 0, L.rot, 0, i + 1); }
  const ring = seg(t, S6.land, S6.land + 1.4), lights = [{ type: 'r', x: S6.moon[0], y: S6.moon[1], r: 1100, a: .45 }, { type: 'r', x: S6HAND[0], y: S6HAND[1], r: 420, a: .5 * landK }];
  if (ring > 0 && ring < 1) lights.push({ type: 'o', x: S6.moon[0], y: S6.moon[1], rad: 60 + ring * 900, w: 60, a: 1.4 * (1 - ring) });
  for (let i = 0; i < 7; i++) { const L = letterPath(i, t); if (L && L.u < 1) lights.push({ type: 'r', x: L.x, y: L.y, r: 160, a: .9 }); }
  return { lights, amb: .06, night: .62 };
}

// ============================================================== SHOT 7a — the same night: she above, he below (31.68 – 34.97)
const S7STARS = makeStars(23, -900, -900, 3000, 200, 120, 6, 13);
function shot7(g, t, lt) {
  const u = eio(seg(t, 32.75, 33.95)), v = eio(seg(t, 33.9, 34.97));
  const a = { x: 640, y: 60, z: 1.6 }, b = { x: 2010, y: 900, z: 1.5 }, c = { x: 1320, y: 620, z: .74 };
  CAM = { x: lerp(lerp(a.x, b.x, u), c.x, v) + Math.sin(t * .6) * 8, y: lerp(lerp(a.y, b.y, u), c.y, v), z: lz(lz(a.z, b.z, u), c.z, v), r: 0 };
  layer(g, .6); skyNight(g, -1200, -1200, 3200, 700, S7STARS, t, 1); moonDisc(g, 1700, -300, 140, { dim: .45 });
  layer(g, 1);
  // the haveli's upper storey and terrace (left), the lit courtyard below (right)
  wallBlock(g, -700, 520, 1250, 1900); const band = P2(q => q.rect(-700, 520, 1950, 40)); paint(g, band, VERM, VERM_D, 4, 2);
  { const fr = P2(q => q.rect(-700, 600, 1950, 34)); paint(g, fr, ULTRA, ULTRA_D, 4, 2); for (let x = -680; x < 1240; x += 46) triad(g, x, 617, 2.4, .9);
    for (let k = 0; k < 4; k++) { const jx = -460 + k * 420 + 210; if (jx > 1150) continue; const win = archPath(jx, 740, 90, 680, 640, 5); paint(g, win, mixHex('#24203c', '#f6c068', .8), INK, 2, 2); dome(g, jx, 640, 110, 80); } }
  for (let k = 0; k < 4; k++) { const a = archPath(-460 + k * 420, 1120, 170, 860, 760, 7); paint(g, a, mixHex('#24203c', '#f6c068', .9), INK, 2, 2.2); lantern(g, -460 + k * 420, 980, .9, 1, t, k); }
  for (let x = -680; x < 1240; x += 70) { const b = P2(q => { q.moveTo(x, 520); q.lineTo(x, 450); q.quadraticCurveTo(x + 18, 430, x + 36, 450); q.lineTo(x + 36, 520); q.closePath(); }); paint(g, b, '#c3a37c', '#9a7c58', 3, 1.6); }
  chhatri(g, 120, 470, 240, 2);
  const lookDown = ss(seg(t, 32.2, 32.9));
  drawWoman(g, 560, 520, 1.0, { t, wind: .45, head: -.18 * lookDown, up: -.6 * lookDown, gaze: .5, smile: .3 * ss(seg(t, 33.4, 34.2)), blink: pulse(t, 33.0) });
  const court = P2(q => q.rect(1250, 1240, 2400, 900)); paint(g, court, '#d8c3a2', '#b39a76', 14, 2.4);
  river(g, [[1300, 1330], [3000, 1330]], 60, t);
  for (const x of [1400, 2650]) tree(g, x, 1250, .9, t, 'cypress', x, .3);
  for (let k = 0; k < 4; k++) lantern(g, 1500 + k * 300, 1150, .8, 1, t, k + 9);
  drawMan(g, 2050, 1290, 1.0, { t, dir: -1, wind: .3, head: .3 * ss(seg(t, 32.6, 33.3)), up: .9, gaze: .4, smile: .4 * ss(seg(t, 33.8, 34.5)), arm: { kind: 'heart', k: ss(seg(t, 33.9, 34.6)) } });
  petals(g, t, 300, 300, 2400, 1400, 18, 61, .6, 1);
  return { lights: [{ type: 'r', x: 900, y: 900, r: 1300, a: .35 }, { type: 'b', x: lerp(-400, 2400, seg(t, 32.0, 34.9)), y: 400, nx: .8, ny: .6, w: 220, a: .7 }], amb: .06, night: .5 };
}

// ============================================================== SHOTS 7b + 8 — the pavilion: unveiling, the touch, the whole painting (34.97 – end)
const P8 = { X0: -1640, X1: 3560 }; P8.Y1 = 1640; P8.Y0 = P8.Y1 - (P8.X1 - P8.X0) * 9 / 16; P8.b = 170;
const S8STARS = makeStars(29, P8.X0, P8.Y0, P8.X1, 300, 260, 7, 18);
const TOUCH = B(46);   // 38.253: the first word of the hook
function pavilionWorld(g, t, lit) {
  skyNight(g, P8.X0 - 100, P8.Y0 - 100, P8.X1 + 100, 1100, S8STARS, t, 1);
  moonDisc(g, 2700, -380, 260, { dim: .35 });
  for (const [x, y, s, sd] of [[-900, -500, 1.6, 2], [400, -760, 1.3, 4], [2000, 120, 1.2, 6]]) cloud(g, x + Math.sin(t * .2 + sd) * 40 + t * 6, y, s, { n: 6, seed: sd, col: ['#7d84be', '#565b98'] });
  hill(g, [[P8.X0 - 100, 820], [-600, 760], [400, 800], [1500, 750], [2600, 800], [P8.X1 + 100, 770]], 2000, ['#2f4d6a', '#1f3550'], 19);
  river(g, [[P8.X0, 960], [0, 930], [1500, 970], [P8.X1, 940]], 80, t);
  for (let i = 0; i < 22; i++) { const x = P8.X0 + 200 + i * 240, y = 1030 + (i % 4) * 12, on = .6 + .4 * lit; g.fillStyle = `rgba(255,205,125,${on})`; g.fillRect(x, y, 12, 10); }
  // the roof terrace with its parapet, chhatris and lanterns
  const roof = P2(q => q.rect(P8.X0 - 100, 1500, P8.X1 - P8.X0 + 200, 400)); paint(g, roof, '#d9c4a4', '#b0946e', 18, 2.4);
  const par = P2(q => q.rect(P8.X0 - 100, 1420, P8.X1 - P8.X0 + 200, 80)); paint(g, par, '#ead8bc', '#c3a37c', 10, 2.4);
  for (const x of [-1150, 3070]) { chhatri(g, x, 1420, 420, 3); }
  for (let k = 0; k < 6; k++) { const x = [-700, -350, 2270, 2620, -1450, 3380][k]; lantern(g, x, 1320, 1.4, clamp(lit * 1.4 - k * .1), t, k); }
  // the pavilion (baradari): a great cusped arch on pillars, leaf spandrels, a dome above
  const cx = 960, x0 = -10, x1 = 1930, spr = 250, top = -70, base = 1500;
  const body = P2(q => { q.rect(x0 - 100, -420, x1 - x0 + 200, base + 420); archPath(cx, base + 1, 1640, spr, top, 11, q); });
  g.fillStyle = '#efe2cf'; g.fill(body, 'evenodd'); rimShade(g, body, '#c3a37c', 26); ink(g, body, 3); maskErase(g, body);
  const sp = P2(q => { q.rect(x0, -300, x1 - x0, spr + 300); archPath(cx, spr, 1640, spr, top, 11, q); }); leaf(g, sp, [x0, -300, x1 - x0, spr + 300], { rule: 'evenodd', lw: 2.6, dim: .5 });
  g.save(); g.clip(sp, 'evenodd'); for (let k = 0; k < 2; k++) { const rx = k ? x1 - 160 : x0 + 160, ro = P2(q => star8(q, rx, -80, 70, .5)); paint(g, ro, VERM, VERM_D, 6, 2); pearls(g, rx, -80, 90, 16, 3.4, .9); } g.restore();
  for (const d of [-1, 1]) { const px = cx + d * 860; const pl = P2(q => q.rect(px - 60, spr, 120, base - spr)); paint(g, pl, '#f3e7d4', '#c9ab84', 12, 2.6); pearlLine(g, [[px, spr + 40], [px, base - 40]], 26, 3.4, .85); }
  const eave = P2(q => { q.moveTo(x0 - 160, -420); q.lineTo(x1 + 160, -420); q.lineTo(x1 + 60, -490); q.lineTo(x0 - 60, -490); q.closePath(); }); paint(g, eave, VERM, VERM_D, 8, 2.4);
  dome(g, cx, -490, 760, 520); for (const d of [-1, 1]) dome(g, cx + d * 880, -490, 200, 190);
  // the far edge of the floor inside the pavilion, a rug, two hanging lanterns
  const rug = P2(q => { q.moveTo(160, 1500); q.lineTo(1760, 1500); q.lineTo(1660, 1440); q.lineTo(260, 1440); q.closePath(); }); paint(g, rug, VERM, VERM_D, 8, 2); pearlLine(g, [[280, 1450], [1640, 1450]], 18, 2.6, .9);
  for (const d of [-1, 1]) lantern(g, cx + d * 640, 330, 1.6, clamp(lit * 1.3), t, d + 20);
}
function shot8(g, t) {
  const tb = t - CUT.s7b, lit = ss(seg(t, TOUCH, TOUCH + 4.2)), contact = [960, 920];
  // camera: the two-shot (7b), a push to the hands for the touch, then one long pull back to the whole painting
  let c;
  if (t < TOUCH - 1.0) c = { x: 960, y: 640, z: lz(1.0, 1.12, seg(t, CUT.s7b, TOUCH - 1.0)) };
  else if (t < TOUCH + .4) { const u = eio(seg(t, TOUCH - 1.0, TOUCH + .1)); c = { x: lerp(960, contact[0], u), y: lerp(640, contact[1] - 40, u), z: lz(1.12, 1.9, u) }; }
  else { const u = eio(seg(t, TOUCH + .4, 44.2)); c = { x: lerp(contact[0], (P8.X0 + P8.X1) / 2, u), y: lerp(contact[1] - 40, (P8.Y0 + P8.Y1) / 2, u), z: lz(1.9, W / (P8.X1 - P8.X0), u) }; }
  CAM = { ...c, r: 0 }; layer(g, 1);
  pavilionWorld(g, t, lit);
  medallion(g, contact[0], contact[1] - 260, 560, t);
  // the two of them inside the arch: her veil lifts on the unveiling line, eyes meet, smiles; at the hook their hands meet over the letter
  const veil = 1 - ss(seg(t, 35.15, 36.5)), meet = ss(seg(t, 36.3, 36.9)), hold = ss(seg(t, TOUCH - .9, TOUCH));
  const woman = drawWoman(g, 600, 1500, 2.0, { t, wind: .35, veil, gaze: .2 + .5 * meet, up: .1, smile: .15 + .55 * ss(seg(t, 36.8, 37.6)), head: .04,
    blink: Math.max(pulse(t, 36.95), pulse(t, 41.5)),
    arm: hold > 0 ? { kind: 'letter', k: hold } : { kind: 'unveil', k: ss(seg(t, 34.97, 35.3)) * (1 - ss(seg(t, 36.5, 37.1))), v: veil },
    letter: (g2, lx, ly) => { letter(g2, lx + 10, ly - 10, .6, 0, .2, 0, 3); return [lx + 10, ly - 10]; } });
  drawMan(g, 1330, 1500, 2.0, { t, dir: -1, wind: .3, gaze: .2 + .5 * meet, up: .12, smile: .1 + .6 * ss(seg(t, 37.0, 37.8)), head: .03, blink: pulse(t, 37.35),
    arm: hold > 0 ? { kind: 'offer', k: hold } : { kind: 'heart', k: ss(seg(t, 37.0, 37.6)) } });
  petals(g, t, P8.X0, P8.Y0, P8.X1, P8.Y1, Math.round(30 + 60 * lit), 71, .8 + lit * .6, 1.6 + lit);
  // the page border grows from the corners as the pull back ends
  border(g, P8.X0, P8.Y0, P8.X1, P8.Y1, P8.b, eo(seg(t, 43.3, 46.2)), t);
  // light: the touch (two rings from the hands), then a ring on each beat of the hook, a band at the close
  const lights = [{ type: 'r', x: 2700, y: -380, r: 1400, a: .45 }];
  for (let k = 0; k < 8; k++) { const t0 = B(46 + k), u = (t - t0) / 2.6; if (u > 0 && u < 1) lights.push({ type: 'o', x: contact[0], y: contact[1], rad: 40 + u * (900 + k * 380), w: 70 + k * 16, a: 1.5 * (1 - u) * (k < 2 ? 1.2 : 1) }); }
  if (t > TOUCH - .1) lights.push({ type: 'r', x: contact[0], y: contact[1], r: 600, a: 1.1 * ss(seg(t, TOUCH - .1, TOUCH + .3)) * (1 - .5 * ss(seg(t, 44, 47))) });
  lights.push({ type: 'r', x: 960, y: 600, r: 2600, a: .3 * lit });
  const band = seg(t, 45.2, 48.6); if (band > 0 && band < 1) lights.push({ type: 'b', x: lerp(P8.X0 - 600, P8.X1 + 600, eio(band)), y: 0, nx: .94, ny: -.34, w: 340, a: 1.1 * Math.sin(Math.PI * band) });
  if (t < TOUCH) { lights.push({ type: 'b', x: lerp(-300, 2300, seg(t, 35.2, 37.6)), y: 300, nx: 1, ny: .3, w: 180, a: .6 * Math.sin(Math.PI * seg(t, 35.2, 37.6)) }); }
  void woman; void tb;
  return { lights, amb: .07 + .1 * lit, night: .45 - .15 * lit, lamps: [] };
}

function medallion(g, cx, cy, R0, t) {   // laid at the touch: bole, then leaf springing out from the hands, a vermilion ring, punched rays, pearls
  const k = popS(seg(t, TOUCH - .15, TOUCH + .9), 1.1); if (k <= 0) return; const R = R0 * Math.min(1.08, k);
  const ring = P2(q => q.arc(cx, cy, R + 34, 0, TAU)); paint(g, ring, VERM, VERM_D, 10, 2.6);
  const disc = P2(q => q.arc(cx, cy, R, 0, TAU)); leaf(g, disc, [cx - R, cy - R, 2 * R, 2 * R], { lw: 2.6, rimW: 14, dim: .55 });
  g.save(); g.clip(disc); g.strokeStyle = 'rgba(100,54,6,.5)'; g.lineWidth = 3;
  for (let a = 0; a < 48; a++) { const an = a / 48 * TAU + t * .03; g.beginPath(); g.moveTo(cx + Math.cos(an) * R * .3, cy + Math.sin(an) * R * .3); g.lineTo(cx + Math.cos(an) * R * .94, cy + Math.sin(an) * R * .94); g.stroke(); }
  g.fillStyle = 'rgba(100,54,6,.55)'; for (const rr of [.32, .62, .9]) for (let a = 0; a < 90 * rr; a++) { const an = a / (90 * rr) * TAU; g.beginPath(); g.arc(cx + Math.cos(an) * R * rr, cy + Math.sin(an) * R * rr, 3, 0, TAU); g.fill(); }
  g.restore(); pearls(g, cx, cy, R + 17, 72, 4, .92);
  for (let a = 0; a < 12; a++) { const an = a / 12 * TAU; gpush(cx + Math.cos(an) * R * .7, cy + Math.sin(an) * R * .7, 90, 1); } gpush(cx, cy, 160, 1.2);
}
// ---------------------------------------------------------------- frame
const SHOTS = [[0, shot1], [CUT.s2, shot2], [CUT.s3, shot3], [CUT.s4, shot4], [CUT.s5, shot5], [CUT.s6, shot6], [CUT.s7, shot7], [CUT.s7b, shot8]];
function render(t) {
  t = clamp(t, 0, DUR - 1e-4); GP = [];
  let si = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i][0]) si = i;
  resetCtx(FRg); MCg.setTransform(1, 0, 0, 1, 0, 0); MCg.clearRect(0, 0, W, H); MK = { g: MCg, pre: new DOMMatrix(), col: '#fff' };
  FRg.setTransform(1, 0, 0, 1, 0, 0); FRg.fillStyle = ULTRA_D; FRg.fillRect(0, 0, W, H);
  DIM = 0; const S = SHOTS[si][1](FRg, t, t - SHOTS[si][0]); const M = layer(FRg, 1);
  // wipes: the dupatta sweep over the 2→3 cut (drawn in screen space; it occludes the gold behind it)
  const wu = seg(t, CUT.s3 - .55, CUT.s3 + .55); if (wu > 0 && wu < 1) { dupattaWipe(FRg, wu); MCg.setTransform(1, 0, 0, 1, 0, 0); MCg.save(); MCg.globalCompositeOperation = 'destination-out'; MCg.fillStyle = '#000'; const x = lerp(2600, -2600, wu); MCg.fillRect(x - 1150 + 0, -400, 2300, 1900); MCg.restore(); }
  FRg.setTransform(1, 0, 0, 1, 0, 0); FRg.save(); FRg.globalCompositeOperation = 'multiply'; FRg.globalAlpha = .12; FRg.fillStyle = FRg.createPattern(GRAINC, 'repeat'); FRg.fillRect(0, 0, W, H); FRg.restore();
  MK = null;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.drawImage(FR, 0, 0);
  if (S.night > 0) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = S.night; ctx.fillStyle = 'rgb(150,158,206)'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (S.lamps) { ctx.setTransform(M); ctx.globalCompositeOperation = 'screen'; for (const L of S.lamps) { const rr = 380, rg = ctx.createRadialGradient(L[0], L[1], 0, L[0], L[1], rr); rg.addColorStop(0, 'rgba(255,190,110,.3)'); rg.addColorStop(.4, 'rgba(220,150,80,.1)'); rg.addColorStop(1, 'rgba(200,140,80,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(L[0], L[1], rr, 0, TAU); ctx.fill(); } ctx.globalCompositeOperation = 'source-over'; ctx.setTransform(1, 0, 0, 1, 0, 0); }
  glintPass(M, S.lights, S.amb || 0); glowPass(.5); flashes(M, S.lights);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const v = ctx.createRadialGradient(W * .5, H * .45, H * .42, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, S.night > .3 ? 'rgba(10,12,40,.38)' : 'rgba(40,20,5,.22)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const fin = seg(t, 48.55, DUR), fi = 1 - seg(t, 0, .35); const k = Math.max(ss(fin), fi); if (k > 0) { ctx.fillStyle = `rgba(6,6,16,${k.toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
}

// ---------------------------------------------------------------- events (for the build log / QC; the soundtrack is the song itself)
function buildEvents() { const ev = []; const E = (t, type, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  Object.entries(CUT).forEach(([k, v]) => E(v, 'cut', { shot: k })); E(TOUCH, 'touch'); S3L.forEach((_, i) => E(B(14 + i), 'lantern', { i })); E(S6.land, 'letter_lands'); E(35.15, 'unveil'); E(43.3, 'border');
  return ev.sort((a, b) => a.t - b.t); }

(async () => {
  await Promise.all(['40px Fell', 'italic 40px FellI'].map(f => document.fonts.load(f, 'a')));
  GOLDC = makeGold(); GOLDF = makeGoldFine(512, 3, 1); GOLDFF = makeGoldFine(1024, 9, 1.6); SPKC = makeSpk(); GRAINC = makeGrain(); PAINTC = makePaint();
  FR = cnv(W, H); FRg = FR.getContext('2d'); MC = cnv(W, H); MCg = MC.getContext('2d', { willReadFrequently: true });
  window.DUR = DUR; window.render = render; window.EV = buildEvents(); window.TEXTS = () => [];
  render(Q.get('t') ? +Q.get('t') : 3); window.READY = true;
})();
