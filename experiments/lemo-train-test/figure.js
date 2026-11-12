// The traveller: a standing cel figure built around the library head (head.js).
// Local units: head centre (0,0), head radius 80, chin +114, shoulders ~+165, feet +1385 (≈7.2 heads). Faces local +x;
// draw with a negative x scale to face screen left. Light direction L is in local units.
import { cel, path, poly, ribbon, flutter, line, mix, rgba, TAU } from './cel.js';
import { head80 } from './head.js';

const lerp = (a, b, t) => a + (b - a) * t;
const lp = (A, B, t) => A.map((p, i) => [lerp(p[0], B[i][0], t), lerp(p[1], B[i][1], t)]);

// wind: 0..1 (blows towards local -x, i.e. behind her), ph: flutter phase (stepped by the caller), brace: 0..1 arm raised
export function girl(g, P, o = {}) {
  const w = o.wind ?? .12, ph = o.ph ?? 0, b = o.brace ?? 0, L = o.light ?? [1, -.4];
  const SO = k => [L[0] * k, L[1] * k];
  const rim = o.rim ? { c: o.rim, d: [-L[0] * 5, -L[1] * 4] } : null;
  const st = (c, k = 12, x = {}) => ({ f: c.f, s: c.s, h: c.h, l: c.l, lw: 2.4, so: SO(k), rim, ...x });
  const back = Math.PI / 2 + w * Math.PI * .46;            // streaming angle: down at rest, straight back in a strong wind

  // 1 back arm + satchel (behind the body)
  const backArm = [[-104, 182], [-126, 400], [-132, 610]];
  cel(g, ribbon(backArm, u => 60 - u * 14), st({ ...P.coat, f: mix(P.coat.f, P.coat.s, .35) }, 8));
  cel(g, (() => { const p = new Path2D(); p.ellipse(-134, 640, 24, 30, 0, 0, TAU); return p; })(), st(P.skin, 4));
  cel(g, [[-178, 520, 1], [-60, 512, 1], [-56, 664, 1], [-170, 676, 1]], st(P.bag, 10));
  line(g, [[-170, 560], [-62, 556]], P.bag.l, 1.6);
  // 2 hair strands streaming behind the bob (secondary motion)
  for (let k = 0; k < 4; k++) {
    const sp = flutter(-46 - k * 10, -30 + k * 26, back + .08 * k, 120 + k * 26 + w * 90, 10, 5 + 26 * w, 1.15, ph * TAU + k * 1.7);
    cel(g, ribbon(sp, u => Math.pow(1 - u, .8) * (34 - k * 4) + 1.5), { ...st(P.hair, 5), f: k % 2 ? P.hair.s : P.hair.f });
  }
  // 3 legs + boots
  cel(g, [[-92, 790], [-46, 790], [-42, 1280], [-84, 1280]], st(P.tights, 8));
  cel(g, [[2, 790], [50, 790], [58, 1280], [16, 1280]], st(P.tights, 8));
  cel(g, [[-92, 1240, 1], [-38, 1240, 1], [-32, 1352], [-14, 1384, 1], [-100, 1386, 1], [-98, 1320]], st(P.boot, 8));
  cel(g, [[10, 1240, 1], [62, 1240, 1], [66, 1344], [104, 1370, 1], [104, 1388, 1], [8, 1388, 1]], st(P.boot, 8));
  // 4 coat: hem swings back in the wind
  const hem = k => [k[0] - 70 * w + Math.sin(ph * TAU + k[0] * .01) * 8 * w, k[1] - 14 * w * Math.abs(k[0]) / 160];
  const coat = [[-120, 168], [-80, 146], [-30, 136], [40, 138], [92, 152], [120, 178], [124, 330], [116, 480], hem([156, 800]), hem([70, 826]), hem([-40, 828]), hem([-160, 806]), [-122, 480], [-128, 330]];
  cel(g, coat, st(P.coat, 16, { h: P.coat.h, ho: [-L[0] * 4, -L[1] * 4] }));
  line(g, [[40, 140], [32, 330], [46, 480], hem([72, 820])], P.coat.l, 1.6);
  line(g, [[-122, 474], [118, 476]], P.coat.l, 1.4);
  cel(g, [[-122, 466], [118, 468], [118, 486], [-122, 484]], st(P.bag, 3));
  line(g, [[92, 158], [-20, 360], [-116, 540]], P.bag.s, 9);                    // satchel strap across the chest
  // 5 scarf: wrap + long tail streaming back
  cel(g, [[-50, 116], [48, 118], [60, 152], [-56, 156]], st(P.scarf, 5));
  const tail = flutter(-34, 146, back + .05, 380 + w * 160, 14, 10 + 46 * w, 1.4, ph * TAU + .9);
  cel(g, ribbon(tail, u => 54 - u * 26), st(P.scarf, 6));
  const tail2 = flutter(-14, 150, back - .12, 260 + w * 100, 12, 8 + 30 * w, 1.2, ph * TAU + 2.4);
  cel(g, ribbon(tail2, u => 44 - u * 22), { ...st(P.scarf, 6), f: P.scarf.s });
  // 6 front arm (holding the strap) when not bracing
  const armStand = [[96, 182], [122, 400], [92, 596]], armBrace = [[96, 182], [176, 70], [104, -30]];
  const arm = lp(armStand, armBrace, b);
  const drawArm = () => {
    cel(g, ribbon(arm, u => 60 - u * 14), st(P.coat, 10));
    const hx = arm[2][0] + (b > .5 ? -10 : 0), hy = arm[2][1] + (b > .5 ? -6 : 24);
    cel(g, (() => { const p = new Path2D(); p.ellipse(hx, hy, 26, 30, b * .9, 0, TAU); return p; })(), st(P.skin, 4));
  };
  if (b < .5) drawArm();
  // 7 head (library head, our design: no goggles, headset or ponytail; body drawn above)
  g.save(); g.translate(0, 120); g.rotate(o.tilt || 0); g.translate(0, -120);
  head80(g, P, { view: 'q', expr: o.expr || 'neutral', E: o.E, look: o.look, open: o.open, wind: Math.min(1, w * 1.6), ph, light: L,
    body: false, ponytail: false, headset: false, goggles: false, neckEnd: 150, skinRim: o.rim, rim, detail: o.detail });
  g.restore();
  if (b >= .5) drawArm();
}

// Back view (over-the-shoulder): head + shoulders seen from behind her left shoulder; local origin = head centre
export function girlBack(g, P, o = {}) {
  const w = o.wind ?? .08, ph = o.ph ?? 0, rimC = o.rim;
  const rim = rimC ? { c: rimC, d: [0, 5] } : null;
  const st = (c, x = {}) => ({ f: c.f, s: c.s, l: c.l, lw: 2.6, so: [0, 14], rim, ...x });
  // shoulders / coat back
  cel(g, [[-330, 520], [-300, 250], [-180, 170], [-40, 150], [60, 156], [190, 190], [270, 300], [290, 520]], st(P.coat));
  line(g, [[-30, 210], [-20, 520]], P.coat.l, 1.6);
  line(g, [[150, 180], [40, 360], [-60, 520]], P.bag.s, 12);
  // scarf
  cel(g, [[-90, 100], [80, 104], [96, 160], [-100, 166]], st(P.scarf));
  const tail = flutter(-40, 150, Math.PI / 2 + w * 1.2, 300, 12, 6 + 30 * w, 1.2, ph * TAU);
  cel(g, ribbon(tail, u => 60 - u * 26), st(P.scarf));
  // neck + bob from behind
  cel(g, [[-36, 60], [36, 60], [40, 130], [-40, 130]], { f: P.skin.s, l: P.skin.l, lw: 2 });
  const bob = [[-104, 50], [-110, -20], [-96, -78], [-56, -112], [0, -122], [56, -112], [96, -78], [110, -20], [106, 50], [92, 96, 1], [72, 74], [48, 108, 1], [26, 80], [4, 114, 1], [-20, 82], [-44, 110, 1], [-68, 76], [-90, 100, 1]];
  cel(g, bob, st(P.hair, { h: P.hair.h }));
  for (let k = 0; k < 5; k++) {   // lock lines + a few loose strands lifting
    line(g, [[-50 + k * 25, -100], [-70 + k * 35, -10], [-78 + k * 39, 80]], mix(P.hair.l, P.hair.s, .4), 1.3);
    const sp = flutter(-70 + k * 34, 70, Math.PI / 2 + w * 1.4 + k * .05, 40 + w * 40, 6, 3 + 10 * w, 1, ph * TAU + k);
    cel(g, ribbon(sp, u => (1 - u) * 10 + 1), { f: P.hair.f, l: P.hair.l, lw: 1.2 });
  }
  // angel-ring sheen
  g.save(); g.clip(path(bob)); g.fillStyle = rgba(P.hair.h, .55);
  g.beginPath(); g.ellipse(0, -62, 92, 16, 0, 0, TAU); g.fill(); g.restore();
  g.save(); g.clip(path(bob)); g.fillStyle = rgba(P.hair.s, .5); g.beginPath(); g.ellipse(0, 90, 120, 50, 0, 0, TAU); g.fill(); g.restore();
}
