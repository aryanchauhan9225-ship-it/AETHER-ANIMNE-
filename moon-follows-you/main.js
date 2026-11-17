// WHY DOES THE MOON FOLLOW YOU? — चाँद हमारा पीछा क्यों करता है?  (The Aryanzz Teams)
// 60 s vertical science-mystery reel, 1080×1920, 24 fps. three.js world (sky at infinity + moonlit landscape + walker; Earth–Moon at true scale)
// under a 2D overlay (typography, diagrams, subtitles). Every frame is a pure function of t.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildSky, buildWorld, buildWalker, buildSpace, heightAt, MOON_DIR, mulberry } from './world.js';

const W = 1080, H = 1920, DUR = 60, Q = new URLSearchParams(location.search);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); }, eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, eo = t => 1 - Math.pow(1 - clamp(t), 3);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------------------------------------------------------- timeline
const T = { s2: 7.0, s2b: 10.4, s2c: 13.8, s3: 17.0, space: 21.0, s4: 25.0, s4b: 31.4, s5: 42.0, s6: 53.0 };
const VO = [['m1', .6], ['m2', 7.5], ['m3', 12.4], ['m4', 17.4], ['m5', 20.6], ['m6', 25.6], ['m7', 32.0], ['m8', 42.6], ['m9', 47.4], ['m10', 53.6]];
let LINES = {}, DURS = {};
// ---------------------------------------------------------------- the walker's path (world): S1 down the road (−z) → the junction → the side path (+x) → back → …
function walkerAt(t) {
  const v = 1.3, H0 = 0, HR = -Math.PI / 2, HL = Math.PI / 2;
  if (t < 10.0) return { x: 0, z: 1 - v * t, h: H0, ph: t * 4.1, w: 1 };
  if (t < 10.7) { const u = seg(t, 10.0, 10.7); return { x: 0, z: -12, h: lerp(H0, HR, ss(u)), ph: t * 4.1, w: .6 }; }
  if (t < 14.2) return { x: v * (t - 10.7), z: -12, h: HR, ph: t * 4.1, w: 1 };
  if (t < 14.9) { const u = seg(t, 14.2, 14.9); return { x: 4.55, z: -12, h: lerp(HR, HL - Math.PI * 2, ss(u)), ph: t * 4.1, w: .5 }; }
  if (t < 17.0) return { x: 4.55 - v * (t - 14.9), z: -12, h: HL, ph: t * 4.1, w: 1 };
  if (t < T.s4b) { const u = seg(t, 17.0, 17.7); return { x: 1.82, z: -12 - Math.max(0, t - 17.7) * v, h: lerp(HL, 0, ss(u)), ph: t * 4.1, w: 1 }; }
  if (t < T.s5) { const u = seg(t, 32.2, 39.8); return { x: lerp(1, 19, eio(u)), z: -12, h: HR, ph: t * 5.2, w: u > 0 && u < 1 ? 1 : 0 }; }   // the top-down demo: A → B
  if (t < T.s6) return { x: -1 + 1.55 * (t - T.s5), z: -12, h: HR, ph: t * 4.6, w: 1 };                                                       // the lateral parallax walk
  return { x: 0, z: -20, h: 0, ph: 0, w: 0, look: .22 * ss(seg(t, 54.5, 56.5)) };                                                               // standing under the moon
}
// ---------------------------------------------------------------- shots: camera per time (world or space)
function shot(t) {
  const w = walkerAt(t);
  if (t < T.s2) { const k = ss(t / 7); return { pos: V3(w.x + .7, 2.25, w.z + lerp(10.5, 8.0, k)), look: V3(w.x, 2.25 + 2.8, w.z - 40), fov: 42 }; }   // behind the walker; the moon ahead in the sky
  if (t < T.s2b) { const k = ss(seg(t, T.s2, T.s2b)); return { pos: V3(lerp(2.5, 3.2, k), lerp(3.0, 3.4, k), lerp(4.5, 3.0, k)), look: V3(-.5, 4.6, -44), fov: 40 }; }   // high three-quarter: the junction, the turn
  if (t < T.s2c) { const k = ss(seg(t, T.s2b, T.s2c)); return { pos: V3(lerp(2, 3.4, k), 2.6, 6), look: V3(lerp(2, 3.4, k) - 3, 5.4, -45), fov: 42 }; }   // wide, translating only: the moon holds still
  if (t < T.s3) { const x = clamp(w.x, -2, 6); return { pos: V3(x, 1.65, -3.2), look: V3(x, 1.65 + 3.9, -48), fov: 40 }; }   // tracking alongside, pure translation: forward, back — the moon stays
  if (t < T.space) { const k = eio(seg(t, T.s3, T.space)), y = lerp(2.2, 460, Math.pow(k, 1.6)); return { pos: V3(1.8, y, lerp(-6, 120, k)), look: V3(1.8, lerp(5, 160, k) + y * .55, -700), fov: lerp(40, 46, k) }; }   // the crane up through the cloud
  if (t < T.s4b) { // space: from close to Earth, up along the line to the Moon, then back to the whole true-scale gap
    const a = eio(seg(t, T.space, T.s4)), b = eio(seg(t, T.s4, 29.8));
    const p = V3(lerp(3.2, 0, b), lerp(-1.4, 30.5, b), lerp(7.2, 100, b)), l = V3(0, lerp(lerp(.5, 3.2, a), 30.5, b), 0);
    return { space: true, pos: p, look: l, fov: lerp(38, 40, b) }; }
  if (t < T.s5) { const k = ss(seg(t, T.s4b, T.s5)); return { pos: V3(10, lerp(62, 56, k), -9), look: V3(10, 0, -9.1), up: V3(0, 0, -1), fov: 48 }; }   // top-down: the demo; −z (towards the Moon) is up
  if (t < T.s6) { const x = -1 + 1.55 * (t - T.s5); return { pos: V3(x, 1.7, 3.0), look: V3(x, 1.7 + 3.0, -48), fov: 46 }; }   // the lateral tracking parallax shot
  const k = eio(seg(t, T.s6, DUR)); return { pos: V3(lerp(.8, 7, k), lerp(1.7, 16, k), lerp(-15.5, 30, k)), look: V3(0, lerp(4.8, 9, k), -70), fov: lerp(36, 46, k) };   // the final pull back
}
// cuts are dips through deep midnight blue (never black); the climb into space passes through cloud
const CUTS = [T.s2, T.s2b, T.s2c, T.s4b, T.s5, T.s6];

// ---------------------------------------------------------------- three
const canvas = document.getElementById('gl'), ov = document.getElementById('ov'), g = ov.getContext('2d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
const sky = buildSky(), world = buildWorld(), walker = buildWalker(), space = buildSpace(); world.scene.add(walker.root);
const cam = new THREE.PerspectiveCamera(35, W / H, .1, 4000), skyCam = new THREE.PerspectiveCamera(35, W / H, 1, 2000), spaceCam = new THREE.PerspectiveCamera(40, W / H, .05, 20000);
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt); composer.setPixelRatio(1); composer.setSize(W, H);
const passA = new RenderPass(sky.scene, skyCam), passB = new RenderPass(world.scene, cam); passB.clear = false; passB.clearDepth = true;
composer.addPass(passA); composer.addPass(passB);
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .45, .5, .86); composer.addPass(bloom);
const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, k: { value: 1 }, dip: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }',
  fragmentShader: `varying vec2 vUv; uniform sampler2D tDiffuse; uniform float k, dip;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(.299,.587,.114));
      c = mix(c, c * vec3(.86,.95,1.12), .55 * (1. - smoothstep(.15,.7,l)));          // midnight-blue shadows
      c += vec3(.045,.03,.0) * smoothstep(.45,.95,l);                                    // a warm, golden lift in the highlights
      c = c * k + vec3(.012,.02,.04) * (1. - k);
      vec2 q = vUv - .5; c *= 1. - .55 * dot(q*vec2(1.2,.9), q*vec2(1.2,.9));            // vignette
      c = mix(c, vec3(.018,.03,.065), dip);                                              // the dip between shots (midnight, not black)
      c += (h(vUv * 917.) - .5) / 255. * 1.5;                                            // static dither against banding
      gl_FragColor = vec4(c, 1.); }` });
composer.addPass(grade); composer.addPass(new OutputPass());

// ---------------------------------------------------------------- overlay helpers
const GOLD = [214, 176, 108], WHITE = [246, 240, 228], SILVER = [200, 214, 240];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`;
function txt(s, x, y, o = {}) {   // o: size, font, col, a, track, align, p (written by a growing clip with a bright edge), italic, weight
  const p = o.p ?? 1, a = o.a ?? 1; if (p <= 0 || a <= 0) return; g.save();
  g.font = `${o.italic ? 'italic ' : ''}${o.weight || 400} ${o.size || 40}px ${o.font || (o.italic ? 'CormI' : 'Corm')}`; g.letterSpacing = `${o.track ?? 0}px`; g.textBaseline = 'middle';
  const w = g.measureText(s).width, x0 = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2, sz = o.size || 40;
  g.beginPath(); g.rect(x0 - 8, y - sz, (w + 16) * clamp(p), sz * 2); g.clip();
  g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 14; g.fillStyle = rgba(o.col || WHITE, a); g.fillText(s, x0, y);
  if (o.glow) { g.shadowColor = rgba(o.col || GOLD, .6 * a); g.shadowBlur = o.glow; g.fillText(s, x0, y); } g.restore();
  if (p < 1) { g.save(); g.fillStyle = rgba(WHITE, .85 * a); g.fillRect(x0 - 8 + (w + 16) * p, y - sz * .7, 1.5, sz * 1.4); g.restore(); }
  return w;
}
function wrap(s, font, maxW) { g.save(); g.font = font; const words = s.split(' '), out = []; let line = ''; for (const wd of words) { const tl = line ? line + ' ' + wd : wd; if (g.measureText(tl).width > maxW && line) { out.push(line); line = wd; } else line = tl; } if (line) out.push(line); g.restore(); return out; }
function line(pts, o = {}) { if (pts.length < 2) return; const p = o.p ?? 1; if (p <= 0) return; const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); const end = L[L.length - 1] * clamp(p);
  g.save(); g.lineCap = g.lineJoin = 'round'; g.setLineDash(o.dash || []); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) { if (L[i] <= end) g.lineTo(pts[i][0], pts[i][1]); else { const u = (end - L[i - 1]) / (L[i] - L[i - 1] || 1); g.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); break; } }
  g.strokeStyle = rgba(o.col || GOLD, .22 * (o.a ?? 1)); g.lineWidth = (o.w ?? 2) * 4; g.stroke(); g.strokeStyle = rgba(o.col || GOLD, .95 * (o.a ?? 1)); g.lineWidth = o.w ?? 2; g.stroke(); g.restore(); }
function dot(x, y, r, col, a = 1) { g.save(); const gr = g.createRadialGradient(x, y, 0, x, y, r * 4); gr.addColorStop(0, rgba(WHITE, a)); gr.addColorStop(.25, rgba(col, .8 * a)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(x - r * 4, y - r * 4, r * 8, r * 8); g.restore(); }
function ring(x, y, r, col, a = 1, p = 1, w = 2) { g.save(); g.strokeStyle = rgba(col, .9 * a); g.lineWidth = w; g.shadowColor = rgba(col, .7 * a); g.shadowBlur = 10; g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(p)); g.stroke(); g.restore(); }
const toScreen = (v, c) => { const p = v.clone().project(c); return [(p.x * .5 + .5) * W, (-p.y * .5 + .5) * H, p.z]; };
const moonScreen = c => { const d = MOON_DIR.clone().multiplyScalar(800).add(c.position); return toScreen(d, c); };
const fadeIO = (t, a, b, f = .5) => Math.min(ss(seg(t, a, a + f)), 1 - ss(seg(t, b - f, b)));
function label(x, y, tx, ty, l1, l2, p, col = GOLD, align) {   // a reading: a dot on the object, a thin leader, a caps label and an italic note
  if (p <= 0) return; line([[x, y], [tx, ty]], { p: ss(p * 1.8), w: 1.3, col, a: .85 }); dot(x, y, 4, col, p);
  const al = align || (tx > x ? 'left' : 'right'), dx = al === 'left' ? 12 : -12;
  txt(l1, tx + dx, ty - 16, { size: 30, track: 4, col: WHITE, align: al, p: seg(p, .35, 1), weight: 600 });
  if (l2) txt(l2, tx + dx, ty + 22, { size: 30, font: 'NSD', col, align: al, p: seg(p, .5, 1), weight: 400 });
}

// ---------------------------------------------------------------- overlay per scene
function overlay(t, S) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.globalAlpha = 1;
  const cc = S.space ? spaceCam : cam;
  // S1 — title
  txt('WHY DOES THE MOON', W / 2, 250, { size: 64, track: 10, col: WHITE, p: eo(seg(t, .5, 1.8)), a: fadeIO(t, .5, 6.8, .6), weight: 500 });
  txt('FOLLOW YOU?', W / 2, 330, { size: 64, track: 10, col: WHITE, p: eo(seg(t, .9, 2.2)), a: fadeIO(t, .5, 6.8, .6), weight: 500 });
  txt('चाँद हमारा पीछा क्यों करता है?', W / 2, 414, { font: 'NSD', size: 40, col: GOLD, p: eo(seg(t, 1.6, 2.8)), a: fadeIO(t, 1.6, 6.8, .6), weight: 400, glow: 10 });
  // S2 — the moon marked: it stays in the same place in the sky
  if (t > 12.3 && t < T.s3) { const [mx, my] = moonScreen(cam), a = fadeIO(t, 12.3, T.s3, .5), r = 74 + 6 * Math.sin(t * 3);
    ring(mx, my, r, GOLD, a, ss(seg(t, 12.3, 13.3)), 2.2); const sd = mx > W * .55 ? -1 : 1, lx = mx + sd * 150, ly = my + 190; line([[mx + sd * r * .7, my + r * .7], [lx, ly]], { p: ss(seg(t, 12.8, 13.4)), w: 1.3, a });
    txt('SAME PLACE', lx + sd * 10, ly + 24, { size: 36, track: 5, align: sd < 0 ? 'right' : 'left', p: eo(seg(t, 13.0, 13.8)), a, weight: 600 });
    txt('वहीं का वहीं', lx + sd * 10, ly + 70, { font: 'NSD', size: 34, col: GOLD, align: sd < 0 ? 'right' : 'left', p: eo(seg(t, 13.3, 14.0)), a }); }
  // S3 — the question
  txt('WHY?', W / 2, 360, { size: 120, track: 26, col: WHITE, p: eo(seg(t, 17.5, 18.4)), a: fadeIO(t, 17.5, 20.6, .5), weight: 500 });
  txt('क्या सच में चाँद हमारा पीछा करता है?', W / 2, 360, { font: 'NSD', size: 42, col: GOLD, p: eo(seg(t, 20.8, 22.2)), a: fadeIO(t, 20.8, 24.8, .5), glow: 10 });
  // the cloud the camera rises through into space
  const cl = Math.sin(Math.PI * seg(t, 19.6, 22.0)); if (cl > 0) { const R = mulberry(5); for (let i = 0; i < 26; i++) { const x = R() * W, y = (R() * H * 1.4 - (t - 19.6) * 900 * (.6 + R())) % (H * 1.4) + H * .2, r = 260 + R() * 360, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(160,178,214,${.55 * cl})`); gr.addColorStop(1, 'rgba(160,178,214,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } g.fillStyle = `rgba(150,168,204,${.75 * Math.pow(cl, 3)})`; g.fillRect(0, 0, W, H); }
  // S3/S4 — Earth and Moon: the line between them, the distance, ~30 Earths
  if (S.space) { const [ex, ey] = toScreen(space.earth.position, spaceCam), [mx, my] = toScreen(space.moon.position, spaceCam), a = fadeIO(t, 21.4, T.s4b, .6);
    line([[ex, ey], [mx, my]], { p: ss(seg(t, 21.8, 24.6)), w: 1.6, a: a * .8, dash: [10, 10] });
    if (t > 23.0) { ring(mx, my, 24, SILVER, a * ss(seg(t, 23, 23.8)), 1, 1.6); label(mx, my, mx + 120, my + 60, 'THE MOON', 'चाँद', seg(t, 23.2, 24.2) * a, SILVER); }
    if (t > 25.4) label(ex + 20, ey - 18, ex + 150, ey - 120, 'EARTH', 'पृथ्वी', seg(t, 25.4, 26.4) * a, SILVER);
    const nk = seg(t, 27.6, 28.8); if (nk > 0) { const y = (ey + my) / 2; txt('3,84,400 KM', W / 2 + 40, y - 40, { size: 82, track: 6, col: GOLD, align: 'left', p: eo(nk), a, weight: 500, glow: 18 });
      txt('लगभग 3 लाख 84 हज़ार किलोमीटर', W / 2 + 40, y + 30, { font: 'NSD', size: 34, col: WHITE, align: 'left', p: eo(seg(t, 28.2, 29.2)), a }); txt('average Earth–Moon distance', W / 2 + 40, y + 80, { size: 30, italic: true, col: SILVER, align: 'left', p: eo(seg(t, 28.6, 29.6)), a: a * .9 }); }
    if (t > 29.0) txt('≈ 30 EARTHS FIT IN BETWEEN', W / 2 + 40, (ey + my) / 2 + 150, { size: 30, track: 4, col: GOLD, align: 'left', p: eo(seg(t, 29.4, 30.4)), a, weight: 600 }); }
  // S4b — the top-down demo: the tree's direction swings, the Moon's does not
  if (t > T.s4b && t < T.s5) { { const ga = .07 * fadeIO(t, T.s4b, T.s5, .5); g.save(); g.strokeStyle = rgba(GOLD, ga); g.lineWidth = 1; for (let x = 0; x <= W; x += 90) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.restore(); }
    const a = fadeIO(t, T.s4b, T.s5, .5), y0 = heightAt(1, -12) + 1.6, A = V3(1, y0, -12), B = V3(19, y0, -12), TN = world.TREES.near, tree = V3(TN[0], heightAt(TN[0], TN[1]) + 5, TN[1]);
    const [ax, ay] = toScreen(A, cam), [bx, by] = toScreen(B, cam), [tx, ty] = toScreen(tree, cam), w = walkerAt(t), [wx, wy] = toScreen(V3(w.x, y0, w.z), cam);
    txt('PARALLAX', W / 2, 160, { size: 72, track: 18, col: WHITE, p: eo(seg(t, 31.8, 32.8)), a, weight: 500 }); txt('लंबन — दूरी का खेल', W / 2, 232, { font: 'NSD', size: 38, col: GOLD, p: eo(seg(t, 32.2, 33.2)), a, glow: 8 });
    dot(ax, ay, 7, GOLD, a * ss(seg(t, 32.0, 32.4))); txt('A', ax - 34, ay + 44, { size: 34, col: GOLD, a: a * ss(seg(t, 32.0, 32.4)), weight: 600 });
    if (t > 39.6) { dot(bx, by, 7, GOLD, a * ss(seg(t, 39.6, 40))); txt('B', bx + 34, by + 44, { size: 34, col: GOLD, a: a * ss(seg(t, 39.6, 40)), weight: 600 }); }
    line([[wx, wy], [tx, ty]], { p: ss(seg(t, 32.4, 33.2)), w: 2.2, a: a * .95 }); line([[ax, ay], [tx, ty]], { p: ss(seg(t, 33.0, 33.6)), w: 1.2, a: a * .45, dash: [8, 8] });
    label(tx, ty, tx - 40, ty - 150, 'NEAR TREE', 'पास का पेड़', seg(t, 33.0, 34.0) * a, GOLD, 'right');
    const ang = Math.round(Math.abs(Math.atan2(TN[0] - 1, TN[1] + 12) - Math.atan2(TN[0] - 19, TN[1] + 12)) * 180 / Math.PI / 5) * 5;
    if (t > 39.8) txt(`direction changes ≈ ${ang}°`, (ax + bx) / 2, Math.max(ay, by) + 120, { size: 34, italic: true, col: GOLD, p: eo(seg(t, 39.8, 40.6)), a });
    // to the Moon: parallel arrows from A and from the walker — 3,84,400 km away, the direction does not visibly change
    const mk = ss(seg(t, 35.2, 36.2)); if (mk > 0) { for (const [px, py] of [[ax, ay], [wx, wy]]) { line([[px, py], [px, py - 470]], { p: mk, w: 2, col: SILVER, a: a * .9 }); line([[px - 14, py - 450], [px, py - 476], [px + 14, py - 450]], { p: mk, w: 2, col: SILVER, a: a * .9 }); }
      txt('TO THE MOON ↑', (ax + wx) / 2 + 10, ay - 560, { size: 32, track: 5, col: SILVER, p: eo(seg(t, 35.6, 36.4)), a, weight: 600 }); txt('3,84,400 km दूर — दिशा वही की वही', (ax + wx) / 2 + 10, ay - 516, { font: 'NSD', size: 30, col: WHITE, p: eo(seg(t, 36.0, 37.0)), a }); }
    if (t > 38.4) { txt('walk 18 m → the Moon\'s direction', W / 2, H - 660, { size: 34, italic: true, col: SILVER, p: eo(seg(t, 38.4, 39.4)), a }); txt('shifts only ≈ 0.0000027°', W / 2, H - 614, { size: 40, track: 2, col: GOLD, p: eo(seg(t, 38.8, 39.8)), a, weight: 600, glow: 10 }); } }
  // S5 — the lateral parallax shot: live markers with motion trails (longer trail = faster apparent motion)
  if (t > T.s5 && t < T.s6) { const a = fadeIO(t, T.s5 + .2, T.s6, .5), dt = .9, cprev = cam.clone(); const sp = shot(Math.max(T.s5, t - dt)); cprev.position.copy(sp.pos); cprev.lookAt(sp.look); cprev.updateMatrixWorld(); cprev.updateProjectionMatrix();
    const TN = world.TREES.near, items = [[V3(TN[0], heightAt(TN[0], TN[1]) + 4.5, TN[1]), 'NEAR TREE', 'पास का पेड़ — तेज़ी से पीछे', 42.8, GOLD], [V3(250, 150, -2000), 'MOUNTAINS', 'पहाड़ — थोड़ा खिसकते', 44.4, SILVER]];
    for (const [p, l1, l2, t0, col] of items) { const [x, y, z] = toScreen(p, cam), [px, py] = toScreen(p, cprev); if (z > 1 || x < 80 || x > W - 80) continue; const k = ss(seg(t, t0, t0 + .8)) * a;
      line([[px, py], [x, y]], { w: 3, col, a: k * .9 }); label(x, y, x + (x > W * .6 ? -60 : 60), y - 130, l1, l2, k, col); }
    const [mx, my] = moonScreen(cam), mk = ss(seg(t, 47.6, 48.6)) * a; ring(mx, my, 80, GOLD, mk, mk, 2.4); label(mx, my - 80, mx - 30, my - 210, 'THE MOON', 'चाँद — लगभग स्थिर', mk, GOLD, 'right');
    txt('NEAR moves fast · FAR barely moves', W / 2, 250, { size: 36, track: 3, col: WHITE, p: eo(seg(t, 49.4, 50.6)), a, weight: 500 }); }
  // S6 — the ending
  txt('IT WAS NEVER', W / 2, 1010, { size: 70, track: 12, col: WHITE, p: eo(seg(t, 53.4, 54.6)), a: ss(seg(t, 53.4, 54)), weight: 500, glow: 12 });
  txt('FOLLOWING YOU.', W / 2, 1094, { size: 70, track: 12, col: WHITE, p: eo(seg(t, 53.9, 55.1)), a: ss(seg(t, 53.9, 54.5)), weight: 500, glow: 12 });
  if (t > 54.0) { const L = wrap('वह आपका पीछा नहीं कर रहा था… वह बस बहुत दूर था।', '400 40px NSD', 900); L.forEach((s, i) => txt(s, W / 2, 1186 + i * 60, { font: 'NSD', size: 40, col: GOLD, p: eo(seg(t, 54.4 + i * .5, 55.6 + i * .5)), a: 1, glow: 10 })); }
  if (t > 57.2) { const a = ss(seg(t, 57.2, 58.2)); g.save(); g.strokeStyle = rgba(GOLD, .7 * a); g.lineWidth = 1.2; g.beginPath(); g.moveTo(W / 2 - 120 * a, H - 248); g.lineTo(W / 2 + 120 * a, H - 248); g.stroke(); g.restore();
    txt('THE ARYANZZ TEAMS', W / 2, H - 206, { size: 30, track: 12, col: GOLD, a: a * .95, weight: 600 }); }
  // subtitles: the narration in Hindi, wrapped inside the 9:16 safe zone, above the bottom UI band
  for (const [id, t0] of VO) { const t1 = t0 + Math.max(1.6, (DURS[id] || 3) + .4); if (t < t0 || t >= t1 || !LINES[id] || id === 'm10') continue; const a = Math.min(1, (t - t0) / .25, (t1 - t) / .25);
    const L = wrap(LINES[id], '400 38px NSD', 900); L.forEach((s, i) => { g.save(); g.font = '400 38px NSD'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,.95)'; g.shadowBlur = 12; g.fillStyle = 'rgba(246,240,228,.95)'; g.fillText(s, W / 2, H - 400 + (i - (L.length - 1)) * 54); g.restore(); }); }
}

// ---------------------------------------------------------------- frame
function render(t) {
  t = clamp(t, 0, DUR - 1e-4); const S = shot(t);
  if (S.space) { spaceCam.fov = S.fov; spaceCam.position.copy(S.pos); spaceCam.up.set(0, 1, 0); spaceCam.lookAt(S.look); spaceCam.updateProjectionMatrix(); space.update(t); space.ghosts.forEach((gh, i) => { gh.material.opacity = .55 * ss(seg(t, 29.0 + i * .045, 29.3 + i * .045)) * (1 - ss(seg(t, T.s4b - .5, T.s4b))); });
    passA.scene = space.scene; passA.camera = spaceCam; passB.enabled = false; }
  else { cam.fov = S.fov; cam.position.copy(S.pos); cam.up.copy(S.up || V3(0, 1, 0)); cam.lookAt(S.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    skyCam.fov = S.fov; skyCam.quaternion.copy(cam.quaternion); skyCam.position.set(0, 0, 0); skyCam.updateProjectionMatrix();
    passA.scene = sky.scene; passA.camera = skyCam; passB.enabled = true;
    const w = walkerAt(t); walker.root.position.set(w.x, heightAt(w.x, w.z), w.z); walker.update({ phase: w.ph, walk: w.w, heading: w.h, look: w.look || 0 });
    sky.update(t, 1); world.update(t, walker.root.position, cam.quaternion); const map = t > T.s4b - .3 && t < T.s5 ? 1 : 0; world.hemi.intensity = map ? 1.7 : .5; world.moonLight.intensity = map ? 2.2 : 1.15; }
  // dips between shots, and the opening/closing exposure
  let dip = 0; for (const c of CUTS) dip = Math.max(dip, 1 - Math.abs(t - c) / .28); grade.uniforms.dip.value = clamp(dip) * .85;
  grade.uniforms.k.value = lerp(.45, 1, ss(seg(t, 0, .8))) * lerp(1, .78, ss(seg(t, 59.2, 60)));
  composer.render(); overlay(t, S);
}
function events() {
  const ev = VO.map(([id, t]) => ({ t, type: 'line', id })), E = (t, type, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  for (let t = .25; t < DUR; t += 1 / 24) { const a = walkerAt(t), b = walkerAt(t + 1 / 24); if (a.w > .4 && Math.floor(a.ph / Math.PI) !== Math.floor(b.ph / Math.PI)) E(t, 'step', { surf: t > T.s2b && t < T.s3 || t > T.s5 && t < T.s6 ? 'gravel' : 'road', g: (t > T.s3 && t < T.s5) ? 0 : 1 }); }
  for (const c of CUTS) E(c - .05, 'cut'); E(.5, 'title'); E(12.3, 'mark'); E(17.5, 'why'); E(19.6, 'cloud'); E(T.space, 'space'); E(21.8, 'line_draw'); E(27.6, 'number');
  for (let i = 0; i < 30; i++) E(29.0 + i * .045, 'ghost', { i }); E(T.s4b, 'reveal'); E(35.2, 'moon_lines'); E(38.8, 'value'); E(42.8, 'near'); E(47.6, 'moon_mark'); E(53.4, 'final'); E(57.2, 'brand');
  return ev.sort((a, b) => a.t - b.t);
}
window.DUR = DUR; window.render = t => { render(t); }; window.EV = events(); window.TEXTS = () => [];
(async () => {
  for (const f of ['500 64px Corm', 'italic 400 34px CormI', '400 40px NSD']) await document.fonts.load(f, 'WHY चाँद');
  try { const L = await (await fetch('lines.json')).json(); L.forEach(l => LINES[l.id] = l.text); DURS = await (await fetch('voices/dur.json')).json(); } catch (e) { }
  render(Number(Q.get('t') ?? 3)); window.READY = true;
})();
