'use strict';
// आखिरी चिट्ठी — the seven scenes. Each is fn(c, t) drawing in screen space through its own camera; all pure functions of t.
// Narration starts (s): n1 1.0 · n3 8.8 · n4 13.6 · n6 23.8 · n7 28.5 · l1 36.8 · l2 44.6 · w1 53.2 · f1 57.4 · f2 62.0 · f3 66.9
const T = { s2: 8.0, s2b: 12.9, s2c: 14.6, s3: 16.6, s3b: 20.4, s4: 23.4, s4b: 28.0, s5: 33.8, mistIn: 39.4, mem: 40.6, mem2: 45.4, mistOut: 49.8, s6: 51.0, s7: 57.2, photo: 61.0, alive: 67.4, title: 72.2, end: 75.0 };
const pulse = (t, c, w = .08) => Math.exp(-((t - c) / w) * ((t - c) / w));
const blinkAt = (t, list) => Math.max(0, ...list.map(b => pulse(t, b)));
function cam(c, cx, cy, z, k = 1, bx = 960, by = 540) { const zz = Math.exp(Math.log(z) * k); c.setTransform(zz, 0, 0, zz, W / 2 - (bx + (cx - bx) * k) * zz, H / 2 - (by + (cy - by) * k) * zz); }
const ADDRESS = ['सेवा में,', 'सरला बिटिया', 'पीपल के पेड़ वाला घर,', 'सुंदरपुर'];
const LETTER = ['बेटी,', 'जिस दिन तुम अपना नया घर बसाने जाओगी,', 'उस दिन मेरा घर थोड़ा खाली हो जाएगा।', 'लेकिन याद रखना,', 'तुम्हारे लिए इस घर का दरवाज़ा', 'हमेशा खुला रहेगा।', '— तुम्हारे बाबूजी'];

// ---------------------------------------------------------------- the envelope (shared by every close-up)
function envelope(c, x, y, s, a, o = {}) {   // aged envelope: o.back (flap side), o.flap (0 closed .. 1 open), o.addr (address drawn)
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s * (o.flipX ?? 1), s);
  const body = wash(c, [[-170, -105], [170, -105], [170, 105], [-170, 105]], '#e6d0a0', { a: .85, raw: true, edge: .55, ew: 14, line: '#7a6040', lw: 2.4, seed: 1001 });
  c.save(); c.clip(body); for (let k = 0; k < 5; k++) softDot(c, -150 + hash(k) * 300, -90 + hash(k * 3) * 180, 30 + hash(k * 7) * 40, '#b08a50', .25, 'multiply'); c.restore();   // foxing stains
  wash(c, [[150, -105], [170, -105], [170, -80]], '#cdb488', { a: .8, raw: true, seed: 1002 });   // a torn corner
  if (o.back) { const fl = o.flap || 0, fy = lerp(10, -200, fl);
    wash(c, [[-170, -105], [0, fy], [170, -105]], '#dcc492', { a: .85, raw: true, line: '#7a6040', lw: 2, seed: 1003 });
    stroke(c, [[-170, 105], [0, 0], [170, 105]], 1.6, '#9a8058', { a: .5, seed: 1004 }); }
  else if (o.addr !== false) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(40,40,80,.82)'; c.font = '27px Kalam'; c.textBaseline = 'middle';
    ADDRESS.forEach((s, i) => c.fillText(s, -60 + (i === 0 ? -30 : 0), -40 + i * 34)); c.restore();
    wash(c, [[102, -92], [152, -92], [152, -30], [102, -30]], '#a8c0a8', { a: .8, raw: true, line: '#5a6a5a', lw: 1.4, seed: 1005 });   // a faded stamp
    softDot(c, 127, -61, 14, '#7a5a8a', .4, 'multiply');
    c.save(); c.strokeStyle = 'rgba(192,64,46,.6)'; c.lineWidth = 2.4; c.beginPath(); c.arc(84, -48, 30, 0, TAU); c.stroke(); c.beginPath(); c.arc(84, -48, 21, 0, TAU); c.stroke();
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(118, -66 + k * 12); c.bezierCurveTo(140, -76 + k * 12, 160, -56 + k * 12, 190, -66 + k * 12); c.stroke(); } c.restore();
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(192,64,46,.6)'; c.font = '11px KalamB'; c.textAlign = 'center'; c.fillText('सुंदरपुर', 84, -50); c.fillText('२००५', 84, -38); c.restore(); }
  c.restore();
}
function letterSheet(c, x, y, s, a, o = {}) {   // the unfolded letter: o.unfold 0..1, o.write 0..1 (lines appear), o.lit (golden light band position)
  const uf = o.unfold ?? 1, hgt = 330 * lerp(.33, 1, ss(uf));
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  const p = wash(c, [[-250, -hgt], [250, -hgt], [250, hgt], [-250, hgt]], '#efe2c4', { a: .8, raw: true, edge: .45, ew: 16, line: '#8a7050', lw: 2.2, seed: 1010 });
  c.save(); c.clip(p); for (const f of [-1 / 3, 1 / 3]) stroke(c, [[-250, f * hgt * 2], [250, f * hgt * 2]], 2, '#b8a07a', { a: .5, seed: 1011 }); for (let k = 0; k < 4; k++) softDot(c, -200 + hash(k + 9) * 400, -hgt + hash(k * 5) * 2 * hgt, 40, '#c0a060', .2, 'multiply');
    if (uf > .85) { c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(36,32,70,.86)'; c.font = '25px Kalam'; c.textBaseline = 'middle';
      LETTER.forEach((s, i) => { c.save(); c.beginPath(); const k = clamp((o.write ?? 1) * LETTER.length - i); c.rect(-230, -hgt + 46 + i * 46 - 22, 470 * k, 44); c.clip(); c.fillText(s, -220 + (i === LETTER.length - 1 ? 200 : 0), -hgt + 46 + i * 46); c.restore(); }); }
    if (o.lit != null) { c.globalCompositeOperation = 'screen'; const lx = lerp(-500, 500, o.lit), g = c.createLinearGradient(lx - 160, 0, lx + 160, 0); g.addColorStop(0, 'rgba(255,214,140,0)'); g.addColorStop(.5, 'rgba(255,214,140,.35)'); g.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = g; c.fillRect(-260, -hgt, 520, hgt * 2); }
  c.restore(); c.restore();
}

// ============================================================== S1 — the old village at sunset (0 – 8)
function scene1(c, t) {
  const px = 380 + 760 * eo(clamp(t / 7.6)) * .98, walking = t < 7.3, ph = (px - 380) / 62;
  const cx = lerp(820, 1120, ss(t / 8)), z = lerp(1.0, 1.06, ss(t / 8));
  cam(c, cx, 560, z, .15); skyWash(c, -400, -200, 2400, 900, [[0, '#b9cddc'], [.45, '#ead2b0'], [.8, '#f2c08a'], [1, '#f0b07a']]);
  cam(c, cx, 560, z, .2); sunGlow(c, 260, 600, 60, 1);
  for (const [x, y, w, sp, sd] of [[300, 210, 520, 6, 1], [1200, 150, 640, 4, 2], [1900, 260, 480, 7, 3]]) cloudWash(c, x - t * sp, y, w, 50, '#d8a49a', .35, sd);
  cam(c, cx, 560, z, .45);
  wash(c, [[-300, 700], [-300, 640], [200, 630], [520, 610], [560, 520], [600, 610], [1100, 640], [1500, 620], [2300, 650], [2300, 700]], '#b8a6b4', { a: .45, edge: .25, seed: 1101 });   // far trees + a temple spire
  wash(c, [[530, 615], [545, 560], [560, 500], [575, 560], [590, 615]], '#a08ea0', { a: .55, raw: true, seed: 1102 });
  cam(c, cx, 560, z, 1);
  // street, houses, the peepal at the end; long blue shadows to the right
  wash(c, [[-400, 800], [2600, 800], [2600, 1300], [-400, 1300]], '#e2c08a', { a: .6, raw: true, edge: .2, seed: 1103 });
  const H1 = [[-220, 220, 250, 1], [60, 260, 300, 2], [380, 240, 230, 3], [660, 300, 280, 4], [1000, 220, 260, 5], [1260, 260, 240, 6]];
  for (const [x, w, h, sd] of H1) house(c, x, 812, w, h, { seed: sd, flat: sd % 2 === 0, dx: .2 + hash(sd) * .3, wx: .62, lit: sd === 4 && t > 4 });
  // the old wooden postbox on the last wall (where he stops)
  wash(c, [[1440, 700], [1480, 700], [1480, 760], [1440, 760]], '#6a4a2e', { a: .9, raw: true, line: '#3a2618', lw: 1.6, seed: 1104 });
  peepal(c, 1840, 820, .8, t, { leaves: 700 });
  for (const [x, w, h] of H1) longShadow(c, [[x + w, 812], [x + w + 300, 812], [x + w + 380, 900], [x + w + 40, 900]], .18);
  // birds returning to the peepal
  flock(c, t, 300, 200, 150, 30, 1.3, 7, 3); flock(c, t, -200, 340, 190, 10, 1, 5, 7);
  // the postman walking down the street, his shadow long to the right
  longShadow(c, [[px - 30, 958], [px + 340, 940], [px + 360, 975], [px - 10, 975]], .28);
  drawPostman(c, px, 965, .62, { t, phase: ph, walk: walking ? 1 : 0, e: { blink: blinkAt(t, [2.4, 5.9]) }, bagTilt: 0 });
  dust(c, t, 200, 500, 1800, 1000, 50, 11, .9);
  cam(c, cx, 560, z, 1.5); for (let i = 0; i < 6; i++) { const gx = -300 + i * 420; stroke(c, [[gx, 1150], [gx + 10 + Math.sin(t * 1.4 + i) * 8, 1080], [gx + 22 + Math.sin(t * 1.4 + i) * 14, 1030]], 7, '#8a8a4a', { prof: 'tip', a: .6, seed: 1110 + i }); }
}

// ============================================================== S2 — the forgotten letter (8.0 – 16.6)
function scene2(c, t) {
  if (t < T.s2b) { // a) the old wooden postbox; his hand opens it, reaches in, finds the envelope wedged in a crack, pulls it out
    const lt = t - T.s2, z = lerp(1.0, 1.18, ss(lt / 4.9)); cam(c, 960, 540, z);
    wash(c, [[-200, -200], [2200, -200], [2200, 1300], [-200, 1300]], '#e8d6b4', { a: .7, raw: true, edge: 0, seed: 1201 });   // lime wall
    for (let k = 0; k < 7; k++) stroke(c, [[100 + k * 260, 100 + hash(k) * 600], [130 + k * 260, 220 + hash(k) * 600], [120 + k * 260, 300 + hash(k) * 600]], 2, '#a48c6a', { a: .4, seed: 1202 + k });
    shafts(c, -200, -100, .45, .5, 2200, 6, .35, t, 3);
    const bx = 760, by = 300, bw = 520, bh = 520;
    wash(c, [[bx - 20, by + bh + 30], [bx + bw + 20, by + bh + 30], [bx + bw + 60, by + bh + 160], [bx - 60, by + bh + 160]], '#8a7a8a', { a: .25, raw: true, edge: 0, seed: 1203 });   // shadow
    wash(c, [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], '#7a5636', { a: .9, raw: true, edge: .6, ew: 18, line: '#3a2618', lw: 3, seed: 1204 });
    for (let k = 1; k < 5; k++) stroke(c, [[bx + 6, by + k * bh / 5], [bx + bw - 6, by + k * bh / 5 + 4]], 2, '#4a3220', { a: .5, seed: 1205 + k });   // planks
    wash(c, [[bx + 120, by + 60], [bx + 400, by + 60], [bx + 400, by + 84], [bx + 120, by + 84]], '#1e140c', { a: .9, raw: true, seed: 1210 });   // slot
    c.save(); c.globalCompositeOperation = 'multiply'; c.font = '34px KalamB'; c.fillStyle = 'rgba(240,226,190,.0)'; c.restore();
    c.save(); c.fillStyle = 'rgba(232,214,170,.85)'; c.font = '38px KalamB'; c.textAlign = 'center'; c.fillText('पत्र', bx + bw / 2, by + 140); c.restore();
    // the small door (hinged on the left) swings open 8.6–9.4; the dark inside, a crack at the back with an envelope corner
    const op = ss(seg(t, 8.6, 9.4)), dx0 = bx + 70, dy0 = by + 190, dw = 380, dh = 290;
    wash(c, [[dx0, dy0], [dx0 + dw, dy0], [dx0 + dw, dy0 + dh], [dx0, dy0 + dh]], '#24180e', { a: .92, raw: true, edge: .3, seed: 1211 });
    stroke(c, [[dx0 + 40, dy0 + 140], [dx0 + 200, dy0 + 128], [dx0 + 340, dy0 + 150]], 3, '#0e0805', { a: .9, seed: 1212 });
    const pulled = ss(seg(t, 12.0, 12.85)), found = seg(t, 11.0, 11.9);
    if (pulled < 1) envelope(c, lerp(dx0 + 210, dx0 + 260, pulled), lerp(dy0 + 150, dy0 - 40, pulled) , lerp(.55, .8, pulled), lerp(-.12, .1, pulled), { addr: false });
    softDot(c, dx0 + 210, dy0 + 150, 140, '#3a2a18', .5 * (1 - found), 'multiply');   // in shadow until the hand's light finds it
    const dw2 = dw * Math.cos(op * 1.35);
    if (dw2 > 2) { wash(c, [[dx0, dy0 - 4], [dx0 + dw2, dy0 - 4 - 20 * op], [dx0 + dw2, dy0 + dh + 4 + 20 * op], [dx0, dy0 + dh + 4]], '#8a6440', { a: .92, raw: true, edge: .5, line: '#3a2618', lw: 2.4, seed: 1213 });
      softDot(c, dx0 + dw2 * .85, dy0 + dh / 2, 10, '#c8a040', .9, 'multiply'); }
    for (const yy of [dy0 + 30, dy0 + dh - 50]) wash(c, [[dx0 - 16, yy], [dx0 + 24, yy], [dx0 + 24, yy + 22], [dx0 - 16, yy + 22]], '#3a3430', { a: .9, raw: true, seed: 1214 + yy });   // iron hinges
    // dust falling as the envelope comes loose
    if (t > 11.9) for (let i = 0; i < 40; i++) { const k = (t - 11.9) * (.6 + hash(i)), x = dx0 + 180 + (hash(i * 3) - .5) * 220, y = dy0 + 150 + k * 140 + hash(i * 7) * 30; if (y < dy0 + 600) softDot(c, x + Math.sin(k * 3 + i) * 10, y, 2.4, '#fff1cc', .7 * (1 - k / 3), 'screen'); }
    dust(c, t, 0, 0, 1920, 1080, 40, 21, .8);
    // his hand: in from the right; opens the latch, reaches in, pinches, pulls it out
    const reach = ss(seg(t, 8.3, 8.7)) * (1 - ss(seg(t, 9.3, 9.6))) , inn = ss(seg(t, 9.8, 11.2)), out = pulled;
    const hx = lerp(lerp(1500, dx0 + dw - 10, reach), dx0 + 300, inn) + out * 60, hy = lerp(lerp(900, dy0 + dh / 2, reach), dy0 + 170, inn) - out * 190;
    if (t > 8.2) handR(c, hx, hy, 1.25, Math.PI + lerp(.25, .05, inn), { who: 'post', curl: lerp(.3, .15, inn) + .3 * ss(seg(t, 11.7, 11.95)), pinch: ss(seg(t, 11.6, 11.95)), sleeve: '#c9b07c', flipY: true });
    if (out > 0) envelope(c, hx - 150, hy - 20, .8, .1 - out * .1, { addr: false });
    return;
  }
  if (t < T.s2c) { // b) his face: curiosity; he turns the envelope over
    const lt = t - T.s2b; cam(c, 960, 540, lerp(1.0, 1.06, lt / 1.7));
    wash(c, [[-200, -200], [2200, -200], [2200, 1300], [-200, 1300]], '#ecd8b2', { a: .65, raw: true, edge: 0, seed: 1220 }); shafts(c, -100, 0, .5, .4, 2000, 5, .4, t, 4);
    c.save(); c.translate(780, 520); c.scale(3.0, 3.0); bustP(c, 'post', { breath: Math.sin(t * 1.5) * 2 }); headP(c, 'post', { brow: .3 + .7 * ss(seg(t, 13.6, 14.0)), open: .4 * ss(seg(t, 13.6, 14.0)), gaze: .6, down: .25, blink: blinkAt(t, [13.2]) }); c.restore();
    c.save(); c.translate(960, 520); c.scale(3.0, 3.0); c.restore();
    const turn = seg(t, 13.1, 13.9), sx = Math.cos(turn * Math.PI); envelope(c, 1340, 640, .9, -.08, { flipX: Math.abs(sx) < .02 ? .02 : sx, back: sx < 0, addr: sx >= 0 });
    handR(c, 1560, 780, 1.6, Math.PI * .95, { who: 'post', curl: .45, pinch: .6, sleeve: '#c9b07c', flipY: true });
    dust(c, t, 0, 0, 1920, 1080, 30, 22, .7); return;
  }
  // c) the address, close: the light sweeps across "पीपल के पेड़ वाला घर"
  const lt = t - T.s2c; cam(c, lerp(980, 1020, ss(lt / 2)), lerp(560, 580, ss(lt / 2)), lerp(1.0, 1.35, ss(lt / 2)));
  wash(c, [[-200, -200], [2200, -200], [2200, 1300], [-200, 1300]], '#c9b08a', { a: .5, raw: true, edge: 0, seed: 1230 });
  envelope(c, 960, 560, 2.6, -.04, {});
  handR(c, 1560, 860, 1.8, Math.PI * .92, { who: 'post', curl: .3, pinch: .5, sleeve: '#c9b07c', flipY: true });
  shafts(c, lerp(-300, 1200, seg(t, 14.8, 16.6)), -200, 1.2, .25, 1800, 3, .45, t, 5);
}

// ============================================================== S3 — the journey (16.6 – 23.4)
function scene3(c, t) {
  if (t < T.s3b) { // a) a narrow lane, seen from behind him; the peepal and the old house at its end; the low sun ahead throws his shadow back at us
    const lt = t - T.s3, u = lt / 3.8; cam(c, 960, 540, lerp(1.0, 1.12, ss(u)));
    skyWash(c, -200, -200, 2200, 700, [[0, '#d6c8c4'], [.6, '#f2d0a0'], [1, '#f6c48a']]);
    const VP = [960, 560];
    sunGlow(c, 960, 520, 50, 1);
    peepal(c, 1060, 600, .42, t, { leaves: 520 });
    house(c, 860, 610, 200, 120, { seed: 31, dx: .4, wx: .75, doorC: '#3f5f86' });
    // the lane walls on both sides, receding to the vanishing point
    for (const d of [-1, 1]) { for (let k = 0; k < 4; k++) { const u0 = k / 4, u1 = (k + 1) / 4, X = u => VP[0] + d * lerp(1300, 140, u), Ytop = u => lerp(-200, 470, u), Ybot = u => lerp(1300, 640, u);
        wash(c, [[X(u0), Ytop(u0)], [X(u1), Ytop(u1)], [X(u1), Ybot(u1)], [X(u0), Ybot(u0)]], k % 2 ? '#e6d2ae' : '#ead8b8', { a: .75, raw: true, edge: .4, line: '#8a6e4e', lw: 2, seed: 1300 + k + (d > 0 ? 10 : 0) });
        const dxw = X((u0 + u1) / 2), dyw = lerp(Ybot(u0), Ybot(u1), .5); wash(c, [[dxw - d * 30 * (1 - u0), dyw], [dxw - d * 30 * (1 - u0), dyw - 260 * (1 - u0 * .8)], [dxw + d * 60 * (1 - u0), dyw - 250 * (1 - u0 * .8)], [dxw + d * 60 * (1 - u0), dyw]], k % 2 ? '#3f5f86' : '#7a4a2e', { a: .85, raw: true, seed: 1320 + k + (d > 0 ? 10 : 0) }); } }
    wash(c, [[VP[0] - 140, 640], [VP[0] + 140, 640], [2400, 1300], [-500, 1300]], '#e2c08a', { a: .6, raw: true, edge: .2, seed: 1340 });
    for (let k = 0; k < 4; k++) { const pp = [lerp(-200, 840, k / 4) + 60, lerp(1150, 700, k / 4)]; wash(c, [[pp[0], pp[1]], [pp[0] + 50, pp[1]], [pp[0] + 46, pp[1] - 60], [pp[0] + 4, pp[1] - 60]], '#b0613e', { a: .8, raw: true, line: '#5a2c1a', lw: 1.6, seed: 1350 + k }); }   // clay pots
    // him from behind, walking away; scale shrinks with distance
    const d = ss(u) * .9 + u * .1, fy = lerp(1060, 760, d), sc = lerp(1.0, .42, d), ph = lt * 4.6;
    longShadow(c, [[960 - 30 * sc, fy], [960 + 30 * sc, fy], [960 + 160, 1300], [960 - 160, 1300]], .25);
    drawPostman(c, 960, fy, sc, { t, view: 'back', phase: ph, walk: 1 });
    for (let i = 0; i < 6; i++) { const k = ((t * .25 + i / 6) % 1); peepalLeaf(c, 600 + i * 160 + Math.sin(k * 8 + i) * 40, lerp(-50, 1100, k), 1.2, k * 9 + i, '#8a9a4a', t * 3 + i); }   // drifting leaves
    dust(c, t, 300, 300, 1600, 1000, 50, 31, 1); return;
  }
  // b) the house beside the great peepal; he walks up to its door
  const lt = t - T.s3b, z = lerp(1.0, 1.12, ss(lt / 3)); cam(c, lerp(900, 1000, ss(lt / 3)), 540, z);
  skyWash(c, -200, -200, 2200, 760, [[0, '#cfc6cc'], [.6, '#efcfa2'], [1, '#f3c189']]);
  sunGlow(c, 1700, 600, 50, .9); cloudWash(c, 1300 - lt * 6, 180, 600, 50, '#d8a49a', .3, 9);
  wash(c, [[-300, 1300], [-300, 760], [2300, 760], [2300, 1300]], '#e0bf8a', { a: .6, raw: true, edge: .2, seed: 1360 });
  house(c, 820, 790, 640, 360, { seed: 41, dx: .42, wx: .74, doorC: '#3f5f86', roof: '#a85a3a' });
  wash(c, [[1150, 790], [1300, 790], [1290, 740], [1160, 740]], '#cfa070', { a: .8, raw: true, line: '#6a4a30', lw: 1.6, seed: 1361 });   // tulsi platform
  for (let k = 0; k < 9; k++) stroke(c, [[1225, 740], [1225 + (k - 4) * 9 + Math.sin(t * 2 + k) * 3, 690 - Math.abs(k - 4) * 5]], 3, '#5a7a3a', { prof: 'tip', a: .8, seed: 1362 + k });
  peepal(c, 420, 800, 1.05, t, { leaves: 950 });
  flock(c, lt, 1800, 300, -160, 20, 1.2, 5, 9);
  const px = lerp(-150, 1000, ss(seg(t, T.s3b, 23.0)) * .96 + seg(t, T.s3b, 23.0) * .04), walking = t < 22.85;
  longShadow(c, [[px - 30, 900], [px - 360, 880], [px - 380, 915], [px - 10, 915]], .25);
  drawPostman(c, px, 905, .72, { t, phase: (px + 150) / 70, walk: walking ? 1 : 0, e: { gaze: .3, blink: blinkAt(t, [21.5]) } });
  dust(c, t, 0, 300, 1920, 1000, 40, 41, .9);
}

// ============================================================== the room (S4, S6, S7): window on the left (sunset), Amma by it facing left, the doorway at the back right
const ROOM = { amma: [800, 940, .92], table: [590, 650], door: [1440, 1700], post: [1570, 930, .72] };
function room(c, t, o = {}) {
  wash(c, [[-300, -300], [2300, -300], [2300, 820], [-300, 820]], '#e6cfa8', { a: .72, raw: true, edge: 0, seed: 1400 });   // walls, warm
  wash(c, [[-300, 820], [2300, 820], [2300, 1400], [-300, 1400]], '#b98a5c', { a: .65, raw: true, edge: 0, seed: 1401 });  // floor
  for (let k = 0; k < 9; k++) stroke(c, [[-300 + k * 300, 820], [-500 + k * 340, 1400]], 1.6, '#8a6440', { a: .3, seed: 1402 + k });
  stroke(c, [[-300, 820], [2300, 820]], 3, '#6a4a2e', { a: .6, seed: 1411 });
  // shelf with brass pots, a calendar, a wall clock ticking
  wash(c, [[1000, 360], [1340, 360], [1340, 380], [1000, 380]], '#7a5636', { a: .9, raw: true, line: '#3a2618', lw: 1.6, seed: 1412 });
  for (let k = 0; k < 3; k++) wash(c, [[1030 + k * 100, 360], [1030 + k * 100, 310], [1060 + k * 100, 290], [1090 + k * 100, 310], [1090 + k * 100, 360]], '#c8963c', { a: .85, line: '#6a4a20', lw: 1.4, seed: 1413 + k });
  const ck = [1180, 200]; wash(c, [[ck[0] - 46, ck[1] - 46], [ck[0] + 46, ck[1] - 46], [ck[0] + 46, ck[1] + 46], [ck[0] - 46, ck[1] + 46]], '#efe2c4', { a: .8, line: '#5a3a26', lw: 2, seed: 1416, k: 1 });
  const sec = Math.floor(t) / 60 * TAU; stroke(c, [[ck[0], ck[1]], [ck[0] + Math.sin(sec) * 34, ck[1] - Math.cos(sec) * 34]], 1.6, '#3a2618', { raw: true, a: .9, seed: 1417 }); stroke(c, [[ck[0], ck[1]], [ck[0] + 22, ck[1] - 10]], 3, '#3a2618', { raw: true, a: .9, seed: 1418 });
  // the doorway at the back right: bright evening outside
  const D = ROOM.door; wash(c, [[D[0], 820], [D[0], 300], [D[1], 300], [D[1], 820]], '#f6dcae', { a: .5, raw: true, edge: .4, line: '#5a3a26', lw: 3, seed: 1419 });
  wash(c, [[D[0] + 20, 820], [D[0] + 20, 700], [D[1] - 20, 690], [D[1] - 20, 820]], '#e0b880', { a: .5, raw: true, edge: 0, seed: 1420 });
  wash(c, [[D[0] - 30, 830], [D[0] - 30, 280], [D[0], 280], [D[0], 830]], '#7a5636', { a: .9, raw: true, line: '#3a2618', lw: 1.6, seed: 1421 }); wash(c, [[D[1], 830], [D[1], 280], [D[1] + 30, 280], [D[1] + 30, 830]], '#7a5636', { a: .9, raw: true, line: '#3a2618', lw: 1.6, seed: 1422 });
  // the window: wooden frame, bars, shutters open, a thin curtain moving; low sun behind it
  const wx0 = 120, wx1 = 470, wy0 = 260, wy1 = 640;
  wash(c, [[wx0, wy1], [wx0, wy0], [wx1, wy0], [wx1, wy1]], '#f7d9a0', { a: .45, raw: true, edge: .3, seed: 1430 }); sunGlow(c, 300, 520, 50, .9);
  for (let k = 1; k < 5; k++) stroke(c, [[wx0 + k * (wx1 - wx0) / 5, wy0], [wx0 + k * (wx1 - wx0) / 5, wy1]], 6, '#3a2618', { raw: true, a: .85, seed: 1431 + k });
  for (const [a0, a1] of [[wx0 - 120, wx0], [wx1, wx1 + 110]]) wash(c, [[a0, wy1 + 20], [a0, wy0 - 20], [a1, wy0], [a1, wy1]], '#6a4a2e', { a: .9, raw: true, line: '#3a2618', lw: 1.6, seed: 1436 + a0 });
  wash(c, [[wx0 - 20, wy0 - 30], [wx1 + 20, wy0 - 30], [wx1 + 20, wy0], [wx0 - 20, wy0]], '#5a3a26', { a: .9, raw: true, seed: 1438 }); wash(c, [[wx0 - 40, wy1], [wx1 + 40, wy1], [wx1 + 30, wy1 + 24], [wx0 - 30, wy1 + 24]], '#7a5636', { a: .9, raw: true, line: '#3a2618', lw: 1.6, seed: 1439 });
  const cur = []; for (let i = 0; i <= 10; i++) { const v = i / 10; cur.push([wx1 - 30 + Math.sin(t * 1.6 - v * 3) * 16 * v + v * 30 * Math.sin(t * .7), wy0 + v * (wy1 - wy0 + 40)]); }
  c.save(); c.globalAlpha = .55; wash(c, [...cur, ...cur.slice().reverse().map(([x, y]) => [x + 70 + Math.sin(t * 1.2 + y * .01) * 10, y])], '#efe6d6', { a: .5, raw: true, edge: .3, seed: 1440 }); c.restore();
  shafts(c, 300, 450, .22, .45, 1500, 7, .42, t, 7);
  // the table by the window: the old photograph in a wooden frame, a brass lamp, the letter (when placed)
  const TB = ROOM.table; wash(c, [[TB[0] - 130, TB[1]], [TB[0] + 130, TB[1]], [TB[0] + 130, TB[1] + 20], [TB[0] - 130, TB[1] + 20]], '#7a5636', { a: .9, raw: true, line: '#3a2618', lw: 1.8, seed: 1450 });
  for (const xx of [TB[0] - 115, TB[0] + 105]) wash(c, [[xx, TB[1] + 20], [xx + 12, TB[1] + 20], [xx + 12, 940], [xx, 940]], '#6a4a2e', { a: .9, raw: true, seed: 1451 + xx });
  photoFrame(c, TB[0] - 30, TB[1] - 4, .5, t, o.photo || {});
  wash(c, [[TB[0] + 70, TB[1]], [TB[0] + 110, TB[1]], [TB[0] + 100, TB[1] - 20], [TB[0] + 80, TB[1] - 20]], '#c8963c', { a: .9, line: '#6a4a20', lw: 1.4, seed: 1453 });
  if (o.letterOnTable) envelope(c, TB[0] + 76, TB[1] - 26, .22, -.35, { addr: true });
  dust(c, t, 100, 200, 1300, 900, 70, 51, 1);
}
// the photograph: a carved frame; inside, sepia: the young Sarla beside her father; o.alive animates it (colour, a look, a smile)
function photoFrame(c, x, y, s, t, o = {}) {
  const al = o.alive || 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  wash(c, [[-110, 0], [-110, -300], [110, -300], [110, 0]], '#5a3a22', { a: .92, raw: true, edge: .5, line: '#2a1a10', lw: 2.4, seed: 1500 });
  const inner = wash(c, [[-88, -22], [-88, -278], [88, -278], [88, -22]], mixc('#d8c09a', '#efe2c8', al), { a: .85, raw: true, edge: .45, seed: 1501 });
  c.save(); c.clip(inner);
  // the two of them: front view, formal; after "alive", they turn to each other and smile
  const look = ss(seg(o.lt ?? 0, .8, 2.0)) * al;
  c.save(); c.translate(-38, -40); c.scale(.36, .36);
  wash(c, [[-60, -40], [60, -40], [70, 0], [-70, 0]], mixc('#9a7a5a', '#c0302a', al), { a: .85, raw: true, seed: 1502 });
  wash(c, [[-60, -260], [60, -260], [70, -40], [-70, -40]], mixc('#9a7a5a', '#c0302a', al), { a: .85, raw: true, line: LINE, lw: 2, seed: 1503 });
  c.translate(0, -340); headF(c, 'bride', { gaze: look * 1.5, smile: .3 + .6 * look }); c.restore();
  c.save(); c.translate(40, -40); c.scale(.38, .38);
  wash(c, [[-64, -280], [64, -280], [70, 0], [-70, 0]], mixc('#c8b8a0', '#f0e8d8', al), { a: .85, raw: true, line: LINE, lw: 2, seed: 1504 });
  wash(c, [[-64, -280], [10, -280], [-20, -120], [-64, -150]], mixc('#8a7058', '#8a6a48', al), { a: .85, raw: true, seed: 1505 });
  c.translate(0, -360); headF(c, 'babu', { gaze: -look * 1.5, smile: .2 + .7 * look }); c.restore();
  if (al < 1) { c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(176,140,100,${.35 * (1 - al)})`; c.fillRect(-90, -280, 180, 260); }
  c.restore();
  for (let k = 0; k < 6; k++) softDot(c, -100 + k * 40, -296, 3, '#8a6a40', .7, 'multiply');
  c.restore();
}
// ============================================================== S4 — the woman (23.4 – 33.8)
function scene4(c, t) {
  if (t < T.s4b) { // a) the room: she sits by the window; the postman appears in the doorway; she turns her head; he steps in and offers the letter
    const lt = t - T.s4; cam(c, lerp(900, 980, ss(lt / 4.6)), 560, lerp(1.0, 1.08, ss(lt / 4.6)));
    room(c, t);
    const turn = ss(seg(t, 25.8, 26.7)) * 2;
    const step = ss(seg(t, 26.6, 27.4)), pin = ss(seg(t, 25.2, 25.7));
    if (t > 25.0) { const px = lerp(1640, 1570, pin) - step * 340; drawPostman(c, px, 930, .72, { t, dir: -1, phase: (t - 25) * 4.2, walk: t < 25.7 || (t > 26.6 && t < 27.4) ? 1 : 0, arm: t > 26.8 ? { near: [lerp(10, 170, ss(seg(t, 26.9, 27.6))), lerp(216, 30, ss(seg(t, 26.9, 27.6)))] } : null, holdEnv: t > 26.9, e: { smile: .2 } }); }
    drawAmma(c, ROOM.amma[0], ROOM.amma[1], ROOM.amma[2], { t, dir: -1, headTurn: turn, e: { blink: blinkAt(t, [24.6, 27.9]), gaze: .2 }, arms: 'reach', k: ss(seg(t, 27.3, 27.9)) * 0 });
    return;
  }
  // b) the handover in close-up, then up to her face: she reads the handwriting, recognises it; her eyes fill
  const lt = t - T.s4b;
  if (t < 29.4) { cam(c, 960, 540, lerp(1.0, 1.05, lt / 1.4));
    wash(c, [[-200, -200], [2200, -200], [2200, 1300], [-200, 1300]], '#d8b88c', { a: .6, raw: true, edge: 0, seed: 1600 }); shafts(c, -200, 100, .25, .4, 2200, 5, .4, t, 8);
    const give = ss(seg(t, 28.0, 28.7)), take = ss(seg(t, 28.5, 29.0));
    envelope(c, lerp(760, 960, give), 520, .9, -.06, {});
    handR(c, lerp(560, 760, give) - take * 60, 560, 1.6, 0, { who: 'post', curl: .3, pinch: .7 * (1 - take), sleeve: '#c9b07c' });
    handR(c, lerp(1500, 1170, take), 470, 1.55, Math.PI + .2, { who: 'amma', curl: .25 + .2 * take, old: true, bangle: 'gold', sleeve: '#7a2a2a', flipY: true });
    handR(c, lerp(1500, 1180, take), 640, 1.55, Math.PI - .25, { who: 'amma', curl: .3 + .2 * take, old: true, bangle: 'gold', sleeve: '#7a2a2a' });
    dust(c, t, 0, 0, 1920, 1080, 40, 61, .8); return; }
  cam(c, 980, 520, lerp(1.0, 1.15, ss(seg(t, 29.4, 33.8))));
  wash(c, [[-200, -200], [2200, -200], [2200, 1300], [-200, 1300]], '#e2c49a', { a: .6, raw: true, edge: 0, seed: 1601 }); shafts(c, -300, 100, .2, .35, 2400, 5, .4, t, 9);
  const rec = ss(seg(t, 30.4, 31.2)), wet = ss(seg(t, 31.4, 33.0));
  c.save(); c.translate(1150, 470); c.scale(-3.4, 3.4); bustP(c, 'amma', { breath: Math.sin(t * 1.3) * 2.5 }); headP(c, 'amma', { down: .9 - .6 * rec, open: .5 * rec, brow: .4 * rec, worry: .2 + .7 * wet, wet, tear: seg(t, 32.6, 33.8), mouth: .25 * rec * (1 - wet), blink: blinkAt(t, [29.8, 31.9]), sad: .3 * wet });
  // the pallu over her head, close
  pallu(c, Math.sin(t * 1.3) * 2.5); c.restore();
  envelope(c, 760, 960, 1.1, .08 - .04 * Math.sin(t * 1.3), {});
  handR(c, 520, 1040, 1.5, -.4, { who: 'amma', curl: .3, old: true, bangle: 'gold', sleeve: '#7a2a2a' });
  dust(c, t, 0, 0, 1920, 1080, 30, 62, .7);
}

// ============================================================== S5 — the letter, and the memory (33.8 – 51.0)
function scene5(c, t) {
  const lt = t - T.s5;
  const present = () => {   // the hands open the envelope, unfold the letter; golden light falls across it; a finger follows the words
    cam(c, 960, 540, lerp(1.0, 1.12, ss(seg(t, T.s5, T.mistIn))));
    wash(c, [[-200, -200], [2200, -200], [2200, 1300], [-200, 1300]], '#c99e72', { a: .55, raw: true, edge: 0, seed: 1700 });
    const flap = ss(seg(t, 34.0, 34.8)), slide = ss(seg(t, 34.8, 35.8)), unfold = ss(seg(t, 35.8, 37.0));
    if (unfold < .05) { envelope(c, 960, 640 + slide * 120, 1.7, .02, { back: true, flap });
      if (flap > .5) { const pull = slide; c.save(); c.translate(960, 560 - pull * 240); c.scale(1.7, 1.7); wash(c, [[-130, -60], [130, -60], [130, 60], [-130, 60]], '#efe2c4', { a: .8, raw: true, line: '#8a7050', lw: 1.6, seed: 1701 }); c.restore(); } }
    else letterSheet(c, 960, 520, 1.55, -.02, { unfold, write: 1, lit: seg(t, 36.6, 39.4) });
    const fy = 520 - 330 * 1.55 + 46 * 1.55 * (1 + Math.min(2, Math.floor(seg(t, 37.2, 39.4) * 3))) + 10, fx = lerp(620, 1180, (seg(t, 37.2, 39.4) * 3) % 1);
    handR(c, unfold > .9 ? fx - 60 : 420, unfold > .9 ? fy + 60 : 760 - flap * 120, 1.7, unfold > .9 ? -.9 : -.3, { who: 'amma', curl: unfold > .9 ? .55 : .3, pinch: flap * (1 - unfold), old: true, bangle: 'gold', sleeve: '#7a2a2a' });
    handR(c, 1560, 800 - slide * 80, 1.7, Math.PI + .35, { who: 'amma', curl: .3, old: true, bangle: 'gold', sleeve: '#7a2a2a', flipY: true });
    shafts(c, -300, -200, .65, .35, 2400, 5, .35, t, 10);
  };
  const memory = (lt2) => {   // the wedding day: the same house, younger and garlanded; father and daughter at the door
    if (t < T.mem2) { // m1: two-shot at the door — he blesses her; she looks up; a warm look between them
      const u = seg(t, T.mistIn, T.mem2); cam(c, lerp(940, 980, ss(u)), lerp(520, 500, ss(u)), lerp(1.0, 1.12, ss(u)));
      wash(c, [[-200, -200], [2200, -200], [2200, 1300], [-200, 1300]], '#f0d6a4', { a: .55, raw: true, edge: 0, seed: 1800 });
      house(c, 360, 900, 1300, 760, { seed: 81, dx: .4, wx: .82, doorC: '#3f6fa0', wall: '#f2e2c4', win: false });
      for (let k = 0; k < 18; k++) { const gx = 880 + k * 18, gy = 460 + Math.sin(k / 17 * Math.PI) * 50; softDot(c, gx, gy, 12, k % 2 ? '#f0a020' : '#e86a20', .95, 'multiply'); }   // marigold toran over the door
      for (let k = 0; k < 2; k++) for (let j = 0; j < 8; j++) softDot(c, 870 + k * 330, 470 + j * 26, 11, j % 2 ? '#f0a020' : '#e86a20', .95, 'multiply');
      shafts(c, -200, -100, .5, .5, 2400, 6, .45, t, 11);
      const bless = ss(seg(t, 41.4, 42.2)) * (1 - ss(seg(t, 43.6, 44.4))), up = ss(seg(t, 42.8, 43.4));
      drawBabu(c, 870, 1000, 1.05, { t, arm: 'bless', k: bless, e: { smile: .3 + .5 * up, wet: .6 * up, worry: .3, gaze: .2, blink: blinkAt(t, [41.0, 44.9]) }, head: -.06 });
      drawBride(c, 1110, 1000, 1.0, { t, dir: -1, head: -.18 + .26 * up, e: { down: 1 - up, smile: .45 * up, wet: .7 * up, blink: blinkAt(t, [42.3]), gaze: .2 } });
    } else { // m2: she walks down the path, turns back once; he stays at the open door, hand on the frame; marigold petals fall
      const u = seg(t, T.mem2, T.mistOut + .6); cam(c, lerp(820, 700, ss(u)), 540, lerp(1.0, 1.1, ss(u)));
      wash(c, [[-200, -200], [2200, -200], [2200, 1300], [-200, 1300]], '#f0d6a4', { a: .55, raw: true, edge: 0, seed: 1801 });
      skyWash(c, -200, -200, 2200, 500, [[0, '#e8d4b8'], [1, '#f4cf9a']]);
      peepal(c, 160, 760, .78, t, { leaves: 700 });
      house(c, 360, 780, 760, 440, { seed: 82, dx: .42, wx: .8, doorC: '#3f6fa0', wall: '#f2e2c4' });
      for (let k = 0; k < 14; k++) softDot(c, 650 + k * 14, 520 + Math.sin(k / 13 * Math.PI) * 30, 8, k % 2 ? '#f0a020' : '#e86a20', .95, 'multiply');
      wash(c, [[-200, 780], [2200, 780], [2200, 1300], [-200, 1300]], '#e6c48e', { a: .55, raw: true, edge: 0, seed: 1802 });
      drawBabu(c, 690, 820, .62, { t, dir: 1, arm: 'door', k: ss(seg(t, 45.6, 46.4)), e: { smile: .4, wet: .7, gaze: .3 } });
      const walk = seg(t, 45.4, 49.6), bx = lerp(1060, 1720, walk), turnBack = t > 46.6 && t < 47.8;
      drawBride(c, bx, 900, .72, { t, dir: turnBack ? -1 : 1, walk: turnBack ? 0 : 1, phase: walk * 26, e: { smile: turnBack ? .5 : .1, wet: .6 } });
      for (let i = 0; i < 26; i++) { const k = ((t * .2 + hash(i)) % 1); softDot(c, (hash(i * 3) * 2000 + Math.sin(k * 6 + i) * 40) % 2000, lerp(-40, 1100, k), 7, i % 2 ? '#f0a020' : '#e86a20', .9, 'multiply'); }
      shafts(c, 1900, -100, 2.4, .5, 2400, 6, .42, t, 12);
    }
    // memory treatment: unpainted paper eats the edges (a vignette of paper), warmer
    c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(960, 540, 380, 960, 540, 1100); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
    const tmp = MEMV; const tg = tmp.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); tg.fillStyle = g; tg.fillRect(0, 0, W, H); tg.globalCompositeOperation = 'source-in'; tg.drawImage(PAPER_IMG, 0, 0); tg.globalCompositeOperation = 'source-over';
    c.drawImage(tmp, 0, 0); void lt2;
  };
  if (t < T.mistIn) { present(); return; }
  if (t < T.mem) { present(); mistReveal(c, seg(t, T.mistIn, T.mem), () => memory(t - T.mistIn)); return; }
  if (t < T.mistOut) { memory(t - T.mistIn); return; }
  // mist back to the present: the letter in her hands again, now a close-up of her face beside it
  const back = () => { cam(c, 960, 540, 1.05); wash(c, [[-200, -200], [2200, -200], [2200, 1300], [-200, 1300]], '#d8b088', { a: .55, raw: true, edge: 0, seed: 1702 }); letterSheet(c, 760, 560, 1.3, -.06, { unfold: 1, write: 1, lit: .5 });
    c.save(); c.translate(1420, 470); c.scale(-3, 3); headP(c, 'amma', { down: .7, worry: .8, wet: 1, tear: .4 + seg(t, 49.8, 51), sad: .3 }); wash(c, [[-80, -60], [-50, -96], [0, -104], [34, -86], [20, -76], [-20, -84], [-60, -60], [-74, 0], [-96, 40], [-110, 120], [-60, 120]], '#b4c0a2', { a: .8, line: LINE, lw: 1.8, la: .5, seed: 1703 }); c.restore();
    shafts(c, -300, -200, .65, .35, 2400, 5, .35, t, 13); };
  void back; memory(t - T.mistIn); mistReveal(c, seg(t, T.mistOut, T.s6), () => scene6(c, t));
}
let MEMV;
function mistReveal(c, p, draw) {   // paper-coloured mist with a wavy rising edge washes the old picture away; the new one is painted in behind it
  if (p <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const y = lerp(H + 260, -260, eio(p)); c.beginPath(); c.moveTo(-10, H + 10); for (let x = -10; x <= W + 10; x += 30) c.lineTo(x, y + (fbm(x * .004 + p * 3) - .5) * 260 + Math.sin(x * .01 + p * 5) * 30); c.lineTo(W + 10, H + 10); c.closePath(); c.clip();
  c.drawImage(PAPER_IMG, 0, 0); draw(); c.restore();
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const band = 220, g = c.createLinearGradient(0, y - band, 0, y + band); g.addColorStop(0, 'rgba(241,233,218,0)'); g.addColorStop(.5, `rgba(241,233,218,${.85 * Math.sin(Math.PI * p)})`); g.addColorStop(1, 'rgba(241,233,218,0)'); c.fillStyle = g; c.fillRect(0, y - band - 150, W, band * 2 + 300); c.restore();
}

// ============================================================== S6 — the emotional moment (51.0 – 57.2)
function scene6(c, t) {
  const u = seg(t, T.s6, T.s7); cam(c, lerp(1100, 980, ss(u)), lerp(560, 520, ss(u)), lerp(1.05, 1.32, ss(u)));
  room(c, t);
  const speak = t > 53.2 && t < 55.9 ? .25 + .3 * Math.abs(Math.sin((t - 53.2) * 11)) * (Math.sin((t - 53.2) * 3.1) > -.6 ? 1 : 0) : 0;
  drawPostman(c, ROOM.post[0] - 340, ROOM.post[1], ROOM.post[2], { t, dir: -1, head: -.22 * ss(seg(t, 56.1, 56.7)), e: { down: ss(seg(t, 56.1, 56.6)), worry: .5, blink: blinkAt(t, [52.4, 54.9]) }, arm: { near: [30, 200], far: [20, 210] } });
  const look = ss(seg(t, 52.6, 53.2));
  drawAmma(c, ROOM.amma[0], ROOM.amma[1], ROOM.amma[2], { t, dir: -1, breath: 1.7, headTurn: look * 2, arms: 'heart', k: 1, letter: (g, x, y, a) => envelope(g, x - 10, y + 8, .2, a + .5, {}),
    e: { blink: t < 52.4 ? 1 : blinkAt(t, [55.0]), wet: 1, worry: .6, mouth: speak, sad: .3, smile: .15, tear: .5 } });
}

// ============================================================== S7 — the final memory (57.2 – 75.0)
function scene7(c, t) {
  if (t < T.photo) { // he leaves; she turns back and places the letter beside the old photograph
    const u = seg(t, T.s7, T.photo); cam(c, lerp(980, ROOM.table[0] - 30, ss(u)), lerp(520, ROOM.table[1] - 80, ss(u)), lerp(1.32, 1.6, ss(u)));
    room(c, t, { letterOnTable: t > 60.4 });
    const out = seg(t, 57.5, 59.0); if (out < 1) drawPostman(c, ROOM.post[0] - 340 + out * 640, ROOM.post[1], ROOM.post[2], { t, dir: out > 0 ? 1 : -1, walk: out > 0 ? 1 : 0, phase: out * 14, e: { down: .5 } });
    const pl = ss(seg(t, 59.2, 60.4)) * (1 - ss(seg(t, 60.5, 61.0)));
    drawAmma(c, ROOM.amma[0], ROOM.amma[1], ROOM.amma[2], { t, dir: -1, headTurn: 2 * (1 - ss(seg(t, 58.4, 59.0))), arms: t < 59.2 ? 'heart' : 'place', k: t < 59.2 ? 1 : pl, letter: t < 60.4 ? (g, x, y, a) => envelope(g, x - 10, y + 8, .2, a + .5, {}) : null, e: { wet: .8, smile: .25, blink: blinkAt(t, [59.9]) } });
    return;
  }
  if (t < T.alive + 1.6) { // the slow push to the photograph; then it comes alive and colour returns
    const u = seg(t, T.photo, T.alive + 1.6), z = Math.exp(lerp(Math.log(1.6), Math.log(4.6), eio(u)));
    cam(c, ROOM.table[0] - 30, ROOM.table[1] - 80, z);
    room(c, t, { letterOnTable: true, photo: { alive: ss(seg(t, T.alive - .2, T.alive + 1.0)), lt: t - T.alive } });
    return;
  }
  scene7world(c, t);
}
function scene7world(c, t) {
  // the photograph's world opens out: the house and the peepal at golden hour, birds across the sun — then the title
  const u = seg(t, T.alive + 1.6, T.end);
  cam(c, 960, 540, lerp(1.25, 1.0, eo(u)));
  skyWash(c, -300, -200, 2300, 900, [[0, '#d8c6c4'], [.5, '#f2d2a2'], [1, '#f4be86']]);
  sunGlow(c, 1350, 560, 70, 1);
  cloudWash(c, 700 - u * 40, 220, 700, 60, '#d8a49a', .35, 21); cloudWash(c, 1600 - u * 30, 160, 500, 46, '#d8a49a', .3, 22);
  wash(c, [[-300, 760], [2300, 760], [2300, 1300], [-300, 1300]], '#e2c08a', { a: .55, raw: true, edge: .2, seed: 1900 });
  house(c, 980, 780, 560, 320, { seed: 91, dx: .4, wx: .74, doorC: '#3f5f86', lit: true });
  peepal(c, 640, 790, .95, t, { leaves: 900 });
  flock(c, t - T.alive, 400, 300, 140, -10, 1.2, 7, 13);
  dust(c, t, 0, 300, 1920, 1000, 50, 71, 1);
  // the photograph frame dissolves outward (its edge painted away from the centre)
}
