// The photographer — one consistent design in every shot: charcoal coat to the knee, dark trousers, short black hair,
// a muted-red scarf (the film's only red), a camera on a brown strap. Local units: feet at (0,0), ~360 tall, facing +x.
// Drawn with the same wash/stroke language as the scene; a pure function of its parameters.
const FIG = { coat: '#343a44', coatSh: '#1d222a', coatLit: '#5b6574', trou: '#1c2027', shoe: '#0e1014', skin: '#b98f72', skinSh: '#7e5c48',
  hair: '#141210', scarf: '#8e3a2e', scarfSh: '#5e231c', cam: '#121418', strap: '#4a3a2c' };
const quadP = (x0, y0, x1, y1, w0, w1) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return [[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]]; };
function limb(c, x, y, a1, l1, a2, l2, w0, w1, w2, col) {   // two-segment limb from (x,y): angles from straight down
  const kx = x + Math.sin(a1) * l1, ky = y + Math.cos(a1) * l1, ex = kx + Math.sin(a2) * l2, ey = ky + Math.cos(a2) * l2;
  solid(c, quadP(x, y, kx, ky, w0, w1), col); solid(c, quadP(kx, ky, ex, ey, w1, w2), col);
  c.fillStyle = col; c.beginPath(); c.arc(kx, ky, w1, 0, 7); c.fill(); return [ex, ey];
}
// o: { view: 'side' | 'back' | 'back3q', phase (walk, radians), walk (0..1 stride amount), wind (0..1), t, look (head tilt, + = up), rim (warm rim 0..1), cam: 'chest' | 'raised' }
function photographer(c, x, y, s, o = {}) {
  const t = o.t || 0, ph = o.phase || 0, wk = o.walk ?? 0, wind = o.wind ?? .3, view = o.view || 'side';
  c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s);
  const bob = -wk * 7 * Math.abs(Math.cos(ph)), sway = Math.sin(t * 1.1) * 1.2;
  c.translate(sway, bob);
  const fl = (i, a) => Math.sin(t * 6.5 - i * .9) * a * wind;
  if (view === 'side') {
    const sw = .42 * wk;
    // far arm, far leg (darker), then body, near leg, near arm
    limb(c, -2, -292, -.32 * Math.sin(ph) * wk * .9 + .05, 74, -.32 * Math.sin(ph) * wk * .9 - .25, 70, 12, 10, 8, FIG.coatSh);
    const kneeB = Math.max(0, Math.sin(ph + Math.PI + .9)) * .7 * wk;
    let [fx, fy] = limb(c, -4, -170, sw * Math.sin(ph + Math.PI), 88, sw * Math.sin(ph + Math.PI) - kneeB, 84, 15, 12, 10, '#13161b');
    solid(c, [[fx - 10, fy - 6], [fx + 26, fy - 4], [fx + 28, fy + 6], [fx - 12, fy + 6]], FIG.shoe);
    const kneeF = Math.max(0, Math.sin(ph + .9)) * .7 * wk;
    [fx, fy] = limb(c, 2, -170, sw * Math.sin(ph), 88, sw * Math.sin(ph) - kneeF, 84, 16, 13, 11, FIG.trou);
    solid(c, [[fx - 10, fy - 6], [fx + 26, fy - 4], [fx + 28, fy + 6], [fx - 12, fy + 6]], FIG.shoe);
    // coat: shoulders to just above the knee; the hem swings with the stride and lifts in the wind
    const hem = []; for (let i = 0; i <= 6; i++) hem.push([-44 + i * 15 + fl(i, 9) - wind * 8, -122 + fl(i * 1.4, 5) + (i === 3 ? 4 * Math.sin(ph) * wk : 0)]);
    const coat = [[-20, -312], [-36, -296], [-44, -220], [-48, -160], ...hem, [52, -150], [44, -220], [36, -296], [20, -312]];
    solid(c, coat, FIG.coat); wash(c, [[-20, -312], [-36, -296], [-44, -220], [-48, -160], hem[0], hem[1], [-10, -160], [-6, -300]], FIG.coatSh, .9, 501, 1.5);
    if (o.rim) withSeed(502, () => drawS(c, mk([[34, -300], [44, -220], [52, -150]], 4, '#e8b878', { prof: 'even', nb: 0, a: .7 * o.rim }), 1));
    withSeed(503, () => { drawS(c, mk([[8, -306], [10, -140]], 1.6, '#0c0e12', { prof: 'even', nb: 0, a: .6 }), 1); drawS(c, mk([[-46, -186], [50, -184]], 2.4, '#0c0e12', { prof: 'even', nb: 0, a: .5 }), 1); });   // placket, belt line
    // camera on its strap
    withSeed(504, () => drawS(c, mk([[-14, -306], [6, -262], [26, -214]], 3, FIG.strap, { prof: 'even', nb: 0, a: .9 }), 1));
    if (o.cam !== 'raised') { solid(c, [[18, -232], [52, -232], [52, -204], [18, -204]], FIG.cam); c.fillStyle = '#2a2f38'; c.beginPath(); c.arc(54, -218, 9, 0, 7); c.fill(); c.fillStyle = '#6a7a8c'; c.beginPath(); c.arc(56, -220, 3, 0, 7); c.fill(); }
    // near arm (swinging, or raised holding the camera at the eye)
    if (o.cam === 'raised') { const [hx, hy] = limb(c, 4, -292, -1.75, 62, -2.6, 52, 13, 11, 9, FIG.coat); solid(c, [[hx - 6, hy - 18], [hx + 34, hy - 18], [hx + 34, hy + 8], [hx - 6, hy + 8]], FIG.cam); }
    else { const a = .34 * Math.sin(ph) * wk + .04, [hx, hy] = limb(c, 4, -292, a, 76, a - .28, 72, 13, 11, 9, FIG.coat); c.fillStyle = FIG.skin; c.beginPath(); c.ellipse(hx, hy + 6, 8, 10, 0, 0, 7); c.fill(); }
    // scarf: wrap + tail streaming behind in the wind
    solid(c, [[-22, -318], [22, -318], [26, -298], [-26, -296]], FIG.scarf);
    withSeed(505, () => { const p = []; for (let i = 0; i <= 9; i++) p.push([-16 - i * 11 * (.4 + .6 * wind), -306 + i * 5 * (1.2 - wind) + fl(i, 12) * (i / 9)]); drawS(c, mk(p, 15, FIG.scarf, { prof: 'tip', nb: 2, a: .95 }), 1); drawS(c, mk(p, 2, FIG.scarfSh, { prof: 'even', nb: 0, a: .6 }), 1); });
    // head in profile
    c.save(); c.translate(4, -340); c.rotate(-(o.look || 0));
    solid(c, [[-8, 14], [-6, 30], [8, 30], [10, 14]], FIG.skinSh);                                                      // neck
    c.fillStyle = FIG.skin; c.beginPath(); c.ellipse(4, -2, 22, 27, 0, 0, 7); c.fill();
    solid(c, [[20, -6], [30, 4], [20, 8]], FIG.skin);                                                                   // nose
    c.fillStyle = FIG.skinSh; c.beginPath(); c.ellipse(-6, 2, 5, 8, 0, 0, 7); c.fill();                                 // ear
    solid(c, [[-20, 8], [-24, -16], [-14, -30], [6, -32], [22, -22], [24, -12], [12, -16], [-2, -10], [-10, 2]], FIG.hair);
    c.fillStyle = '#0c0a08'; c.beginPath(); c.ellipse(16, -4, 2.2, 1.6, 0, 0, 7); c.fill();                            // eye
    if (o.rim) blob(c, 18, 0, 26, '#f0c070', .35 * o.rim, .6, 1, 'screen');
    c.restore();
  } else {
    // from behind (optionally the head turned three-quarters toward +x)
    for (const d of [-1, 1]) { const [fx, fy] = limb(c, d * 14, -170, d * .05, 88, d * .02, 84, 16, 13, 11, d < 0 ? '#13161b' : FIG.trou); solid(c, [[fx - 12, fy - 6], [fx + 12, fy - 6], [fx + 14, fy + 6], [fx - 14, fy + 6]], FIG.shoe); }
    const hem = []; for (let i = 0; i <= 8; i++) hem.push([-56 + i * 14 + fl(i, 8), -124 + fl(i * 1.3, 5)]);
    const coat = [[-26, -316], [-50, -298], [-56, -220], [-60, -150], ...hem, [60, -150], [56, -220], [50, -298], [26, -316]];
    solid(c, coat, FIG.coat); wash(c, [[-26, -316], [-50, -298], [-56, -220], [-60, -150], hem[0], hem[1], hem[2], [-20, -150], [-14, -300]], FIG.coatSh, .8, 511, 1.5);
    withSeed(512, () => drawS(c, mk([[0, -300], [2, -126]], 2, '#0c0e12', { prof: 'even', nb: 0, a: .55 }), 1));   // back seam
    if (o.rim) for (const d of [-1, 1]) withSeed(513 + d, () => drawS(c, mk([[d * 50, -298], [d * 56, -220], [d * 60, -150]], 4, '#e8b878', { prof: 'even', nb: 0, a: .6 * o.rim }), 1));
    for (const d of [-1, 1]) { const [hx, hy] = limb(c, d * 50, -294, d * -.08, 78, d * -.02, 72, 13, 11, 9, FIG.coat); c.fillStyle = FIG.skinSh; c.beginPath(); c.ellipse(hx, hy + 6, 8, 10, 0, 0, 7); c.fill(); }
    solid(c, [[-28, -322], [28, -322], [32, -300], [-32, -300]], FIG.scarf);
    withSeed(515, () => { const p = []; for (let i = 0; i <= 8; i++) p.push([-10 - i * 4 + fl(i, 10) * (i / 8), -306 + i * 12]); drawS(c, mk(p, 14, FIG.scarf, { prof: 'tip', nb: 2, a: .95 }), 1); });
    c.save(); c.translate(0, -344); c.rotate(o.look ? -o.look * .25 : 0); c.translate(0, -(o.look || 0) * 10);
    solid(c, [[-10, 16], [-8, 28], [8, 28], [10, 16]], FIG.skinSh);
    if (view === 'back3q') {   // head turned: cheek, ear and nose edge appear on the +x side
      c.fillStyle = FIG.skin; c.beginPath(); c.ellipse(4, -2, 23, 27, 0, 0, 7); c.fill();
      solid(c, [[20, -4], [28, 6], [19, 9]], FIG.skin); c.fillStyle = FIG.skinSh; c.beginPath(); c.ellipse(-8, 2, 5, 8, 0, 0, 7); c.fill();
      solid(c, [[-22, 10], [-24, -14], [-12, -30], [8, -32], [22, -20], [20, -10], [6, -14], [-6, -8], [-14, 8]], FIG.hair);
      if (o.rim) blob(c, 22, 0, 28, '#f0c070', .5 * o.rim, .6, 1, 'screen');
    } else {
      c.fillStyle = FIG.skinSh; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * 22, 2, 5, 8, 0, 0, 7); c.fill(); }
      c.fillStyle = FIG.hair; c.beginPath(); c.ellipse(0, -4, 23, 28, 0, 0, 7); c.fill();
    }
    c.restore();
  }
  c.restore();
}
