// The hotel: four sets in one scene (exterior x≈0, lobby x≈200, third-floor corridor + Room 309 x≈400).
// Lighting: up to 16 point lights per set + the guard's torch (a spot from the camera), no shadows; fog follows local light.
// Coordinates: metres; yaw 0 = facing −z.
import * as THREE from 'three';
import { mulberry, hash } from '/core/lib.js';
import * as TX from './tex.js';

export const SET = { ext: new THREE.Vector3(0, 0, 0), lobby: new THREE.Vector3(200, 0, 0), hall: new THREE.Vector3(400, 0, 0) };
const NL = 16;
export const U = {
  uPL: { value: Array.from({ length: NL }, () => new THREE.Vector3()) }, uPC: { value: Array.from({ length: NL }, () => new THREE.Vector3()) },
  uTP: { value: new THREE.Vector3() }, uTD: { value: new THREE.Vector3(0, 0, -1) }, uTC: { value: new THREE.Vector3(1, .93, .8) }, uTI: { value: 0 },
  uAmb: { value: new THREE.Vector3(.02, .02, .025) }, uFogCol: { value: new THREE.Color(.03, .03, .035) }, uFogD: { value: .05 }, uTime: { value: 0 },
};
const VS = `varying vec3 vW; varying vec3 vN; varying vec2 vUv;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vUv = uv; gl_Position = projectionMatrix * viewMatrix * w; }`;
const COMMON = `
uniform vec3 uPL[${NL}]; uniform vec3 uPC[${NL}]; uniform vec3 uTP, uTD, uTC, uAmb, uFogCol; uniform float uTI, uFogD, uTime;
varying vec3 vW; varying vec3 vN; varying vec2 vUv;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
void lightAt(vec3 P, vec3 N, vec3 V, float shin, out vec3 dif, out vec3 spc, out vec3 amb){
  dif = vec3(0); spc = vec3(0); amb = uAmb;
  for (int i = 0; i < ${NL}; i++) {
    vec3 C = uPC[i]; if (dot(C, C) < 1e-6) continue;
    vec3 d = uPL[i] - P; float d2 = dot(d, d); vec3 l = d * inversesqrt(d2);
    float ndl = max(dot(N, l), 0.);
    dif += C * ndl / (d2 + .08);
    if (shin > 0.) { vec3 hv = normalize(l + V); spc += C * pow(max(dot(N, hv), 0.), shin) / (d2 + .08); }
    amb += C * .06 / (d2 + 5.);
  }
  // the torch: a soft-edged spot from the guard's hand
  vec3 d = uTP - P; float d2 = dot(d, d); vec3 l = d * inversesqrt(d2);
  float cone = smoothstep(.86, .97, dot(-l, uTD)), hot = smoothstep(.95, .995, dot(-l, uTD));
  float ndl = max(dot(N, l), 0.);
  vec3 tc = uTC * uTI * (cone * .55 + hot * .9) / (d2 + .25);
  dif += tc * ndl;
  if (shin > 0.) { vec3 hv = normalize(l + V); spc += tc * pow(max(dot(N, hv), 0.), shin); }
}
vec3 fogA(vec3 c, vec3 P, vec3 a){ float d = length(P - cameraPosition); float f = 1. - exp(-d * uFogD);
  float k = clamp(dot(a, vec3(.333)) * 12., .35, 1.6); return mix(c, uFogCol * k, f); }
`;
const PAINT_FS = `
uniform sampler2D map, wetMap; uniform vec3 color; uniform vec2 rep; uniform float useMap, useWet, shin, spec, emit, flick;
void main(){
  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N; vec3 V = normalize(cameraPosition - vW);
  vec3 alb = color; if (useMap > .5) alb *= texture2D(map, vUv * rep).rgb;
  float sp = spec, sh = shin;
  if (useWet > .5) {   // wet ground: puddles are darker, mirror-like, and ripple with rain
    float w = texture2D(wetMap, vUv * rep * .5).r; float rip = vn(vW.xz * 9. + uTime * 3.) * vn(vW.xz * 13. - uTime * 2.);
    alb *= mix(1., .45, w); sp = mix(spec, 1.4, w); sh = mix(shin, 220., w); N = normalize(N + vec3(rip - .25, 0., rip - .25) * .08 * w);
  }
  vec3 d, s, a; lightAt(vW + N * .02, N, V, sh, d, s, a);
  vec3 c = alb * (d + a) + s * sp + alb * emit * flick;
  gl_FragColor = vec4(fogA(c, vW, a), 1.);
}`;
export function paint(o = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, map: { value: o.map || null }, wetMap: { value: o.wet || null }, color: { value: new THREE.Color(o.color ?? '#ffffff') },
      rep: { value: new THREE.Vector2(...(o.rep || [1, 1])) }, useMap: { value: o.map ? 1 : 0 }, useWet: { value: o.wet ? 1 : 0 },
      shin: { value: o.shin ?? 0 }, spec: { value: o.spec ?? 0 }, emit: { value: o.emit ?? 0 }, flick: { value: 1 } },
    vertexShader: VS, fragmentShader: COMMON + PAINT_FS, side: o.side ?? THREE.FrontSide,
  });
}
// Additive light shapes (torch beam, candle haze, window glow): not lit, fogged lightly
const GLOW_FS = `uniform vec3 color; uniform float alpha; varying vec3 vW; varying vec3 vN; varying vec2 vUv;
void main(){ float r = vUv.y; gl_FragColor = vec4(color * alpha * pow(1. - r, 1.6) * smoothstep(0., .08, r), 1.); }`;
function glowMat(color, alpha) {
  return new THREE.ShaderMaterial({ uniforms: { color: { value: new THREE.Color(color) }, alpha: { value: alpha } }, vertexShader: VS, fragmentShader: GLOW_FS,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
}
const add = (g, m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); g.add(m); return m; };
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const plane = (w, h, mat) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
const cyl = (r0, r1, h, mat, n = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, n), mat);
const noAO = m => { m.traverse(o => { o.isPoints = true; }); return m; };   // keep billboards / additive shapes out of the GTAO pre-pass

// ============================================================ build
export function buildWorld(scene) {
  const T = { stone: TX.stone(), pave: TX.paving(), wet: TX.wetness(), marble: TX.marble(), damask: TX.damask(), carpet: TX.carpet(),
    wood: TX.wood(9), door: TX.wood(10, '#2e1a10'), dial: TX.dial(), linen: TX.linen(), sheet: TX.sheet(), keys: TX.keyRack(), painting: TX.paintingFrame() };
  const out = { sets: {}, lights: {} };

  // —————————— EXTERIOR ——————————
  {
    const g = new THREE.Group(); g.position.copy(SET.ext); scene.add(g); out.sets.ext = g;
    add(g, plane(120, 120, paint({ map: T.pave, wet: T.wet, rep: [20, 20], shin: 40, spec: .25 })), 0, 0, -20, -Math.PI / 2);
    for (let k = 0; k < 3; k++) add(g, box(9 - k * .4, .18, 1.0, paint({ map: T.stone, rep: [2, .2], spec: .3, shin: 60 })), 0, .09 + k * .18, -6.6 - k * .9);   // wet steps
    const facade = paint({ map: T.stone, rep: [8, 4] });
    add(g, box(34, 16, 1, facade), 0, 8, -9.5);                                           // the hotel front, 4 storeys
    add(g, box(36, .7, 1.8, paint({ map: T.stone, rep: [9, .2], color: '#c8c0b0' })), 0, 16.2, -9.2);   // cornice
    add(g, box(36, .5, 1.4, paint({ map: T.stone, rep: [9, .2], color: '#c8c0b0' })), 0, 4.6, -9.1);    // ground-floor band
    const glass = paint({ color: '#0b0d12', shin: 90, spec: .9 });
    out.win309 = null;
    for (let f = 0; f < 3; f++) for (let k = -5; k <= 5; k++) {
      const x = k * 2.9, y = 6.4 + f * 3.25;
      add(g, box(1.55, 2.25, .3, paint({ map: T.stone, rep: [.4, .5], color: '#b8b0a0' })), x, y, -8.95);   // surround
      const w = add(g, plane(1.25, 1.95, glass.clone()), x, y, -8.79);
      if (f === 2 && k === 2) { w.material = paint({ color: '#ffcf86', emit: 0, shin: 60, spec: .4 }); out.win309 = w; }
    }
    // entrance: dark double doors, canopy, two lamps (one dead, one flickering)
    add(g, box(3.2, 3.4, .3, paint({ map: T.door, color: '#8a7a6a', shin: 30, spec: .2 })), 0, 1.7 + .54, -8.9);
    add(g, box(5.2, .25, 2.4, paint({ color: '#1a1614', spec: .2, shin: 30 })), 0, 4.0, -7.9);
    for (const sx of [-1, 1]) { add(g, cyl(.06, .08, 3.2, paint({ color: '#141210', spec: .4, shin: 60 })), sx * 3.1, 1.6 + .54, -7.2); add(g, box(.32, .45, .32, paint({ color: '#e8d8b0', emit: sx > 0 ? 1.4 : .05 })), sx * 3.1, 3.95, -7.2); }
    out.lampMat = g.children[g.children.length - 1].material;
    // rain: line segments, wrapped around the camera in the vertex shader
    const N = 5200, pos = new Float32Array(N * 6), R = mulberry(41);
    const anc = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) { const x = (R() - .5) * 24, y = R() * 20, z = (R() - .5) * 24, L = .35 + R() * .3; pos.set([0, 0, 0, -.03, -L, 0], i * 6); anc.set([x, y, z, x, y, z], i * 6); }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); rg.setAttribute('anchor', new THREE.BufferAttribute(anc, 3));
    const rainMat = new THREE.ShaderMaterial({ uniforms: { ...U, uCam: { value: new THREE.Vector3() }, uA: { value: .5 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform vec3 uCam; uniform float uTime; attribute vec3 anchor; varying vec3 vW2;
        void main(){ vec3 a = anchor; a.y = mod(a.y - uTime * 9.5, 20.) - 4.;   // wrap per streak (both ends together)
          a.x = uCam.x + mod(a.x - uCam.x + 12., 24.) - 12.; a.z = uCam.z + mod(a.z - uCam.z + 12., 24.) - 12.;
          vec3 p = a + position; vW2 = p; gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.); }`,
      fragmentShader: `uniform vec3 uTP, uTD, uAmb; uniform float uTI, uA; varying vec3 vW2;
        void main(){ vec3 d = vW2 - uTP; float r = length(d); float cone = smoothstep(.84, .97, dot(d / r, uTD));
          vec3 c = vec3(.55, .6, .7) * (uAmb.b * 9. + .05) + vec3(1., .95, .85) * uTI * cone * 1.2 / (r * r + .6);
          gl_FragColor = vec4(c * uA, 1.); }` });
    out.rain = noAO(new THREE.LineSegments(rg, rainMat)); out.rainMat = rainMat; scene.add(out.rain);
  }

  // —————————— LOBBY ——————————
  {
    const g = new THREE.Group(); g.position.copy(SET.lobby); scene.add(g); out.sets.lobby = g;
    add(g, plane(18, 14, paint({ map: T.marble, rep: [15, 12], shin: 70, spec: .35 })), 0, 0, -4, -Math.PI / 2);
    add(g, plane(18, 14, paint({ color: '#2a241c' })), 0, 5, -4, Math.PI / 2);
    const wall = (w, x, z, ry) => { add(g, plane(w, 3.6, paint({ map: T.damask, rep: [w / .64, 3.6 / .64] })), x, 3.2, z, 0, ry); add(g, plane(w, 1.4, paint({ map: T.wood, rep: [w / 1.2, 1], shin: 20, spec: .15 })), x, .7, z + (ry === 0 ? .01 : 0), 0, ry); };
    wall(18, 0, -10, 0); wall(14, -9, -4, Math.PI / 2); wall(14, 9, -4, -Math.PI / 2);
    // reception desk
    add(g, box(6.4, 1.1, 1.0, paint({ map: T.wood, rep: [4, 1], shin: 30, spec: .2 })), 0, .55, -6.2);
    add(g, box(6.6, .08, 1.2, paint({ map: T.marble, rep: [3, .5], shin: 25, spec: .06, color: '#9a9080' })), 0, 1.14, -6.2);   // matt, dusty: no torch glare
    add(g, box(.5, .06, .35, paint({ color: '#c8b070', shin: 90, spec: .8 })), 2.0, 1.21, -6.0);   // brass desk bell
    // grandfather clock behind the desk (pendulum swings), dial at 3:09
    add(g, box(.7, 2.3, .4, paint({ map: T.wood, rep: [1, 2], shin: 30, spec: .25 })), -1.7, 1.15, -9.75);
    add(g, box(.85, .9, .48, paint({ map: T.wood, rep: [1, 1], shin: 30, spec: .25 })), -1.7, 2.55, -9.73);
    add(g, plane(.6, .6, paint({ map: T.dial })), -1.7, 2.55, -9.48);
    out.lobbyHands = handSet(g, -1.7, 2.55, -9.46, .26);
    add(g, plane(.42, 1.1, paint({ color: '#0e0c0a', shin: 80, spec: .6 })), -1.7, 1.1, -9.54);
    const pend = new THREE.Group(); pend.position.set(-1.7, 1.62, -9.52); g.add(pend);
    add(pend, box(.015, .7, .01, paint({ color: '#b89850', shin: 80, spec: .7 })), 0, -.35, 0);
    add(pend, cyl(.09, .09, .02, paint({ color: '#d8b860', shin: 90, spec: .9 })), 0, -.72, 0, Math.PI / 2);
    out.pendulum = pend;
    // key rack (309 missing)
    add(g, plane(1.8, .9, paint({ map: T.keys })), 1.7, 1.95, -9.97);
    add(g, plane(.9, 1.15, paint({ map: T.painting })), 5.0, 2.6, -9.97);
    // dust-sheeted armchairs + a sofa near the camera
    const sh = paint({ map: T.sheet, rep: [1, 1] });
    for (const [x, z, s] of [[-5.2, -2.5, 1], [-4.2, -.2, .9], [5.0, -1.6, 1.2]]) { const m = new THREE.Mesh(new THREE.SphereGeometry(.7 * s, 16, 10, 0, Math.PI * 2, 0, Math.PI * .55), sh); add(g, m, x, 0, z); add(g, box(1.1 * s, .5, 1.0 * s, sh), x, .25, z); }
    // dead chandelier
    const ch = new THREE.Group(); ch.position.set(0, 4.2, -4); g.add(ch);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; add(ch, cyl(.03, .05, .18, paint({ color: '#6a5a40', spec: .5, shin: 60 })), Math.cos(a) * .6, 0, Math.sin(a) * .6); }
    add(ch, new THREE.Mesh(new THREE.SphereGeometry(.22, 16, 10), paint({ color: '#5a4a30', spec: .6, shin: 70 })), 0, .1, 0);
    // tall windows on the left wall: cold rain light
    for (const z of [-7.5, -3.5, .5]) add(g, plane(1.6, 3.2, paint({ color: '#1a2230', emit: .9, shin: 90, spec: .5 })), -8.98, 2.6, z, 0, Math.PI / 2);
  }

  // —————————— CORRIDOR + ROOM 309 ——————————
  {
    const g = new THREE.Group(); g.position.copy(SET.hall); scene.add(g); out.sets.hall = g;
    const HW = 1.15, HH = 2.85, Z0 = 3, Z1 = -11;
    const len = Z0 - Z1;
    add(g, plane(2 * HW, len, paint({ map: T.carpet, rep: [1, len / 1.2] })), 0, 0, (Z0 + Z1) / 2, -Math.PI / 2);
    add(g, plane(2 * HW, len, paint({ color: '#c8bca0' })), 0, HH, (Z0 + Z1) / 2, Math.PI / 2);
    for (const s of [-1, 1]) {
      add(g, plane(len, HH - .95, paint({ map: T.damask, rep: [len / .64, (HH - .95) / .64] })), s * HW, .95 + (HH - .95) / 2, (Z0 + Z1) / 2, 0, -s * Math.PI / 2);
      add(g, plane(len, .95, paint({ map: T.wood, rep: [len / 1.2, 1], shin: 25, spec: .15 })), s * HW, .475, (Z0 + Z1) / 2, 0, -s * Math.PI / 2);
      add(g, box(.04, .06, len, paint({ color: '#7a5a30', spec: .3, shin: 40 })), s * (HW - .02), .96, (Z0 + Z1) / 2);   // dado rail
    }
    add(g, plane(2 * HW, HH, paint({ map: T.damask, rep: [2 * HW / .64, HH / .64] })), 0, HH / 2, Z0, 0, Math.PI);
    // side doors with brass plates
    let n = 301;
    for (const z of [.2, -3.0, -6.2]) for (const s of [-1, 1]) {
      add(g, box(.08, 2.2, 1.0, paint({ map: T.door, rep: [1, 2], shin: 25, spec: .2 })), s * (HW - .03), 1.1, z);
      add(g, plane(.18, .09, paint({ map: TX.plate(n++), shin: 80, spec: .6 })), s * (HW - .075), 1.6, z + .3, 0, -s * Math.PI / 2);
      add(g, new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), paint({ color: '#c8a050', shin: 90, spec: .9 })), s * (HW - .09), 1.0, z - .38);
    }
    // sconces between doors (most dead)
    out.sconces = [];
    for (const z of [1.6, -1.4, -4.6, -7.8]) for (const s of [-1, 1]) {
      add(g, box(.06, .14, .1, paint({ color: '#8a6a30', spec: .6, shin: 70 })), s * (HW - .03), 1.92, z);
      const sh = add(g, cyl(.07, .04, .16, paint({ color: '#e8d8b0', emit: 0 }), 12), s * (HW - .12), 2.02, z);
      out.sconces.push({ x: s * (HW - .2), y: 2.0, z, mat: sh.material });
    }
    // end wall with the door to 309
    const DW = .96, DH = 2.2;
    add(g, box(HW - DW / 2, HH, .12, paint({ map: T.damask, rep: [1, 4] })), -(HW + DW / 2) / 2, HH / 2, Z1);
    add(g, box(HW - DW / 2, HH, .12, paint({ map: T.damask, rep: [1, 4] })), (HW + DW / 2) / 2, HH / 2, Z1);
    add(g, box(DW, HH - DH, .12, paint({ map: T.damask, rep: [1, 1] })), 0, DH + (HH - DH) / 2, Z1);
    for (const s of [-1, 1]) add(g, box(.08, DH + .08, .16, paint({ map: T.wood, rep: [.2, 2], shin: 30, spec: .2 })), s * (DW / 2 + .04), (DH + .08) / 2, Z1);
    add(g, box(DW + .24, .08, .16, paint({ map: T.wood, rep: [1, .2], shin: 30, spec: .2 })), 0, DH + .04, Z1);
    const hinge = new THREE.Group(); hinge.position.set(-DW / 2, 0, Z1); g.add(hinge); out.door = hinge;
    add(hinge, box(DW - .02, DH - .02, .05, paint({ map: T.door, rep: [1, 2], shin: 25, spec: .2 })), DW / 2, DH / 2, 0);
    add(hinge, plane(.22, .11, paint({ map: TX.plate(309), shin: 90, spec: .8 })), DW / 2, 1.62, .03);
    add(hinge, new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 8), paint({ color: '#d0a850', shin: 90, spec: 1 })), DW - .1, 1.0, .05);
    // light blade on the corridor carpet from the gap (additive)
    out.blade = add(g, noAO(plane(.5, 2.6, glowMat('#ffbf70', .55))), .32, .004, Z1 + 1.3, -Math.PI / 2, 0, -.18);
    // —— the room (behind the end wall): 5 × 5 m
    const RZ0 = Z1, RZ1 = -16.2, RW = 2.5;
    add(g, plane(2 * RW, RZ0 - RZ1, paint({ map: T.carpet, rep: [2, 2], color: '#9a8070' })), 0, 0, (RZ0 + RZ1) / 2, -Math.PI / 2);
    add(g, plane(2 * RW, RZ0 - RZ1, paint({ color: '#b8ac90' })), 0, HH, (RZ0 + RZ1) / 2, Math.PI / 2);
    for (const s of [-1, 1]) add(g, plane(RZ0 - RZ1, HH, paint({ map: T.damask, rep: [(RZ0 - RZ1) / .64, HH / .64] })), s * RW, HH / 2, (RZ0 + RZ1) / 2, 0, -s * Math.PI / 2);
    add(g, plane(2 * RW, HH, paint({ map: T.damask, rep: [2 * RW / .64, HH / .64] })), 0, HH / 2, RZ1);
    add(g, plane(2 * RW, HH, paint({ map: T.damask, rep: [2 * RW / .64, HH / .64] })), 0, HH / 2, RZ0 - .07, 0, Math.PI);
    // window with rain on the back wall + heavy curtains
    out.roomWin = add(g, plane(1.3, 1.7, paint({ color: '#1a2434', emit: .8, shin: 90, spec: .6 })), 0, 1.6, RZ1 + .01);
    for (const s of [-1, 1]) add(g, box(.5, 2.4, .08, paint({ color: '#4a2220', map: T.sheet, rep: [1, 3] })), s * .9, 1.4, RZ1 + .08);
    // dinner table for two
    const TZ = -13.6;
    add(g, cyl(.62, .62, .74, paint({ map: T.linen, rep: [4, 1] })), 0, .37, TZ);
    add(g, cyl(.64, .64, .02, paint({ map: T.linen, rep: [4, 1] })), 0, .745, TZ);
    for (const s of [-1, 1]) {
      const cz = TZ + s * .95;
      add(g, box(.48, .06, .46, paint({ map: T.wood, shin: 30, spec: .2 })), 0, .46, cz);
      add(g, box(.48, .62, .05, paint({ map: T.wood, shin: 30, spec: .2 })), 0, .79, cz + s * .21);
      for (const dx of [-.2, .2]) for (const dz of [-.2, .2]) add(g, box(.04, .46, .04, paint({ map: T.wood })), dx, .23, cz + dz);
      add(g, cyl(.15, .12, .02, paint({ color: '#f2eee4', shin: 60, spec: .4 })), 0, .765, TZ + s * .38);
      add(g, cyl(.09, .07, .015, paint({ color: '#e8e0d0', shin: 60, spec: .4 })), 0, .78, TZ + s * .38);
      const gl = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.035, 0], [.006, .01], [.005, .1], [.04, .12], [.045, .2], [.043, .2]].map(p => new THREE.Vector2(...p)), 16), paint({ color: '#c8d0d8', shin: 120, spec: 1.2 }));
      add(g, gl, .22, .755, TZ + s * .3);
      for (const dx of [-.2, .2]) add(g, box(.015, .004, .18, paint({ color: '#c0c0b8', shin: 100, spec: 1 })), dx, .757, TZ + s * .38);
    }
    // candles: brass holders, wax, flames (point lights) + haze
    out.flames = [];
    for (const dx of [-.14, .14]) {
      add(g, cyl(.05, .07, .03, paint({ color: '#c8a050', shin: 90, spec: .9 })), dx, .765, TZ);
      add(g, cyl(.018, .018, .32, paint({ color: '#f0e8d4' })), dx, .93, TZ);
      const fl = add(g, new THREE.Mesh(new THREE.ConeGeometry(.012, .05, 10), paint({ color: '#ffd890', emit: 3 })), dx, 1.115, TZ);
      out.flames.push(fl);
    }
    out.candleGlow = add(g, noAO(new THREE.Mesh(new THREE.SphereGeometry(.5, 16, 12), glowMat('#ff9a40', .12))), 0, 1.1, TZ);
    // side table (right) with the red telephone — the one saturated colour
    add(g, box(.6, .7, .45, paint({ map: T.wood, shin: 30, spec: .2 })), 2.05, .35, -12.4);
    const ph = new THREE.Group(); ph.position.set(2.0, .7, -12.4); g.add(ph); out.phone = ph;
    const red = paint({ color: '#d0101a', shin: 90, spec: .7, emit: .9 });
    add(ph, box(.26, .1, .2, red), 0, .05, 0);
    add(ph, box(.22, .06, .16, red), 0, .12, 0, .25);
    add(ph, cyl(.065, .065, .012, paint({ color: '#f0ece0' })), -.0, .13, .02, .25);
    const hs = new THREE.Group(); hs.position.set(0, .2, -.02); ph.add(hs); out.handset = hs;
    add(hs, cyl(.025, .025, .26, red), 0, 0, 0, 0, 0, Math.PI / 2);
    for (const s of [-1, 1]) add(hs, cyl(.045, .04, .05, red), s * .12, -.02, 0);
    // radio (left) with a warm dial
    add(g, box(.6, .7, .45, paint({ map: T.wood, shin: 30, spec: .2 })), -2.05, .35, -12.6);
    add(g, box(.5, .32, .26, paint({ map: T.wood, rep: [1, 1], color: '#8a6040', shin: 40, spec: .3 })), -2.05, .86, -12.6);
    out.radioDial = add(g, plane(.24, .07, paint({ color: '#ffb850', emit: 1.6 })), -1.92, .9, -12.6, 0, Math.PI / 2);
    // wall clock in the room, also at 3:09
    add(g, cyl(.24, .24, .05, paint({ map: T.wood, shin: 40, spec: .3 })), -2.45, 2.05, -14.2, 0, 0, Math.PI / 2);
    add(g, plane(.38, .38, paint({ map: T.dial })), -2.42, 2.05, -14.2, 0, Math.PI / 2);
    out.roomHands = handSet(g, -2.41, 2.05, -14.2, .17, Math.PI / 2);
  }
  return out;
}
// clock hands at 3:09 + a ticking seconds hand
function handSet(g, x, y, z, r, ry = 0) {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; g.add(grp);
  const m = paint({ color: '#141008' });
  const hand = (len, w, a) => { const p = new THREE.Group(); p.rotation.z = -a; const b = box(w, len, .004, m); b.position.y = len / 2; p.add(b); grp.add(p); return p; };
  hand(r * .55, r * .06, (3 + 9 / 60) / 12 * Math.PI * 2);
  hand(r * .82, r * .04, 9 / 60 * Math.PI * 2);
  return hand(r * .9, r * .015, 0);
}
