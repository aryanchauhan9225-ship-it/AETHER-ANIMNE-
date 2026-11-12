// The unscheduled train: an original two-tone cel design (navy body, gold line, warm windows), side view.
// Local units: one car is 1560 long (+x = forward), body top y=0, body bottom y=360, skirt to 400, wheel centres y=430.
import { cel, poly, line, mix, rgba, TAU } from './cel.js';

export const CAR = 1560, WINDOWS = [110, 330, 1000, 1220], DOOR = [640, 840];

// o: { lead, wheelA, door (0..1 open), glow (window glow 0..1), fast (0..1 motion: wheels become discs), P }
export function car(g, e, o) {
  const P = o.P, so = [-6, 10];
  // bogies (behind the skirt)
  for (const bx of [250, 1310]) {
    cel(g, [[bx - 150, 392, 1], [bx + 150, 392, 1], [bx + 140, 450, 1], [bx - 140, 450, 1]], { f: P.bogie.f, s: P.bogie.s, so: [0, 8], l: P.bogie.l, lw: 2 });
    for (const dx of [-80, 80]) {
      const x = bx + dx, y = 440;
      g.fillStyle = P.bogie.s; g.beginPath(); g.arc(x, y, 42, 0, TAU); g.fill();
      g.strokeStyle = P.bogie.l; g.lineWidth = 2; g.stroke();
      if ((o.fast || 0) < .5) {   // spokes rotate; at speed they read as a solid disc
        g.strokeStyle = P.bogie.h; g.lineWidth = 4;
        for (let k = 0; k < 3; k++) { const a = (o.wheelA || 0) + k * TAU / 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 36, y + Math.sin(a) * 36); g.stroke(); }
      } else { g.fillStyle = rgba(P.bogie.h, .35); g.beginPath(); g.arc(x, y, 30, 0, TAU); g.fill(); }
      g.fillStyle = P.bogie.h; g.beginPath(); g.arc(x, y, 8, 0, TAU); g.fill();
    }
  }
  // body shell (lead car has a rounded nose)
  const body = o.lead
    ? [[0, 0, 1], [1380, 0], [1500, 30], [1556, 120], [1570, 250], [1560, 360, 1], [0, 360, 1]]
    : [[0, 0, 1], [CAR, 0, 1], [CAR, 360, 1], [0, 360, 1]];
  cel(g, body, { f: P.train.f, s: P.train.s, so, h: P.train.h, hi: [[[0, 14, 1], [o.lead ? 1400 : CAR, 14, 1], [o.lead ? 1400 : CAR, 34, 1], [0, 34, 1]]], l: P.train.l, lw: 2.6 });
  cel(g, [[0, -34], [o.lead ? 1360 : CAR, -34], [o.lead ? 1420 : CAR, 0], [0, 0]], { f: P.roof.f, s: P.roof.s, so: [0, 8], l: P.roof.l, lw: 2 });
  cel(g, [[0, 360, 1], [o.lead ? 1556 : CAR, 360, 1], [o.lead ? 1540 : CAR, 400, 1], [0, 400, 1]], { f: P.bogie.f, l: P.bogie.l, lw: 2 });
  // gold line
  cel(g, [[0, 262, 1], [o.lead ? 1566 : CAR, 262, 1], [o.lead ? 1566 : CAR, 282, 1], [0, 282, 1]], { f: P.trim.f, s: P.trim.s, sh: [[[0, 276, 1], [CAR + 10, 276, 1], [CAR + 10, 282, 1], [0, 282, 1]]], l: P.trim.l, lw: 1.4 });
  // windows: warm interior light (scene) + backlit glow (glow layer)
  const ga = o.glow ?? 1;
  for (const wx of WINDOWS) {
    const gr = g.createLinearGradient(0, 80, 0, 210); gr.addColorStop(0, '#ffe9b8'); gr.addColorStop(1, '#ffb45a');
    g.fillStyle = gr; g.fillRect(wx, 80, 170, 128);
    g.fillStyle = rgba('#6a3a20', .35); g.fillRect(wx, 80, 170, 22);   // blind
    g.strokeStyle = P.train.l; g.lineWidth = 3; g.strokeRect(wx, 80, 170, 128);
    if (e) { e.fillStyle = rgba('#ffc46a', .75 * ga); e.fillRect(wx + 4, 84, 162, 120); }
  }
  // door: two panels slide apart and the gold interior spills out
  const d = o.door || 0, [d0, d1] = DOOR, mid = (d0 + d1) / 2, gap = (d1 - d0) / 2 * d;
  if (d > 0) {
    const gr = g.createLinearGradient(mid - gap, 0, mid + gap, 0); gr.addColorStop(0, '#ffd890'); gr.addColorStop(.5, '#fffaf0'); gr.addColorStop(1, '#ffd890');
    g.fillStyle = gr; g.fillRect(mid - gap, 40, gap * 2, 320);
    if (e) { e.fillStyle = rgba('#fff0c8', .95); e.fillRect(mid - gap, 40, gap * 2, 320); }
  }
  for (const [x0, dir] of [[d0, -1], [mid, 1]]) {
    const x = x0 + dir * gap;
    cel(g, [[x, 40, 1], [x + 100, 40, 1], [x + 100, 360, 1], [x, 360, 1]], { f: mix(P.train.f, P.train.h, .15), s: P.train.s, so: [-4, 6], l: P.train.l, lw: 2 });
    g.fillStyle = '#ffd890'; g.fillRect(x + 22, 80, 56, 110); g.strokeStyle = P.train.l; g.lineWidth = 2; g.strokeRect(x + 22, 80, 56, 110);
    if (e) { e.fillStyle = rgba('#ffc46a', .6 * ga); e.fillRect(x + 24, 82, 52, 106); }
  }
  if (o.lead) {   // windscreen, headlight, pantograph
    cel(g, [[1440, 40], [1510, 46], [1548, 130], [1500, 150], [1430, 140]], { f: '#2a1e3e', h: '#ffb88a', hi: [[[1460, 54], [1490, 56], [1450, 120]]], l: P.train.l, lw: 2 });
    g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(1552, 236, 16, 0, TAU); g.fill();
    if (e) { const gr = e.createRadialGradient(1552, 236, 0, 1552, 236, 120); gr.addColorStop(0, rgba('#fff2c0', 1)); gr.addColorStop(1, rgba('#fff2c0', 0)); e.fillStyle = gr; e.beginPath(); e.arc(1552, 236, 120, 0, TAU); e.fill(); }
    line(g, [[700, -34], [760, -110], [860, -150], [960, -110], [1020, -34]], P.roof.l, 4, false);
    line(g, [[800, -150], [920, -150]], P.roof.l, 5, false);
  }
}

// A whole train (lead car first) at screen position: noseX = right end of the lead car, topY = roof line, s = scale
export function train(g, e, P, noseX, topY, s, o = {}) {
  const n = o.cars ?? 4;
  for (let k = 0; k < n; k++) {
    const x = noseX - (k + 1) * (CAR + 40) * s;
    if (x > 2100 || x + CAR * s < -200) continue;
    for (const c of [g, e]) { if (!c) continue; c.save(); c.translate(x, topY); c.scale(s, s); }
    car(g, e, { ...o, P, lead: k === 0 });
    for (const c of [g, e]) if (c) c.restore();
    if (k > 0) {   // gangway between cars
      g.fillStyle = P.bogie.s; g.fillRect(x + CAR * s, topY + 40 * s, 40 * s, 300 * s);
    }
  }
}
