// The liner (an original painting in the manner of a 1920s three-funnel passenger steamer: black hull, stone upperworks,
// black funnels, two masts). Painted once into a sprite; every frame adds bob, pitch, bow wave, wake, reflection and smoke.
const SHIP = { w: 1240, h: 520, wl: 430, funnels: [[452, 150], [592, 150], [732, 150]], bow: 1170, stern: 70 };
function buildShip() {
  const cv = document.createElement('canvas'); cv.width = SHIP.w; cv.height = SHIP.h; const c = cv.getContext('2d');
  withSeed(1921, () => {
    const sheer = x => 334 + 18 * Math.sin((x - 70) / 1100 * Math.PI) - (x > 900 ? (x - 900) * .075 : 0);
    // hull
    const hull = [[70, sheer(70)]]; for (let x = 70; x <= 1170; x += 55) hull.push([x, sheer(x)]);
    hull.push([1176, sheer(1170) + 6], [1118, 430], [112, 430], [84, 392]);
    wash(c, hull, C.hull, .96, 1, 2.5); wash(c, hull, '#0f1218', .5, 2, 3);
    wash(c, [[112, 414], [1124, 414], [1118, 431], [108, 431]], C.ochre, .85, 3, 2);                       // boot-topping
    drawS(c, mk(hull.slice(0, 22), 4, PAPER, { prof: 'even', nb: 0, a: .7 }), 1);                            // white sheer strake
    for (let x = 150; x < 1100; x += 26) if (rnd() < .86) { c.fillStyle = rgba('#e9c78a', .8); c.beginPath(); c.arc(x + rnd(-2, 2), sheer(x) + 30 + rnd(-1, 1), 2.6, 0, 7); c.fill(); }   // lit portholes
    // upperworks (stone), two decks + bridge
    for (const [x0, x1, y0, y1, s] of [[230, 980, 298, sheer(600) + 4, 10], [300, 910, 262, 300, 11], [826, 912, 228, 264, 12]]) {
      wash(c, [[x0, y1], [x0 + 6, y0], [x1 - 4, y0], [x1 + 10, y1]], C.stone, .95, s, 2);
      wash(c, [[x0, y1], [x0 + 3, (y0 + y1) / 2 + 4], [x1 + 6, (y0 + y1) / 2 + 4], [x1 + 10, y1]], '#9c8c70', .3, s + 20, 2);
      drawS(c, mk([[x0 + 4, y0], [x1 - 2, y0]], 2.2, INK2, { prof: 'even', nb: 0, a: .7 }), 1);
      for (let x = x0 + 22; x < x1 - 14; x += 22) { c.fillStyle = rgba(INK, .62); c.fillRect(x, y0 + 12 + rnd(-1, 1), 9, 9); }
    }
    for (let x = 330; x < 880; x += 78) { blob(c, x, 258, 22, PAPER, .95, 30 + x, 1.5, .42, false); drawS(c, mk(qcurve(x - 30, 262, x + 30, 262, 5, 6), 2, INK2, { prof: 'even', nb: 0, a: .7 }), 1); }   // lifeboats
    // funnels: raked, black, with a soft highlight
    for (const [fx, fy] of SHIP.funnels) { const p = [[fx - 4, 264], [fx - 22, fy], [fx + 30, fy], [fx + 52, 264]]; wash(c, p, '#1a1c22', .97, 40 + fx, 2); wash(c, p, '#000000', .35, 41 + fx, 2);
      drawS(c, mk([[fx - 14, fy + 12], [fx + 2, 256]], 7, '#6d7482', { prof: 'even', nb: 0, a: .35 }), 1); }
    // masts, derricks, rigging, ensign
    for (const [mx, top, base] of [[1010, 84, 322], [196, 96, 332]]) {
      drawS(c, mk([[mx, base], [mx - 12, top]], 5, INK2, { prof: 'trunk', nb: 0, a: .9 }), 1);
      drawS(c, mk([[mx - 4, base - 60], [mx + (mx > 600 ? -120 : 110), base - 150]], 2.4, INK2, { prof: 'even', nb: 0, a: .7 }), 1);
      for (const dx of [-150, 150]) drawS(c, mk([[mx - 11, top + 10], [mx + dx, base]], 1.1, INK2, { prof: 'even', nb: 0, a: .45 }), 1);
    }
    drawS(c, mk([[1002, 96], [742, 152]], 1, INK2, { prof: 'even', nb: 0, a: .35 }), 1); drawS(c, mk([[742, 152], [188, 108]], 1, INK2, { prof: 'even', nb: 0, a: .35 }), 1);
    drawS(c, mk([[86, 330], [78, 270]], 2, INK2, { prof: 'even', nb: 0, a: .8 }), 1);
  });
  return cv;
}
// smoke: one puff per funnel every 0.16 s; each drifts aft on the wind, rises, swells and thins (a pure function of t)
function drawSmoke(c, t, t0, wind = 1) {
  const dt = .16, life = 7.5;
  for (let f = 0; f < 3; f++) {
    const [fx, fy] = SHIP.funnels[f];
    for (let k = Math.floor((t - life) / dt); k <= Math.floor(t / dt); k++) {
      const tb = k * dt + f * .05, a = t - tb; if (tb < t0 || a < 0 || a > life) continue;
      const u = a / life, wob = (vnoise(k * .37 + f * 9 + a * .6) - .5) * 60 * u;
      const x = fx + 4 - wind * (a * 78 + a * a * 5), y = fy - 6 - 58 * Math.pow(a, .62) + wob, r = 15 + 96 * Math.pow(u, .75);
      const al = .3 * Math.pow(1 - u, 1.6) * Math.min(1, a / .25);
      blob(c, x, y, r, a < 1.2 ? '#3d3733' : C.smoke, al, 3000 + ((k % 97) + 97) % 97 * 3 + f, 1.25, .9);
      if (k % 3 === 0) blob(c, x - r * .2, y + r * .3, r * .7, '#c98f5c', al * .35, 4000 + ((k % 53) + 53) % 53, 1.2, .6);   // warm underside from the low sun
    }
  }
}
// ship at screen (x, y = waterline centre), scale k; t for motion; reveal 0..1 = brush wipe from stern to bow
function drawShip(c, SP, x, y, k, t, reveal = 1, smokeFrom = 0) {
  const bob = Math.sin(t * 1.15) * 5, pitch = Math.sin(t * .82 + 1) * .011;
  c.save(); c.translate(x, y + bob * k); c.scale(k, k);
  // wake: churned foam trailing astern, widening and fading
  for (let i = 0; i < 46; i++) { const d = ((i * 37 + t * 150) % 1500), u = d / 1500, wx = SHIP.stern - 600 + 10 - d, wy = (hash(i * 3.3) - .5) * (30 + 150 * u) + 12;
    c.fillStyle = rgba('#f6efe0', .7 * (1 - u) * reveal); c.beginPath(); c.ellipse(wx, wy + 6, 26 + 60 * u, 3 + 6 * u, 0, 0, 7); c.fill(); }
  // reflection: the hull's darkness smeared down the water in wobbling slices
  if (reveal > .3) for (let i = 0; i < 16; i++) { const yy = 6 + i * 7, off = Math.sin(t * 2.6 + i * .9) * (3 + i * .9); c.globalAlpha = .2 * (1 - i / 16) * reveal; c.drawImage(SP, 60, SHIP.wl - 8 - i * 5, 1120, 5, -560 + off, yy, 1120, 8); }
  c.globalAlpha = 1; c.rotate(pitch); c.translate(-600, -SHIP.wl);
  if (reveal < 1) { c.save(); c.beginPath(); const xe = -40 + (SHIP.w + 120) * reveal; c.moveTo(-40, -40); for (let yy = -40; yy <= SHIP.h + 40; yy += 30) c.lineTo(xe + (fbm(yy * .02 + 5) - .5) * 70, yy); c.lineTo(-40, SHIP.h + 40); c.closePath(); c.clip(); }
  c.drawImage(SP, 0, 0);
  if (reveal < 1) c.restore();
  // bow wave: curling paper strokes that breathe with the pitch
  if (reveal > .9) for (let i = 0; i < 7; i++) { const ph = t * 5 + i * 1.1, len = 60 + 26 * i + 14 * Math.sin(ph);
    withSeed(600 + i, () => drawS(c, mk(qcurve(1126 - i * 4, 428, 1126 - len, 436 + i * 4.5, -(16 + 4 * i) - 6 * Math.sin(ph), 8), 9 - i * .7, PAPER, { prof: 'tip', nb: 0, a: .92 }), 1)); }
  if (reveal > .9) for (let i = 0; i < 9; i++) { const d = (i * 130 + t * 170) % 1100; c.fillStyle = rgba('#f6efe0', .6); c.beginPath(); c.ellipse(1090 - d, 431 + Math.sin(t * 3 + i) * 2, 34, 3.4, 0, 0, 7); c.fill(); }   // foam sliding along the waterline
  // ensign fluttering at the stern
  withSeed(11, () => { const p = []; for (let i = 0; i <= 8; i++) p.push([78 - i * 5.5, 276 + Math.sin(t * 9 - i * .9) * 2.4 * (i / 8) + i * .6]); drawS(c, mk(p, 15, '#b63a2c', { prof: 'even', nb: 0, a: .9 }), 1); });
  drawSmoke(c, t, smokeFrom);
  c.restore();
}
