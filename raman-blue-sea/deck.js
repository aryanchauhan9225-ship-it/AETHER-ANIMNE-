// Shot 2: the deck rail. A tracking move along the rail ending over the scientist's shoulder; the sea rolls behind,
// the ship's own roll tilts the horizon, his coat and turban end move in the wind, and he leans to look down at the water.
// s = track progress 0..1, t = film time.
function drawDeck(c, t, s) {
  const roll = .013 * Math.sin(t * .75), heave = 9 * Math.sin(t * .75 + 1);
  // background (rolls against the deck)
  c.save(); c.translate(W / 2, 620 + heave); c.rotate(roll); c.translate(-W / 2, -620);
  const hz = 430;
  drawSky(c, hz, t, s * 160, 520);
  drawCoast(c, hz, -400 + s * 200);
  drawSea(c, hz, t, { bottom: H + 520, pan: s * 240, drift: 190, rows: 15, sunX: 520 });
  drawGull(c, 700 - s * 120 + Math.sin(t * .6) * 60, 250 + Math.cos(t * .8) * 24, 1.3, t, 0); drawGull(c, 900 - s * 150 + Math.sin(t * .5 + 2) * 50, 310 + Math.cos(t * .7) * 20, .9, t, 2);
  c.restore();
  // drifting funnel smoke overhead (near layer, out of focus)
  for (let i = 0; i < 9; i++) { const x = ((i * 290 - t * 150 - s * 500) % 2600 + 2600) % 2600 - 340; blob(c, x, 60 + 50 * hash(i * 3.1) + Math.sin(t + i) * 12, 150 + 70 * hash(i), C.smoke, .13, 700 + i, 1.7, .55); }

  // —— rail (mid layer): painted wooden top rail, white iron stanchions, mid rail ——
  const railY = 712, px = s * 560;
  for (let i = -1; i < 14; i++) { const x = i * 250 - px % 250 + 40;
    wash(c, [[x - 9, railY + 8], [x + 9, railY + 8], [x + 11, H + 20], [x - 11, H + 20]], '#e9e2d2', .95, 300 + i, 1.5);
    wash(c, [[x + 2, railY + 8], [x + 9, railY + 8], [x + 11, H + 20], [x + 3, H + 20]], '#8a94a0', .45, 320 + i, 1.5);
    withSeed(340 + i, () => drawS(c, mk([[x - 10, railY + 8], [x - 12, H + 20]], 2, INK2, { prof: 'even', nb: 0, a: .6 }), 1)); }
  withSeed(41, () => { drawS(c, mk([[-60, railY + 150], [W + 60, railY + 150]], 9, '#d9d2c2', { prof: 'even', nb: 0, a: .95 }), 1); drawS(c, mk([[-60, railY + 155], [W + 60, railY + 155]], 2, INK2, { prof: 'even', nb: 0, a: .5 }), 1); });
  wash(c, [[-60, railY - 14], [W + 60, railY - 14], [W + 60, railY + 14], [-60, railY + 14]], C.wood, .95, 42, 2);
  wash(c, [[-60, railY + 2], [W + 60, railY + 2], [W + 60, railY + 14], [-60, railY + 14]], '#4e2f1c', .5, 43, 2);
  withSeed(44, () => drawS(c, mk([[-60, railY - 12], [W + 60, railY - 12]], 3, '#d9a878', { prof: 'even', nb: 0, a: .6 }), 1));

  // —— the scientist, from behind (near layer: moves more than the rail) ——
  const fx = 2100 - s * 900, lean = ss(seg(t, 8.0, 9.4)), sway = 5 * Math.sin(t * .9), ny = 452 + lean * 16;
  c.save(); c.translate(fx + sway + lean * -8, ny); c.scale(1.22, 1.22); c.translate(0, -30);
  const wind = t * 7.5, fl = (i, a = 1) => Math.sin(wind - i * .8) * a;
  // coat: back panel with a fluttering hem and vent
  const hem = []; for (let i = 0; i <= 10; i++) hem.push([-215 + i * 43 + fl(i, 7) * (i < 5 ? 1.6 : .7), 640 + fl(i * 1.3, 9) + (i === 5 ? -30 : 0)]);
  const coat = [[-62, -4], [-150, 22], [-186, 80], [-205, 330], ...hem, [205, 330], [186, 80], [150, 22], [62, -4]];
  solid(c, coat, C.coat); wash(c, coat, '#3a4556', .5, 50, 2); wash(c, [[-62, -4], [-150, 22], [-186, 80], [-205, 330], hem[0], hem[1], hem[2], [-60, 330], [-40, 60]], '#10151c', .45, 51, 2);
  withSeed(52, () => { drawS(c, mk([[0, 6], [2, 300], [fl(5, 6), 606]], 2.4, '#0c1016', { prof: 'even', nb: 0, a: .7 }), 1);
    drawS(c, mk([[150, 22], [186, 80], [205, 330], hem[10]], 3, '#59657a', { prof: 'even', nb: 0, a: .5 }), 1); });   // rim light on the sun side
  // arms out to the rail (elbows wide), hands resting; the right hand lifts a little as he leans in
  const ry = railY - ny - 12;
  for (const d of [-1, 1]) { const lift = d > 0 ? -10 * Math.sin(lean * Math.PI) : 0;
    const arm = [[d * 150, 26], [d * 196, 60], [d * 286, ry - 70], [d * 262, ry + lift], [d * 214, ry + 4 + lift], [d * 226, ry - 70], [d * 150, 110]];
    solid(c, arm, C.coat); wash(c, arm, '#3a4556', .4, 60 + d, 2); wash(c, [[d * 226, ry - 70], [d * 262, ry + lift], [d * 214, ry + 4 + lift]], '#10151c', .4, 63 + d, 2);
    blob(c, d * 236, ry + 12 + lift, 27, C.skin, .95, 66 + d, 1.25, .8, false); blob(c, d * 236, ry + 20 + lift, 20, '#7d5238', .35, 68 + d, 1.2, .6, false);
    wash(c, [[d * 208, ry - 6 + lift], [d * 266, ry - 8 + lift], [d * 264, ry + 4 + lift], [d * 210, ry + 6 + lift]], '#efe6d2', .9, 70 + d, 1.5); }   // shirt cuff
  // collar, neck
  solid(c, [[-66, -2], [66, -2], [58, 26], [-58, 26]], '#efe6d2');
  solid(c, [[-40, -40], [40, -40], [46, 4], [-46, 4]], C.skin); wash(c, [[-40, -40], [0, -40], [-4, 4], [-46, 4]], '#6f4630', .4, 74, 1.5);
  // head: turns down and to the left as he studies the water
  c.save(); c.translate(0, -44); c.rotate(-.05 - .13 * lean); c.translate(-10 * lean, 0);
  blob(c, -84, -50, 17, C.skin, .95, 75, .7, 1.1, false); blob(c, 84, -50, 17, C.skin, .95, 76, .7, 1.1, false);                 // ears
  solid(c, [[-74, -64], [74, -64], [66, -8], [0, 8], [-66, -8]], '#1d1814');                                           // hair at the nape
  // turban: wound cream cloth, folds in ink, cool shadow on the left, loose end flickering in the wind
  const tb = []; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; tb.push([Math.cos(a) * 112, -128 + Math.sin(a) * 84 - (Math.sin(a) < 0 ? 10 : 0)]); }
  solid(c, tb, C.turban); wash(c, tb.filter(p => p[0] < 10), '#8793a6', .5, 79, 3); wash(c, tb.filter(p => p[1] > -110), '#8a7a66', .3, 82, 3);
  withSeed(80, () => { for (let i = 0; i < 4; i++) drawS(c, mk(qcurve(-100 + i * 16, -96 - i * 20, 98 - i * 8, -170 + i * 22, 30 - i * 6, 9), 2.4, '#6d6052', { prof: 'even', nb: 0, a: .55 }), 1);
    drawS(c, mk(tb.concat([tb[0]]), 2.4, INK2, { prof: 'even', nb: 0, a: .6 }), 1); });
  withSeed(81, () => { const p = []; for (let i = 0; i <= 9; i++) p.push([-70 - i * 13, -70 + i * 9 + fl(i, 9) * (i / 9)]); drawS(c, mk(p, 30, C.turban, { prof: 'tip', nb: 3, a: .95 }), 1); drawS(c, mk(p, 2, '#6d6052', { prof: 'even', nb: 0, a: .5 }), 1); });
  c.restore();
  c.restore();
}
