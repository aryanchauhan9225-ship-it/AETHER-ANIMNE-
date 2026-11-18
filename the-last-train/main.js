// THE LAST TRAIN — आखिरी ट्रेन. Vertical sci-fi mystery short, 1080×1920, 24 fps, 72 s. three.js sets + one character rig (young / old)
// under a 2D overlay (subtitles, final title). Every frame is a pure function of t.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildStation, buildTrain, buildInterior, buildPerson, buildCarriageClock, PLAT_Y, WIN } from './world.js';

const W = 1080, H = 1920, DUR = 72, Q = new URLSearchParams(location.search);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); }, eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, eo = t => 1 - Math.pow(1 - clamp(t), 3), ei = t => Math.pow(clamp(t), 2.2);
const V = (x, y, z) => new THREE.Vector3(x, y, z), pulse = (t, c, w = .07) => Math.exp(-((t - c) / w) * ((t - c) / w));
// ---------------------------------------------------------------- timeline (narration starts are the clock)
const VO = [['n1', 2.0], ['n2', 11.0], ['n3', 14.4], ['n4', 21.5], ['n5', 27.0], ['n6', 31.6], ['n7', 37.6], ['n8', 44.3], ['n9', 50.8], ['n10', 58.0], ['n11', 61.2]];
const K = { stop: 18.6, doorOpen: 19.0, grab: 29.9, rise: 31.4, dark: 34.0, back: 36.4, reflRaise: 44.0, write0: 46.0, write1: 50.6, step: 51.4, flick0: 52.0, flick1: 55.8, vanish: 56.0, plat: 56.6, minute: 63.8, title: 66.4, fade: 70.6 };
const SHOTS = [   // [start, id, set]
  [0, '1a', 'st'], [4.0, '1b', 'st'], [7.6, '1c', 'st'], [10.0, '2a', 'st'], [13.2, '2b', 'st'], [16.4, '2c', 'st'], [20.0, '3a', 'st'], [22.5, '3b', 'in'], [27.0, '3c', 'in'], [28.4, '3d', 'in'],
  [32.6, '4a', 'in'], [37.0, '4b', 'in'], [40.0, '4c', 'in'], [43.0, '5a', 'in'], [46.0, '5b', 'in'], [51.0, '5c', 'in'], [53.0, '5d', 'in'], [54.4, '5e', 'in'], [K.plat, '6a', 'st'], [60.4, '6b', 'st'], [62.8, '6c', 'st'], [65.2, '6d', 'st']];
const shotAt = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x[0]) s = x; return s; };
let LINES = {}, DURS = {};

// ---------------------------------------------------------------- renderer + post (the moon reel's pipeline, rebuilt here)
const canvas = document.getElementById('gl'), ov = document.getElementById('ov'), g = ov.getContext('2d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
let ST, TR, IN, MAN, OLD, PCLOCK;   // station, train, interior, the man, his older reflection, the clock he carries out
const cam = new THREE.PerspectiveCamera(42, W / H, .03, 600);
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }), composer = new EffectComposer(renderer, rt); composer.setPixelRatio(1); composer.setSize(W, H);
let pass; const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .7, .55, .8);
const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, k: { value: 1 }, dip: { value: 0 }, t: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }',
  fragmentShader: `varying vec2 vUv; uniform sampler2D tDiffuse; uniform float k, dip, t;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; c = min(c, vec3(64.));            // guard against runaway values (no bloom squares)
      float l = dot(c, vec3(.299,.587,.114));
      c = mix(c, c * vec3(.82,.93,1.15), .6 * (1. - smoothstep(.12,.6,l)));                // blue-black shadows
      c = mix(c, c * vec3(1.12,1.0,.82), .5 * smoothstep(.35,.95,l));                       // warm golden highlights
      vec2 q = vUv - .5; c *= 1. - .6 * dot(q*vec2(1.25,.85), q*vec2(1.25,.85));
      c *= k; c = mix(c, vec3(.004,.006,.012), dip);
      c += (h(vUv * 917. + t) - .5) / 255. * 2.2;                                            // a fine film grain
      gl_FragColor = vec4(c, 1.); }` });

// ---------------------------------------------------------------- the train's motion: arrival (braking curve), stop, vanishing
const STOPX = 27.8;
function trainX(t) { if (t < 10.3) return -420; if (t < K.stop) { const u = seg(t, 10.3, K.stop); return STOPX - 260 * Math.pow(1 - u, 2.3); } if (t < K.plat) return STOPX; return STOPX + 190 * ei(seg(t, K.plat, 59.6)); }
// ---------------------------------------------------------------- the man: where he is, what he does (per time); the reflection mirrors him in the glass
const MAN_ST = V(0, PLAT_Y, 3.4);
function manPose(t) {
  const base = { t, phase: 0, walk: 0, blink: Math.max(pulse(t, 3.1), pulse(t, 9.2), pulse(t, 24.3), pulse(t, 33.0), pulse(t, 41.2), pulse(t, 48.6), pulse(t, 61.7)) };
  if (t < 20.0) { const look = t > 10.0 ? ss(seg(t, 10.3, 11.5)) : 0;   // waiting; turns his head down the track when the light appears
    return { set: 'st', pos: MAN_ST.clone(), o: { ...base, heading: Math.PI, yaw: -.9 * look + .25 * Math.sin(t * .3) * (1 - look), pitch: .05, gaze: [look * -.6, 0], brow: .3 * look } }; }
  if (t < 22.5) { const u = seg(t, 20.2, 22.3), z = lerp(3.4, 1.55, ss(u)), y = PLAT_Y + .25 * ss(seg(u, .75, 1)); return { set: 'st', pos: V(0, y, z), o: { ...base, heading: Math.PI, phase: u * 9, walk: u > 0 && u < 1 ? 1 : 0 } }; }
  // inside: down the aisle to the clock's seat, then the pickup
  const x = lerp(-6, 2.2, ss(seg(t, 22.6, 27.4))), walking = t > 22.6 && t < 27.2, P = V(x, 0, .35);
  const o = { ...base, heading: walking ? -Math.PI / 2 * 0 + Math.PI / 2 : lerp(Math.PI / 2, 0, ss(seg(t, 27.2, 27.9))), phase: (x + 6) * 2.4, walk: walking ? 1 : 0, yaw: walking ? .35 * Math.sin(t * .8) : 0 };
  if (t > 27.4) { const lean = ss(seg(t, 28.6, 29.6)) * (1 - ss(seg(t, 30.2, K.rise))); o.lean = -.72 * lean; o.pitch = .55 * ss(seg(t, 27.6, 28.4)) - .25 * lean + (t > K.rise ? -.4 * ss(seg(t, K.rise, 32.3)) : 0); o.gaze = [0, -.5];
    const clockW = V(1.95, .58, .62), chest = V(2.15, 1.22, .62);
    if (t < K.grab) o.armL = clockW.clone().lerp(V(2.1, 1.0, .5), 1 - ss(seg(t, 28.6, 29.8))); else o.armL = clockW.clone().lerp(chest, ss(seg(t, K.grab + .1, K.rise + .4)));
    o.gripL = t > K.grab ? 1 : .2; }
  if (t > 36.6) { o.pitch = lerp(o.pitch || 0, -.08, ss(seg(t, 37.2, 38.2))); o.gaze = [0, lerp(-.5, .2, ss(seg(t, 37.2, 38.0)))]; o.brow = .5 * ss(seg(t, 38.6, 39.4)); }
  if (t > K.dark && t < K.back + .4) { o.wide = .6; o.yaw = .4 * Math.sin((t - K.dark) * 1.2); }
  if (t > K.step) { const s = ss(seg(t, K.step, K.step + .6)); o.stepBack = s; o.lean = .18 * s; o.wide = 1; o.brow = 1; o.mouth = .7 * s; P.z -= .38 * s; }
  if (t > 40 && t < K.step) o.wide = .4 * ss(seg(t, 40.5, 41.5));
  if (t > K.rise) o.armL = V(2.15, 1.22, P.z + .27);   // holding the clock against his chest
  if (t >= K.plat) return { set: 'st', pos: MAN_ST.clone(), o: { ...base, heading: Math.PI + .2, pitch: -.45 * ss(seg(t, 60.6, 61.6)) + .1, yaw: -.35 * ss(seg(t, 60.6, 61.6)), armL: null, gaze: [0, .6 * ss(seg(t, 60.8, 61.4))], brow: .4, holdClock: true } };
  return { set: 'in', pos: P, o };
}
// ---------------------------------------------------------------- shots: camera per time
function shot(t) {
  const id = shotAt(t)[1], m = manPose(t), mp = m.pos, head = mp.clone().add(V(0, 1.68, 0));
  switch (id) {
    case '1a': { const u = ss(seg(t, 0, 4)); return { pos: V(lerp(-17, -12.5, u), 2.8, 6.6), look: V(lerp(-2, 0, u), 2.0, 3.0), fov: 46 }; }
    case '1b': { const u = ss(seg(t, 4, 7.6)), n = V(Math.sin(-.5), 0, Math.cos(-.5)), c = V(-3, PLAT_Y + 3.75, PLAT_Z_C()); return { pos: c.clone().add(n.clone().multiplyScalar(lerp(2.2, 1.45, u))).add(V(.25, -.35, 0)), look: c, fov: 36 }; }
    case '1c': { const u = ss(seg(t, 7.6, 10)); return { pos: V(lerp(2.6, 1.6, u), 2.35, lerp(8.2, 6.6, u)), look: V(-.3, 2.15, 1.2), fov: 44 }; }
    case '2a': return { pos: V(1.0, 2.25, 4.9), look: V(-70, 2.3, -.5), fov: 40 };
    case '2b': { const nx = trainX(t); return { pos: V(9, 1.6, 3.35), look: V(Math.min(nx - 2, 60), 2.4, 0), fov: 52 }; }
    case '2c': { const u = ss(seg(t, 16.4, 20)); return { pos: V(lerp(-2.2, -1.2, u), 2.9, lerp(10.5, 9.4, u)), look: V(0, 2.4, .2), fov: 46 }; }
    case '3a': return { pos: V(4.6, 2.3, 6.4), look: V(0, 2.2, 1.6), fov: 44 };
    case '3b': { const x = mp.x; return { pos: V(x + 3.6, 1.62, -.25), look: V(x, 1.35, .3), fov: 48 }; }
    case '3c': { const u = ss(seg(t, 27, 28.4)); return { pos: V(1.8, lerp(.85, .78, u), lerp(.05, .2, u)), look: V(1.95, .62, .62), fov: 38 }; }
    case '3d': { const u = ss(seg(t, 28.4, 32.6)); return { pos: V(lerp(-.4, -.2, u), lerp(1.5, 1.6, u), lerp(-.95, -.85, u)), look: V(2.0, lerp(.9, 1.3, u), .5), fov: 46 }; }
    case '4a': { const u = ss(seg(t, 32.6, 37)); return { pos: V(lerp(1.2, 1.4, u), 1.62, lerp(-.25, -.1, u)), look: V(2.15, 1.45, .7), fov: 42 }; }
    case '4b': { const u = ss(seg(t, 37, 40)); return { pos: V(lerp(3.0, 2.8, u), 1.66, lerp(-.15, .0, u)), look: V(2.2, 1.62, .45), fov: 40 }; }   // his face turning to the glass
    case '4c': { const u = ss(seg(t, 40, 43)); return { pos: V(lerp(2.5, 2.38, u), lerp(1.78, 1.74, u), lerp(-.55, -.25, u)), look: V(2.25, 1.68, 1.4), fov: lerp(40, 30, u) }; }   // over his shoulder: the older face in the glass
    case '5a': { const u = ss(seg(t, 43, 46)); return { pos: V(lerp(2.9, 2.8, u), 1.6, lerp(-.5, -.35, u)), look: V(2.45, 1.45, 1.4), fov: 42 }; }
    case '5b': { const u = ss(seg(t, 46, 51)); return { pos: V(lerp(3.15, 3.05, u), 1.42, lerp(-.95, -.8, u)), look: V(2.6, 1.4, 1.4), fov: 40 }; }   // the message on the glass
    case '5c': { const u = ss(seg(t, 51, 53)); return { pos: V(lerp(3.7, 3.85, u), 1.62, lerp(1.2, 1.15, u)), look: V(2.2, 1.45, .1), fov: 48 }; }   // he steps back
    case '5d': return { pos: V(3.1, 1.42, -.85), look: V(2.6, 1.4, 1.4), fov: 40 };
    case '5e': return { pos: V(3.75, 1.62, 1.15), look: V(2.2, 1.45, .05), fov: 46 };
    case '6a': { const u = ss(seg(t, K.plat, 60.4)); return { pos: V(lerp(-9, -8, u), lerp(3.2, 3.0, u), lerp(9.5, 9.0, u)), look: V(lerp(6, 12, u), 2.3, 1.0), fov: 50 }; }
    case '6b': return { pos: V(3.2, 2.3, 4.0), look: V(-.4, 2.75, 3.3), fov: 40 };
    case '6c': { const u = ss(seg(t, 62.8, 65.2)), n = V(Math.sin(-.5), 0, Math.cos(-.5)), c = V(-3, PLAT_Y + 3.75, PLAT_Z_C()); return { pos: c.clone().add(n.clone().multiplyScalar(lerp(1.5, 1.15, u))), look: c, fov: 34 }; }
    default: { const u = eio(seg(t, 65.2, DUR)); return { pos: V(lerp(.8, 6, u), lerp(2.0, 9, u), lerp(7.5, 26, u)), look: V(0, lerp(1.9, 1.4, u), lerp(3.2, 0, u)), fov: lerp(44, 50, u) }; }
  }
}
const PLAT_Z_C = () => 2.0 + 3.0;

// ---------------------------------------------------------------- overlay: subtitles, the final title
const WHITE = [246, 240, 228], GOLD = [222, 180, 110];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`;
function txt(s, x, y, o = {}) { const a = o.a ?? 1, p = o.p ?? 1; if (a <= 0 || p <= 0) return; g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.weight || 400} ${o.size || 40}px ${o.font || (o.italic ? 'CormI' : 'Corm')}`; g.letterSpacing = `${o.track ?? 0}px`; g.textBaseline = 'middle';
  const w = g.measureText(s).width, x0 = x - w / 2, sz = o.size || 40; g.beginPath(); g.rect(x0 - 10, y - sz, (w + 20) * clamp(p), sz * 2); g.clip(); g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 16; g.fillStyle = rgba(o.col || WHITE, a); g.fillText(s, x0, y);
  if (o.glow) { g.shadowColor = rgba(o.col || GOLD, .55 * a); g.shadowBlur = o.glow; g.fillText(s, x0, y); } g.restore(); }
function wrap(s, font, maxW) { g.save(); g.font = font; const words = s.split(' '), out = []; let ln = ''; for (const w of words) { const tl = ln ? ln + ' ' + w : w; if (g.measureText(tl).width > maxW && ln) { out.push(ln); ln = w; } else ln = tl; } if (ln) out.push(ln); g.restore(); return out; }
function overlay(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  for (const [id, t0] of VO) { const t1 = t0 + Math.max(1.6, (DURS[id] || 3) + .4); if (t < t0 || t >= t1 || !LINES[id]) continue; const a = Math.min(1, (t - t0) / .25, (t1 - t) / .25), en = id === 'n9', font = en ? 'italic 500 44px CormI' : '400 38px NSD';
    const L = wrap(LINES[id], font, 900); L.forEach((s, i) => { g.save(); g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,.95)'; g.shadowBlur = 14; g.fillStyle = en ? rgba(GOLD, .98) : 'rgba(246,240,228,.95)'; g.fillText(s, W / 2, H - 420 + (i - (L.length - 1)) * 56); g.restore(); }); }
  // the end title
  const ta = 1 - ss(seg(t, K.fade, DUR - .25));
  txt('THE LAST TRAIN', W / 2, 820, { size: 88, track: 16, p: eo(seg(t, K.title, K.title + 1.3)), a: ta, weight: 500, glow: 18 });
  txt('आखिरी ट्रेन', W / 2, 922, { font: 'NSD', size: 54, col: GOLD, p: eo(seg(t, K.title + .5, K.title + 1.6)), a: ta, glow: 12 });
  txt('Some journeys take you beyond time.', W / 2, 1018, { size: 42, italic: true, track: 2, col: WHITE, p: eo(seg(t, K.title + 1.4, K.title + 2.8)), a: ta * .92 });
}

// ---------------------------------------------------------------- frame
function render(t) {
  t = clamp(t, 0, DUR - 1e-4); const [, id, set] = shotAt(t), S = shot(t), m = manPose(t);
  cam.fov = S.fov; cam.position.copy(S.pos); cam.up.set(0, 1, 0); cam.lookAt(S.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  if (set === 'st') {
    pass.scene = ST.scene;
    const lampK = t > K.vanish && t < K.plat ? .05 : 1, fog = t < K.plat ? .03 : .03 + .1 * Math.sin(Math.PI * seg(t, K.plat + .4, 60.6));   // the fog surges and swallows the train
    ST.update(t, { minute: t < K.minute ? 7 : 8, sec: t < K.minute ? (t * 1 + 22) % 60 : (t - K.minute) % 60, lampK, camQuat: cam.quaternion, fog, mistK: t > K.plat ? 1.6 : 1 });
    const lit = t < K.plat ? 1 : 1 - ss(seg(t, 58.2, 60.0)); TR.group.visible = t > 10.3 && t < 60.4; TR.set(trainX(t), lit * (t < 10.3 ? 0 : 1), ss(seg(t, K.doorOpen, K.doorOpen + .8)));
    { const nd = Math.abs(cam.position.x - trainX(t)) + Math.abs(cam.position.z); TR.beam.material.uniforms.k.value *= clamp((nd - 40) / 60); TR.head.material.emissiveIntensity *= .4 + .6 * clamp((nd - 25) / 40); } TR.flare.scale.setScalar(2.5 + 5 * seg(t, 10.3, 13)); TR.flare.material.opacity = (1 - .85 * ss(seg(t, 13.2, 14.4))) * (t < K.plat ? 1 : 0);
    ST.scene.add(MAN.root); MAN.root.visible = !(t > 22.1 && t < K.plat); MAN.root.position.copy(m.pos); MAN.pose(m.o);
    PCLOCK.visible = t >= K.plat; if (PCLOCK.visible) { const hw = MAN.handWorld(-1); PCLOCK.position.copy(hw).add(V(0, -.07, 0)); PCLOCK.rotation.set(0, Math.PI + .2, 0); PCLOCK.userData.setTime(0, 7, (t * 1) % 60); }
  } else {
    pass.scene = IN.scene; IN.scene.add(MAN.root); MAN.root.visible = true; MAN.root.position.copy(m.pos); MAN.pose(m.o);
    // lights: warm and slightly unsteady → off at the touch → one lamp stutters back → rapid flicker
    let lampK = .9 + .1 * Math.sin(t * 23) * Math.sin(t * 7.1), keyK = 0;
    if (t > K.dark) { lampK = 0; keyK = t > K.back ? (t < K.back + .9 ? (Math.sin(t * 47) > 0 ? .9 : .05) : .85) : 0; }
    if (t > K.flick0) { const f = (Math.sin(t * 71) * Math.sin(t * 29.3) > -.1) ? 1 : .04; keyK = .9 * f; lampK = .5 * f * (Math.sin(t * 13) > .2 ? 1 : 0); }
    IN.lamps.forEach(l => { l.b.material.emissiveIntensity = 3 * lampK; if (l.l) l.l.intensity = 8 * lampK; });
    IN.key.intensity = 9 * keyK; IN.keyMirror.intensity = 6 * keyK; IN.hemi.intensity = t > K.dark ? .05 : .25;
    // the clock: on the seat until he lifts it, then in his left hand
    if (t < K.grab) { IN.clock.position.set(1.95, .52, .62); IN.clock.rotation.set(0, Math.PI, 0); } else { const hw = MAN.handWorld(-1); IN.clock.position.copy(hw).add(V(.02, -.08, .02)); IN.clock.rotation.set(0, Math.PI + .25, 0); }
    IN.clock.userData.setTime(0, 7, (t * 1 + 22) % 60);
    // the reflection: the same man, older, mirrored across the glass (z → 2·WIN.z − z); in step with him until it raises its own hand
    const show = t > K.back; OLD.root.visible = show;
    if (show) { const P = m.pos.clone(); P.z = 2 * WIN.z - P.z; OLD.root.position.copy(P); OLD.root.scale.set(1, 1, -1);
      const o = { ...m.o, t, heading: -(m.o.heading || 0), armL: m.o.armL ? V(m.o.armL.x, m.o.armL.y, 2 * WIN.z - m.o.armL.z) : null, stepBack: 0, lean: 0, mouth: 0, wide: 0, brow: .15, blink: Math.max(pulse(t, 45.4), pulse(t, 53.6)) };
      if (t > K.step) { o.yaw = 0; o.pitch = -.05; }   // he steps back; it does not
      if (t > K.reflRaise) { const tip = IN.writeFog(seg(t, K.write0, K.write1), 1), tw = tip ? V(WIN.x - (tip[0] - .5) * WIN.w, (WIN.y0 + WIN.y1) / 2 + (.5 - tip[1]) * (WIN.y1 - WIN.y0), WIN.z + .02) : V(WIN.x - .15, 1.62, WIN.z + .02);
        const up = ss(seg(t, K.reflRaise, K.reflRaise + 1.4)), rest = V(P.x + .25, 1.0, P.z - .25); o.armR = rest.lerp(t < K.write1 + .3 ? tw : V(WIN.x - .1, 1.25, WIN.z + .02), up); o.point = true; }
      OLD.pose(o); OLD.root.scale.set(1, 1, -1); IN.scene.add(OLD.root); }
    if (t < K.reflRaise) IN.writeFog(0, 1);
    IN.update(t);
  }
  // dips (between some shots, the blackout, the vanishing) — never pure black
  let dip = 0; if (t > K.vanish - .05 && t < K.plat + .2) dip = Math.max(dip, Math.sin(Math.PI * seg(t, K.vanish - .05, K.plat + .2)) * .92);
  for (const c of [22.5, 20.0, 60.4, 62.8]) dip = Math.max(dip, (1 - Math.abs(t - c) / .22) * .7);
  grade.uniforms.dip.value = clamp(dip); grade.uniforms.t.value = Math.floor(t * 24) * .37;
  grade.uniforms.k.value = lerp(.25, 1, ss(seg(t, 0, 1.4))) * (1 - ss(seg(t, K.fade, DUR - .1)) * .985);
  bloom.strength = set === 'in' && t > K.dark && t < K.back ? .9 : .7;
  composer.render(); overlay(t);
}
function events() {
  const ev = VO.map(([id, t]) => ({ t, type: 'line', id })), E = (t, type, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  E(.2, 'amb'); E(4.0, 'clock_close'); E(10.3, 'light_far'); E(10.8, 'horn_far'); E(12.6, 'horn'); E(13.2, 'pass'); E(15.6, 'brake'); E(K.stop, 'stop'); E(K.doorOpen, 'door');
  for (let k = 0; k < 6; k++) E(20.25 + k * .38, 'step', { surf: k < 5 ? 'platform' : 'metal' }); for (let k = 0; k < 13; k++) { const t = 22.7 + k * .37; if (t > 27.2) break; E(t, 'step', { surf: 'wood' }); }
  E(28.4, 'tick_close'); E(K.grab, 'grab'); E(K.dark, 'lights_off'); E(K.back, 'flicker_on'); E(39.4, 'sting'); E(K.reflRaise, 'squeak_start'); E(K.write0, 'write', { d: K.write1 - K.write0 }); E(K.step, 'impact'); E(K.flick0, 'flicker_fast', { d: K.flick1 - K.flick0 });
  E(K.vanish, 'vanish'); E(K.plat, 'platform'); E(K.minute, 'minute'); E(K.title, 'title'); E(K.fade, 'end');
  return ev.sort((a, b) => a.t - b.t);
}
window.DUR = DUR; window.render = render; window.EV = events(); window.TEXTS = () => [];
(async () => {
  for (const f of ['700 88px NSD', '500 88px Corm', 'italic 400 42px CormI', '400 38px NSD']) await document.fonts.load(f, 'THE LAST आखिरी ट्रेन प्लेटफ़ॉर्म');
  ST = buildStation(); TR = buildTrain(); ST.scene.add(TR.group); TR.group.position.z = 0; IN = buildInterior(); MAN = buildPerson(false); OLD = buildPerson(true);
  PCLOCK = buildCarriageClock(); ST.scene.add(PCLOCK);
  pass = new RenderPass(ST.scene, cam); composer.addPass(pass); composer.addPass(bloom); composer.addPass(grade); composer.addPass(new OutputPass());
  try { const L = await (await fetch('lines.json')).json(); L.forEach(l => LINES[l.id] = l.text); DURS = await (await fetch('voices/dur.json')).json(); } catch (e) { }
  render(Number(Q.get('t') ?? 8)); window.READY = true;
})();
