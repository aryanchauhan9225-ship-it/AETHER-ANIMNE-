// THE LAST HOTEL ROOM — Liminal Found Footage (Lemo-Opuscar), 9:16
// three.js (540×960) → GTAO + physical DOF (autofocus hunting) + bloom → VHS camcorder pass → 1080×1920
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { clamp, seg, ss, lerp, hash, vnoise, env } from '/core/lib.js';
import { DUR, T, LINES, POS, YAW, PITCH, FOV, FOCUS, APER, FEAR, setAt, clock, DATE, battery, ringing } from './story.js';
import { buildWorld, U, SET } from './world.js';
import { VHS } from './vhs.js';
import { drawOSD, text as osdText, width as osdW } from './osd.js';
import { buildCaps, drawCaps } from './subs.js';

const Q = new URLSearchParams(location.search);
const NOSUB = Q.has('nosub'), RAW = Q.has('raw');
for (const f of ["600 30px 'IBM Plex Mono'", "500 30px 'IBM Plex Mono'"]) await document.fonts.load(f);
const W = 1080, H = 1920, SW = 540, SH = 960;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = .95;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0, 0, 0);
const camera = new THREE.PerspectiveCamera(60, SW / SH, .03, 140); camera.rotation.order = 'YXZ';
const post = makePost(renderer, scene, camera, SW, SH, { ssaa: 1, ao: true, aoRadius: .5, aoThickness: 1.2, aoScale: 1.5, aoAmt: .7 });
post.bloom.strength = .55; post.bloom.radius = .6; post.bloom.threshold = 1.0;
post.vig.uniforms.amt.value = 0; post.vig.uniforms.contrast.value = 0; post.vig.uniforms.sat.value = 1;
post.dof.maxCoc = 14;
const osdCv = document.createElement('canvas'); osdCv.width = SW; osdCv.height = SH;
const osdTex = new THREE.CanvasTexture(osdCv); osdTex.minFilter = osdTex.magFilter = THREE.LinearFilter; osdTex.generateMipmaps = false;
const vhs = new ShaderPass(VHS);
vhs.uniforms.tOSD.value = osdTex; vhs.uniforms.res.value = [W, H]; vhs.uniforms.src.value = [SW, SH];
if (RAW) Object.assign(vhs.uniforms, {}), ['sharp', 'gain', 'jitter', 'barrel', 'dropout', 'smear', 'chromaShift'].forEach(k => vhs.uniforms[k].value = 0);
post.composer.addPass(vhs);

const W_ = buildWorld(scene);
const ov = document.getElementById('ov'), ox = ov.getContext('2d');
const fetchJ = async (p, d) => { try { const r = await fetch(p); return r.ok ? await r.json() : d; } catch { return d; } };
const DURS = await fetchJ('voices/dur.json', {});
const CAPS = buildCaps(DURS);

// —— gait from distance walked (cuts excluded) ——
const DT = 1 / 240, NS = Math.ceil(DUR / DT) + 2, DIST = new Float32Array(NS);
for (let k = 1; k < NS; k++) { const a = POS((k - 1) * DT), b = POS(k * DT); const d = Math.hypot(b[0] - a[0], b[1] - a[1]); DIST[k] = DIST[k - 1] + (d > .2 ? 0 : d); }
const distAt = t => { const f = clamp(t / DT, 0, NS - 1.001), i = Math.floor(f); return lerp(DIST[i], DIST[i + 1], f - i); };
const speedAt = t => (distAt(t + .15) - distAt(t - .15)) / .3;
const STRIDE = .7;
const nz = (t, f, s) => vnoise(t * f + s * 17.3) - .5;
const holdAt = t => 1 - env(t, T.hush[0] - .1, T.hush[1] + .15, .08, .3);
function camPose(t) {
  const [x, z] = POS(t); let yaw = YAW(t), pitch = PITCH(t), roll = .01;
  const sp = speedAt(t), amp = clamp(sp / 1.2), ph = distAt(t) / STRIDE * Math.PI, fear = FEAR(t), hold = holdAt(t);
  let y = 1.58 + .03 * amp * (Math.abs(Math.sin(ph)) - .6);
  const sway = .016 * amp * Math.sin(ph), br = Math.sin(t * Math.PI * 2 * .27);
  pitch += (nz(t, 1.1, 1) * .016 + nz(t, 3.7, 2) * .006 * (1 + 2.5 * fear) + nz(t, 9.5, 3) * .003 * fear + br * .006) * hold;
  yaw += (nz(t, .9, 4) * .018 + nz(t, 3.3, 5) * .006 * (1 + 2.5 * fear) + .01 * amp * Math.sin(ph)) * hold;
  roll += (nz(t, .6, 6) * .035 + .012 * amp * Math.sin(ph) + nz(t, 7, 7) * .004 * fear) * hold;
  y += br * .006 * hold;
  const rx = Math.cos(yaw), rz = -Math.sin(yaw);
  return { x: x + rx * sway * hold, y, z: z + rz * sway * hold, yaw, pitch, roll, amp, ph };
}
// global sconce flicker + auto-exposure memory
function gLight(t) { let g = 1; T.flick.forEach((f, i) => { if (t > f - .03 && t < f + .1) g = .03; }); return g; }
function darkMem(t) { let s = 0, w = 0; for (let k = 0; k < 30; k++) { const d = k * .03, e = Math.exp(-d / .45); s += (1 - gLight(t - d)) * e; w += e; } return s / w; }

const v3 = (a, b, c) => new THREE.Vector3(a, b, c);
const fwd = new THREE.Vector3();
function setLights(t, set, cp) {
  const PL = U.uPL.value, PC = U.uPC.value; PC.forEach(c => c.set(0, 0, 0));
  let n = 0; const put = (o, x, y, z, r, g, b) => { if (n < 16) { PL[n].set(o.x + x, y, o.z + z); PC[n].set(r, g, b); n++; } };
  const fl = (s, rate = 13) => .82 + .18 * vnoise(t * rate + s);
  if (set === 'ext') {
    const flash = Math.max(env(t, T.flash, T.flash + .1, .01, .05), .6 * env(t, T.flash + .18, T.flash + .26, .01, .06));
    const lampOn = hash(Math.floor(t * 12) * .37) > .12 ? 1 : .2;
    put(SET.ext, 3.1, 3.9, -6.9, .9 * lampOn * fl(1), .6 * lampOn * fl(1), .32 * lampOn);
    const win = t < T.winOn ? 0 : (t < T.winOn + .25 ? (hash(Math.floor(t * 24)) > .5 ? 1 : 0) : 1);
    put(SET.ext, 2.9 * 2, 12.9, -8.2, 2.4 * win, 1.6 * win, .8 * win);
    put(SET.ext, -7, 10, -2, .9, 1.0, 1.35); put(SET.ext, 9, 8, -3, .7, .8, 1.1); put(SET.ext, 0, 15, -3.5, .6, .7, .95);   // cold city spill washing the façade
    put(SET.ext, -3.1, 3.9, -6.9, .05 * fl(9), .03, .01);
    U.uAmb.value.set(.03 + 1.2 * flash * .1, .036 + 1.3 * flash * .1, .055 + 1.6 * flash * .1);
    U.uFogCol.value.setRGB(.05 + .25 * flash, .058 + .27 * flash, .08 + .32 * flash); U.uFogD.value = .04;
    W_.win309.material.uniforms.emit.value = 1.9 * win; W_.lampMat.uniforms.emit.value = 1.4 * lampOn;
    U.uTI.value = 16;
    scene.background.setRGB(.035 + .3 * flash, .04 + .32 * flash, .06 + .38 * flash);
  } else if (set === 'lobby') {
    for (const z of [-7.5, -3.5, .5]) put(SET.lobby, -8.3, 2.7, z, .5, .6, .85);
    put(SET.lobby, 4.5, 3.5, -8.5, .08, .07, .05);
    U.uAmb.value.set(.022, .022, .026); U.uFogCol.value.setRGB(.035, .033, .03); U.uFogD.value = .05; U.uTI.value = 14;
    scene.background.setRGB(.004, .004, .004);
  } else {
    const g = gLight(t);
    const sc = W_.sconces;
    sc.forEach((s, i) => { const alive = i === 5 ? (hash(Math.floor(t * 9 + 3)) > .25 ? 1 : .3) : i === 7 ? 1 : 0; const k = alive * g;
      s.mat.uniforms.emit.value = 1.6 * k; if (k > 0) put(SET.hall, s.x, s.y, s.z, .55 * k, .4 * k, .22 * k); });
    const open = ss(seg(t, T.door[0], T.door[1])), inRoom = seg(t, 26.4, 28.4);
    const cf = (.3 + .7 * open);
    for (const [k, dx] of [[0, -.14], [1, .14]]) put(SET.hall, dx, 1.14, -13.6, .75 * cf * fl(k * 7, 17), .42 * cf * fl(k * 7, 17), .16 * cf);
    put(SET.hall, .2, 1.3, -11.6, .3 + .5 * open, .18 + .3 * open, .07 + .1 * open);   // spill at the doorway
    const r = ringing(t) ? 1 : 0, wz = t > T.waltz && t < T.ringStop ? 1 : 0;
    put(SET.hall, -1.9, .95, -12.5, .1 * wz, .06 * wz, .02 * wz);
    put(SET.hall, 0, 1.7, -15.8, .06, .08, .12);
    put(SET.hall, 2.0, .95, -12.3, .25 * (.6 + .4 * r), .02, .02);   // the red phone's own glow
    W_.radioDial.material.uniforms.emit.value = wz ? 1.4 + .2 * Math.sin(t * 3) : .1;
    W_.flames.forEach((f, i) => { const k = fl(i * 7, 17); f.scale.set(1, .8 + .5 * k, 1); f.material.uniforms.emit.value = 3 * k; });
    W_.candleGlow.material.uniforms.alpha.value = .1 * cf;
    W_.blade.material.uniforms.alpha.value = .5 * (1 - open);
    U.uAmb.value.set(.010, .008, .007); U.uFogCol.value.setRGB(.04, .032, .02); U.uFogD.value = .06;
    U.uTI.value = lerp(5.5, 2.2, inRoom) * g;
    scene.background.setRGB(.004, .003, .002);
  }
  // the torch, held below and right of the camcorder, lagging the camera a little
  const rx = Math.cos(cp.yaw), rz = -Math.sin(cp.yaw);
  U.uTP.value.set(cp.x + rx * .18, cp.y - .25, cp.z + rz * .18);
  fwd.set(-Math.sin(cp.yaw - .03) * Math.cos(cp.pitch - .06), Math.sin(cp.pitch - .06), -Math.cos(cp.yaw - .03) * Math.cos(cp.pitch - .06)).normalize();
  U.uTD.value.copy(fwd);
}

function render(t) {
  const tv = Math.min(t, T.recOff + .02);
  const cp = camPose(tv), set = setAt(tv);
  for (const k in W_.sets) W_.sets[k].visible = k === set;
  W_.rain.visible = set === 'ext';
  camera.position.set(cp.x, cp.y, cp.z); camera.rotation.set(cp.pitch, cp.yaw, cp.roll);
  camera.fov = FOV(tv); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  U.uTime.value = tv; W_.rainMat.uniforms.uCam.value.copy(camera.position);
  setLights(tv, set, cp);
  // animated props
  W_.pendulum.rotation.z = .11 * Math.sin(tv * Math.PI);
  W_.lobbyHands.rotation.z = -(Math.floor(tv) % 60) / 60 * Math.PI * 2;
  W_.roomHands.rotation.z = -(Math.floor(tv) % 60) / 60 * Math.PI * 2;
  W_.door.rotation.y = .12 + 1.2 * ss(seg(tv, T.door[0], T.door[1])) + .01 * ss(seg(tv, T.door[0] - .5, T.door[0]));
  const r = ringing(tv);
  W_.handset.position.y = .2 + (r ? (hash(Math.floor(tv * 30)) - .5) * .008 : 0); W_.handset.rotation.x = r ? (hash(Math.floor(tv * 30) + 3) - .5) * .06 : 0;
  // focus / VHS
  post.dof.focus = FOCUS(tv); post.dof.aper = APER(tv);
  const u = vhs.uniforms, dm = darkMem(tv), f = Math.floor(t * 30);
  u.frame.value = f;
  const awb = ss(seg(t, T.rollIn, T.rollIn + 1.6));
  u.tint.value = [lerp(.8, 1.02, awb), lerp(.92, .98, awb), lerp(1.4, .88, awb) * (1 + .04 * Math.sin(t * .31))];
  u.expo.value = (1 + .5 * dm) * (.98 + .03 * Math.sin(t * .47));
  u.gain.value = .04 + .09 * dm + .02 * seg(64 - FOV(tv), 0, 30) + .015 * FEAR(tv);
  let track = 0, roll = 0;
  if (t < T.rollIn + .5) { const k = 1 - seg(t, T.rollIn, T.rollIn + .5); track = k; roll = k * k * .4; }
  for (const tr of [T.tear1, T.tear2]) { track = Math.max(track, env(t, tr[0], tr[1], .06, .2)); if (t > tr[0] && t < tr[1]) roll = (hash(f * .7) - .5) * .1 * (1 - seg(t, tr[1] - .2, tr[1])); }
  if (t > T.recOff) track = Math.max(track, seg(t, T.recOff, T.recOff + .15));
  u.track.value = track; u.roll.value = roll;
  u.off.value = t < T.rollIn ? 1 : t > T.recOff + .2 ? 1 : 0;
  drawOSD(osdCv, { hide: t < T.rollIn || t > T.recOff + .2, t, rec: t >= T.rollIn && t < T.recOff, clock: clock(t), date: DATE, bat: battery(t), batBlink: false });
  osdTex.needsUpdate = true;
  post.composer.render();
  ox.clearRect(0, 0, W, H);
  if (!NOSUB && t < T.recOff + .05) drawCaps(ox, CAPS, t);
  if (t >= T.recOff + .2) title(t);
}
// camcorder title generator on black after the tape stops
function title(t) {
  ox.fillStyle = '#000'; ox.fillRect(0, 0, W, H);
  if (t < T.title[0]) return;
  const n = Math.floor((t - T.title[0]) * 14), L1 = 'ROOM 309', L2 = 'CHECK-IN NEVER ENDS';
  const s1 = 13, s2 = 8;
  osdText(ox, L1.slice(0, Math.min(n, L1.length)), (W - osdW(L1, s1)) / 2, 800, s1, '#f2efe4', false);
  if (n > L1.length + 2) osdText(ox, L2.slice(0, Math.min(n - L1.length - 2, L2.length)), (W - osdW(L2, s2)) / 2, 960, s2, '#c9c2a8', false);
}
window.TEXTS = t => t >= T.title[0] ? [{ id: 'title', text: 'ROOM 309 CHECK-IN NEVER ENDS', x0: 100, y0: 790, x1: 980, y1: 1030 }] : [];

// —— events for the mixer ——
const EV = [];
LINES.forEach(l => EV.push({ t: l.t, type: 'line', id: l.id, who: l.who }));
{ let last = 0; for (let t = 0; t < T.recOff; t += 1 / 120) { const n = Math.floor(distAt(t) / STRIDE); if (n > last) { last = n; EV.push({ t, type: 'step', v: clamp(speedAt(t) / 1.2, .35, 1.1), set: setAt(t) }); } } }
EV.push({ t: T.rollIn - .25, type: 'recOn' }, { t: T.recOff, type: 'recOff' }, { t: T.flash, type: 'thunder' }, { t: T.winOn, type: 'click' });
for (const tr of [T.tear1, T.tear2]) EV.push({ t: tr[0], type: 'tear', d: tr[1] - tr[0] });
EV.push({ t: T.hush[0], type: 'hush', d: T.hush[1] - T.hush[0] }, { t: T.door[0], type: 'door', d: T.door[1] - T.door[0] });
for (const z of [T.zoom1, T.zoom2, T.zoom3]) EV.push({ t: z[0], type: 'zoom', d: z[1] - z[0] });
for (const a of [.5, 4.1, 4.6, 7.7, 12.3, 12.8, 32.3, 32.8]) EV.push({ t: a, type: 'af' });
T.flick.forEach(f => EV.push({ t: f - .03, type: 'flick' }));
for (let t = T.ring; t < T.ringStop; t += 3) { EV.push({ t, type: 'ring', d: .4 }); if (t + .6 < T.ringStop) EV.push({ t: t + .6, type: 'ring', d: Math.min(.4, T.ringStop - t - .6) }); }
EV.push({ t: T.waltz, type: 'waltz', d: T.ringStop - T.waltz });
for (let k = 0; k < 40; k++) { const t = T.tick1 + k; if (t < 13.35) EV.push({ t, type: 'tick', v: .8 }); }
for (let t = Math.ceil(T.push[0]); t < T.ringStop; t++) EV.push({ t, type: 'tick', v: t < 25.4 ? .5 : 1 });
for (let k = 0; k < 27; k++) EV.push({ t: T.title[0] + k / 14, type: 'beep', v: k === 8 || k === 9 ? 0 : 1 });
EV.push({ t: T.turnBack[0], type: 'rustle', v: .8 }, { t: T.turnPhone[0], type: 'rustle', v: .5 });
CAPS.forEach(c => EV.push({ t: c.t0, type: 'cap', t1: c.t1, text: c.text }));
EV.sort((a, b) => a.t - b.t);
// ?from=A&to=B renders one span of the same timeline (used to re-render a fixed stretch without touching the rest)
const FROM = Number(Q.get('from') ?? 0), TO = Number(Q.get('to') ?? DUR);
window.DUR = TO - FROM; window.EV = EV; window.render = t => render(t + FROM);
render(Number(Q.get('t') ?? 0));
window.READY = true;
