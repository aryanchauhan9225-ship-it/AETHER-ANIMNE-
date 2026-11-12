// The four shots. Each shot is fn(S), S = { t, lt, u, g (picture), e (glow layer), A (plates) }.
// Characters step on twos (q12) / acting on threes (q8); camera, light and the train move every frame.
import { canvas, W, H, TAU, rgba, mix, vgrad, airbrush, poly, path, cel, line, rng, LWK } from './cel.js';
import { PAL } from './pal.js';
import { girl, girlBack } from './figure.js';
import { train, CAR, WINDOWS } from './train.js';
import { speedLines, flare, lamp } from './fx.js';
import { T, q12, q8, trainX, trainV } from './story.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ss = x => x * x * (3 - 2 * x);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

// —— camera: one world → screen transform for picture and glow ——
function cam(S, s, dx = 0, dy = 0) {
  for (const c of [S.g, S.e]) c.setTransform(s, 0, 0, s, W / 2 - s * (W / 2 + dx), H / 2 - s * (H / 2 + dy));
}
// —— cel layer: drawn offscreen, pasted on the picture, and stamped black into the glow layer (glow never bleeds through a cel) ——
const [LC, LG] = canvas(W, H), [MC, MG] = canvas(W, H);
function celLayer(S, fn, wash) {
  LG.setTransform(1, 0, 0, 1, 0, 0); LG.clearRect(0, 0, W, H); LG.globalCompositeOperation = 'source-over';
  LG.setTransform(S.g.getTransform()); fn(LG);
  if (wash) { LG.setTransform(1, 0, 0, 1, 0, 0); LG.globalCompositeOperation = 'source-atop'; wash(LG); LG.globalCompositeOperation = 'source-over'; }
  S.g.save(); S.g.setTransform(1, 0, 0, 1, 0, 0); S.g.drawImage(LC, 0, 0); S.g.restore();
  MG.setTransform(1, 0, 0, 1, 0, 0); MG.globalCompositeOperation = 'source-over'; MG.clearRect(0, 0, W, H); MG.drawImage(LC, 0, 0);
  MG.globalCompositeOperation = 'source-in'; MG.fillStyle = '#000'; MG.fillRect(0, 0, W, H); MG.globalCompositeOperation = 'source-over';
  S.e.save(); S.e.setTransform(1, 0, 0, 1, 0, 0); S.e.drawImage(MC, 0, 0); S.e.restore();
}

// ============================================================ plates (painted once at load: colour + emissive pair)
function sky(g, h, sunX, sunY) {
  vgrad(g, 0, 0, W + 200, h, [[0, '#24184c'], [.32, '#6a3274'], [.6, '#d8586a'], [.82, '#ff9e62'], [1, '#ffd890']]);
  for (const [x, y, rx, ry] of [[1400, 160, 520, 40], [600, 250, 600, 34], [1650, 330, 380, 28], [300, 120, 420, 30], [1050, 420, 460, 22]]) {
    airbrush(g, x, y, rx, ry, '#5a2e66', .75, .5);
    airbrush(g, x + 40, y + ry * .7, rx * .85, ry * .32, '#ffc080', .65, .4);   // lit undersides
  }
  airbrush(g, sunX, sunY, 700, 260, '#ffe6a0', .55);
}
function buildWide() {
  const [c, g] = canvas(W, H), [ce, e] = canvas(W, H);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  sky(g, 760, 820, 660);
  g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(820, 668, 46, 0, TAU); g.fill();
  lamp(null, e, 820, 668, 40, '#ffd890', .7); airbrush(e, 820, 668, 360, 110, '#ff9a50', .22);
  // hills: far, mid, near (each a flat cel with a warm rim on the sun side)
  const hill = (pts, f, rimC) => { const P = path(pts); g.fillStyle = f; g.fill(P); g.save(); g.clip(P); g.strokeStyle = rimC; g.lineWidth = 6; g.translate(4, 3); g.stroke(P); g.restore(); };
  hill([[-50, 760], [-50, 668], [200, 640], [420, 676], [640, 650], [900, 690], [1200, 640], [1500, 676], [1800, 632], [1980, 660], [1980, 760]], '#7a4478', '#ffb07a');
  hill([[-50, 770], [-50, 710], [260, 690], [560, 722], [900, 706], [1300, 730], [1700, 700], [1980, 716], [1980, 770]], '#4e2a5a', '#ff9a6a');
  vgrad(g, 0, 740, W, H - 740, [[0, '#4a2a52'], [1, '#2a1630']]);
  // track bed towards the vanishing point VP (the train will come from there)
  const VP = [252, 742];
  g.fillStyle = '#3a2232'; g.fill(poly([[VP[0] - 6, VP[1]], [VP[0] + 16, VP[1]], [430, 1080], [-420, 1080]]));
  for (let k = 0; k < 26; k++) { const u = Math.pow(k / 26, 1.8), y = VP[1] + (1080 - VP[1]) * u, x0 = VP[0] - 6 + (-420 - VP[0]) * u, x1 = VP[0] + 16 + (430 - VP[0] - 16) * u; g.fillStyle = '#2a1824'; g.fillRect(x0, y, x1 - x0, 2 + 10 * u); }
  for (const [x1, col] of [[-250, '#ffcf9a'], [200, '#ffcf9a']]) { line(g, [[VP[0] + 2, VP[1]], [x1, 1080]], '#1a0e16', 7); line(g, [[VP[0] + 2, VP[1] - 1], [x1, 1078]], col, 2.2); }
  // catenary poles + wires (receding)
  for (const u of [.08, .2, .38, .62, 1.0]) {
    const x = VP[0] - 20 + (-160 - VP[0]) * u, yb = VP[1] + (1080 - VP[1]) * u * .9, hgt = 60 + 900 * u;
    g.fillStyle = '#2a1a2e'; g.fillRect(x - 4 - 10 * u, yb - hgt, 8 + 20 * u, hgt); g.fillRect(x - 10 * u, yb - hgt, 120 + 300 * u, 6 + 10 * u);
  }
  line(g, [[VP[0], VP[1] - 50], [200, 120], [140, -20]], '#2a1a2e', 2); line(g, [[VP[0] + 20, VP[1] - 46], [500, 190], [700, -20]], '#2a1a2e', 2);
  // platform wedge: trackside edge A, far edge B
  const A0 = [300, 742], A1 = [560, 1080], B0 = [342, 739], B1 = [2300, 1080];
  const PL = poly([A0, B0, B1, [W + 400, 1080], A1]);
  const gr = g.createLinearGradient(0, 740, 0, 1080); gr.addColorStop(0, '#c88a7a'); gr.addColorStop(1, '#8a5a6a');
  g.fillStyle = gr; g.fill(PL);
  g.save(); g.clip(PL); airbrush(g, 500, 760, 900, 120, '#ffc890', .45); g.restore();
  g.fillStyle = '#e8c070'; g.fill(poly([[306, 742], [318, 742], [640, 1080], [598, 1080]]));     // tactile strip
  g.fillStyle = '#f2e2d0'; g.fill(poly([A0, [304, 742], [574, 1080], A1]));                        // edge line
  g.fillStyle = '#2a1624'; g.fill(poly([[A0[0] - 6, 744], A0, A1, [A1[0] - 30, 1080]]));            // edge face in shadow
  // lamp post + blank name board
  g.fillStyle = '#2a1a2e'; g.fillRect(1236, 520, 10, 300); g.fillRect(1226, 516, 40, 10);
  g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(1258, 532, 9, 0, TAU); g.fill(); lamp(null, e, 1258, 532, 30, '#ffd890', .8);
  g.fillStyle = '#2a1a2e'; g.fillRect(690, 690, 6, 70); g.fillRect(770, 690, 6, 70); g.fillStyle = '#e8dccc'; g.fillRect(676, 664, 116, 34); g.strokeStyle = '#2a1a2e'; g.lineWidth = 3; g.strokeRect(676, 664, 116, 34);
  // grass beyond the platform, rimmed by the sun
  g.save(); g.clip(poly([B0, [W + 40, 742], [W + 40, 1080], B1])); vgrad(g, 0, 740, W, 340, [[0, '#6a3a5a'], [1, '#3a2040']]);
  const R = rng(5); for (let k = 0; k < 160; k++) { const x = 400 + R() * 1600, y = 760 + R() * 320, s = .4 + (y - 740) / 340; g.strokeStyle = rgba(R() < .5 ? '#ffb07a' : '#2a1630', .6); g.lineWidth = 2 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 * s, y - 24 * s); g.stroke(); }
  g.restore();
  return { c, e: ce };
}
function buildPass() {
  const [c, g] = canvas(W + 200, H), [ce, e] = canvas(W + 200, H);
  e.fillStyle = '#000'; e.fillRect(0, 0, W + 200, H);
  sky(g, 640, -200, 560);
  airbrush(e, -100, 560, 900, 260, '#ff9a50', .4);
  g.fillStyle = '#7a4478'; g.fill(path([[-50, 640], [-50, 560], [300, 530], [700, 570], [1100, 520], [1500, 566], [1900, 520], [2200, 556], [2200, 640]]));
  g.fillStyle = '#4e2a5a'; g.fill(path([[-50, 660], [-50, 600], [400, 586], [900, 612], [1400, 592], [2200, 606], [2200, 660]]));
  vgrad(g, 0, 640, W + 200, 220, [[0, '#4a2a52'], [1, '#2e1a36']]);
  line(g, [[-50, 300], [W + 250, 290]], '#2a1a2e', 2.5); line(g, [[-50, 330], [W + 250, 322]], '#2a1a2e', 1.6);
  return { c, e: ce };
}

// ============================================================ shot 1 — wide: the light on the far curve
function wide(S) {
  const { g, e, A, t } = S;
  cam(S, 1 + .06 * ss(S.u));
  g.drawImage(A.wide.c, 0, 0); e.drawImage(A.wide.e, 0, 0);
  // her long shadow (sun on the left)
  g.fillStyle = rgba('#2a1028', .35); g.fill(poly([[884, 884], [916, 884], [1240, 930], [1200, 940]]));
  const ph = q12(t) * 1.4, turn = ss(seg(q8(t), T.turn, T.turn + .5));
  celLayer(S, c => {
    c.translate(900, 884 - 1385 * .215); c.scale(-.215, .215);
    girl(c, PAL.backlit, { wind: .14, ph, rim: '#ffb070', look: [.2 + .8 * turn, 0], tilt: -.04 * turn, light: [1, -.3] });
  });
  // the hook: a headlight blooms on the far curve
  const a = seg(t, T.light, T.light + .6), grow = 1 + 2.2 * seg(t, T.light, 3);
  if (a > 0) {
    lamp(g, e, 254, 736, 5 * grow, '#fff2c0', a);
    if (t > 1.6) flare(e, 254, 736, .16 * grow * a, '#ffe0a0', { ghosts: false, streak: 500 });
  }
}

// ============================================================ shot 2 — the pass: train sweeps in behind her
function pass(S) {
  const { g, e, A, t, lt } = S;
  const v = trainV(t), fast = clamp(v / 1800, 0, 1);
  const shake = lt < .4 ? Math.sin(lt * 95) * 7 * (1 - lt / .4) : 0;
  cam(S, 1.02, -lt * 16 + shake, Math.cos(lt * 80) * 3 * (lt < .4 ? 1 - lt / .4 : 0));
  g.drawImage(A.pass.c, -100 + lt * 10, 0); e.drawImage(A.pass.e, -100 + lt * 10, 0);
  // train with motion blur (several offset copies weighted towards the newest)
  const nose = -260 + trainX(t), s = .86, top = 470;
  const [TC, TG] = A.trainCanvas, [TE, TEG] = A.trainGlow;
  TG.setTransform(1, 0, 0, 1, 0, 0); TG.clearRect(0, 0, W + 400, H); TEG.setTransform(1, 0, 0, 1, 0, 0); TEG.clearRect(0, 0, W + 400, H);
  TG.translate(200, 0); TEG.translate(200, 0);
  train(TG, TEG, PAL.dusk, nose, top, s, { cars: 5, wheelA: trainX(t) / 40, fast, glow: 1 });
  const n = fast > .05 ? 6 : 1, span = v / 24 * .9;
  for (let k = n - 1; k >= 0; k--) {
    g.globalAlpha = k === 0 ? 1 : .22; g.drawImage(TC, -200 - span * k / n, 0); g.globalAlpha = 1;
  }
  e.drawImage(TE, -200, 0);
  if (fast > .25) speedLines(g, Math.floor(t * 12), { type: 'h', n: 30, col: '#ffd8b0', a: .35 * fast, hmax: 3, seed: 3 });
  // platform floor (low angle) in front of the train
  vgrad(g, -100, 836, W + 200, 260, [[0, '#b07a74'], [1, '#6a4458']]);
  g.fillStyle = '#e8c070'; g.fillRect(-100, 850, W + 200, 14); g.fillStyle = '#f2e2d0'; g.fillRect(-100, 836, W + 200, 8);
  // the traveller: wind follows the train with a lag, she braces on threes
  const w = clamp(trainV(q12(t) - .12) / 2800 * 1.1 + .12, .12, 1);
  const bt = q8(t), brace = ss(seg(bt, 3.25, 3.55)) * (1 - ss(seg(bt, 5.0, 5.5)));
  const E = brace > .5 ? { open: .5, lid: .35, brow: [7, -2, 1], mouth: 'set' } : { open: 1, brow: [-2, -1, 2.5], mouth: 'closed' };
  celLayer(S, c => {
    c.translate(1450, 300); c.scale(-1.12, 1.12);
    girl(c, PAL.dusk, { wind: w, ph: q12(t) * 2.3, brace, E, look: [.7, 0], rim: '#ffb070', light: [1, -.25] });
  }, c => {   // window light bands sliding across her as the cars pass
    for (let k = 0; k < 8; k++) {
      const x = ((nose * 1.0 + k * 200) % 1600 + 1600) % 1600 + 300;
      const gr = c.createLinearGradient(x - 120, 0, x + 120, 0); gr.addColorStop(0, rgba('#ffc46a', 0)); gr.addColorStop(.5, rgba('#ffc46a', .22)); gr.addColorStop(1, rgba('#ffc46a', 0));
      c.fillStyle = gr; c.fillRect(x - 120, 0, 240, H);
    }
  });
}

// ============================================================ shot 3 — close: light bands slow across her face
function close(S) {
  const { g, e, A, t, lt } = S;
  cam(S, 1 + .03 * ss(S.u));
  vgrad(g, 0, 0, W, H, [[0, '#3a1e4a'], [1, '#1e1028']]);
  // the train right behind her, out of focus
  const nose = -260 + trainX(t) * 1.7;
  g.save(); g.filter = 'blur(16px)'; e.save(); e.filter = 'blur(16px)';
  train(g, e, PAL.dusk, nose + 400, 120, 1.7, { cars: 6, glow: 1, fast: 1 });
  g.restore(); e.restore();
  g.fillStyle = rgba('#24104a', .25); g.fillRect(0, 0, W, H);
  const w = clamp(.5 - lt * .22, .1, .5), op = q8(t);
  const wid = seg(op, 6.8, 7.15);   // eyes widen in three drawings
  const E = { open: .92 + .2 * wid, iris: 1 - .18 * wid, brow: [-2 - 7 * wid, -1 - 5 * wid, 2.5 + 2 * wid], mouth: wid > .5 ? 'oh' : 'closed', lid: .05 };
  LWK.k = .7;
  celLayer(S, c => {
    c.translate(920, 470); c.scale(-3.3, 3.3);
    girl(c, PAL.dusk, { wind: w, ph: q12(t) * 1.8, E, look: [.5, -.1], rim: '#ffc080', light: [1, -.3], detail: true });
  }, c => {   // the native move: window light bands sweep the held face, slowing to a stop
    const v = trainV(t), spacing = 520;
    for (let k = -1; k < 5; k++) {
      const x = ((trainX(t) * 1.7 + k * spacing) % (spacing * 4) + spacing * 4) % (spacing * 4) - 300;
      const a = .2 + .18 * clamp(1 - v / 1200, 0, 1);
      const gr = c.createLinearGradient(x - 170, 0, x + 170, 0); gr.addColorStop(0, rgba('#ffc46a', 0)); gr.addColorStop(.5, rgba('#ffd890', a)); gr.addColorStop(1, rgba('#ffc46a', 0));
      c.fillStyle = gr; c.fillRect(x - 170, 0, 340, H);
    }
  });
  LWK.k = 1;
}

// ============================================================ shot 4 — over the shoulder: the door opens
function door(S) {
  const { g, e, t } = S;
  cam(S, 1 + .05 * ss(S.u));
  sky(g, 200, 300, 200);
  line(g, [[0, 70], [W, 60]], '#2a1a2e', 2.5); line(g, [[0, 100], [W, 92]], '#2a1a2e', 1.6);
  const d = eio(seg(t, T.doorOpen, T.doorFull));
  train(g, e, PAL.dusk, 135 + 1560 * 1.25 * 2 + 40 * 1.25, 200, 1.25, { cars: 3, door: d, glow: 1 });
  vgrad(g, 0, 700, W, 380, [[0, '#a06a6a'], [1, '#5a3448']]);
  g.fillStyle = '#e8c070'; g.fillRect(0, 716, W, 16); g.fillStyle = '#f2e2d0'; g.fillRect(0, 700, W, 8);
  // light spill on the floor
  const dx = 135 + (640 + 840) / 2 * 1.25;
  if (d > 0) {
    for (const [c, a] of [[g, .55], [e, .5]]) {
      const gr = c.createLinearGradient(0, 700, 0, 1080); gr.addColorStop(0, rgba('#ffe8b0', a * d)); gr.addColorStop(1, rgba('#ffe8b0', 0));
      c.fillStyle = gr; c.fill(poly([[dx - 125 * d, 700], [dx + 125 * d, 700], [dx + 520 * d + 60, 1080], [dx - 520 * d - 60, 1080]]));
    }
  }
  const lift = ss(seg(q8(t), T.chin, T.chin + .5));
  celLayer(S, c => {
    c.translate(470, 600 - 14 * lift); c.rotate(-.05 * lift); c.scale(1.65, 1.65);
    girlBack(c, PAL.dusk, { wind: .08 + .1 * d, ph: q12(t) * 1.5, rim: d > .05 ? '#ffd890' : null });
  }, c => { c.fillStyle = rgba('#ffd890', .28 * d); c.fillRect(0, 0, W, H); });
}

export const SHOTS_FN = { wide, pass, close, door };
export function buildAssets() {
  return { wide: buildWide(), pass: buildPass(), trainCanvas: canvas(W + 400, H), trainGlow: canvas(W + 400, H) };
}

// —— sound events for the mixer: horn, every bogie crossing the camera, brakes, door, chime ——
export function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  add('bell', 0.0, { d: 2.7 }); add('light', T.light); add('hum', 2.4, { d: T.stop - 2.4 + 1.6 }); add('horn', T.horn);
  add('gust', T.horn + .05); add('brake', T.brake, { d: T.stop - T.brake });
  const offs = []; for (let k = 0; k < 5; k++) for (const bx of [250, 1310]) offs.push(-((k + 1) * (CAR + 40) - bx - 80) * .86, -((k + 1) * (CAR + 40) - bx + 80) * .86);
  for (const o of offs) {   // a wheel passes screen centre (960): clack
    let prev = -260 + trainX(T.horn) + o;
    for (let f = Math.round(T.horn * 240) + 1; f <= T.stop * 240; f++) {
      const x = -260 + trainX(f / 240) + o;
      if (prev < 960 && x >= 960) { add('clack', f / 240, { v: clamp(trainV(f / 240) / 2800 + .25, .25, 1) }); break; }
      prev = x;
    }
  }
  add('hiss', T.doorOpen); add('slide', T.doorOpen + .05, { d: T.doorFull - T.doorOpen }); add('chime', T.doorOpen + .45);
  return ev.sort((a, b) => a.t - b.t);
}
