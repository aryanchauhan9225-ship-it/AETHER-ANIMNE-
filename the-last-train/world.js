// THE LAST TRAIN — आखिरी ट्रेन. The 3D sets: the midnight station, the train, the coach interior, the clocks, and the one character
// (young and old). Units: metres, y up. The track runs along x; the platform is at z > 2; the train arrives from −x.
import * as THREE from 'three';

// ---------------------------------------------------------------- noise and canvas helpers
const hash2 = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
export function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
export function fbm(x, y, o = 5) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; } return s; }
export function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export const tex = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
function noiseCanvas(w, h, base, amp, scale, seed = 1) { const c = cnv(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = fbm(x / scale + seed, y / scale + seed * 2, 5) - .5, i = (y * w + x) * 4; d[i] = base[0] + n * amp; d[i + 1] = base[1] + n * amp; d[i + 2] = base[2] + n * amp; d[i + 3] = 255; }
  g.putImageData(im, 0, 0); return c; }
function softCanvas(w, h, seed) { const c = cnv(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const nx = x / w, ny = y / h, e = Math.sin(Math.PI * nx) * Math.sin(Math.PI * ny), n = fbm(nx * 5 + seed, ny * 2.2 + seed * 2, 6), a = Math.max(0, (n - .36) * 2.3) * Math.pow(e, .75), i = (y * w + x) * 4;
    d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.min(255, a * 255); } g.putImageData(im, 0, 0); return c; }
export function glowTex(r, gg, b) { const s = 128, c = cnv(s, s), g = c.getContext('2d'), gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(.25, `rgba(${r},${gg},${b},.45)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`); g.fillStyle = gr; g.fillRect(0, 0, s, s); return tex(c); }
// a fake volumetric cone of light: additive, brightest at the apex, fading toward the floor and the rim
export function lightCone(h, r, col, k = .22) {
  const g = new THREE.ConeGeometry(r, h, 32, 1, true); g.translate(0, -h / 2, 0);
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { col: { value: new THREE.Color(col) }, k: { value: k }, h: { value: h } },
    vertexShader: 'varying float vy; varying vec3 vn; varying vec3 vv; void main(){ vy = position.y; vec4 mv = modelViewMatrix*vec4(position,1.); vn = normalize(normalMatrix*normal); vv = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying float vy; varying vec3 vn; varying vec3 vv; uniform vec3 col; uniform float k, h; void main(){ float a = pow(1. - clamp(-vy/h, 0., 1.), 1.6) * pow(abs(dot(vn, vv)), 1.5) * k; gl_FragColor = vec4(col * a, a); }' });
  return new THREE.Mesh(g, m);
}
function mistField(scene, n, area, y0, seed, col = 0x7d8ea8) { const t = tex(softCanvas(512, 256, seed)), R = mulberry(seed * 13 + 1), out = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(14 + R() * 18, 3 + R() * 4), new THREE.MeshBasicMaterial({ map: t, color: col, transparent: true, opacity: .12 + R() * .1, depthWrite: false }));
    m.userData = { x: area[0] + R() * (area[1] - area[0]), z: area[2] + R() * (area[3] - area[2]), y: y0 + R() * 2.5, sp: .25 + R() * .5, op: m.material.opacity }; scene.add(m); out.push(m); }
  return out; }
function dustPoints(scene, n, box, seed, size = .03, col = 0xffe2b0) { const R = mulberry(seed), pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = box[0] + R() * (box[1] - box[0]); pos[i * 3 + 1] = box[2] + R() * (box[3] - box[2]); pos[i * 3 + 2] = box[4] + R() * (box[5] - box[4]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const base = pos.slice();
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending, map: glowTex(255, 255, 255) })); scene.add(p);
  p.userData.update = t => { const a = g.attributes.position.array; for (let i = 0; i < n; i++) { a[i * 3] = base[i * 3] + Math.sin(t * .3 + i) * .15 + t * .04; a[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * .23 + i * 1.7) * .12; a[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * .27 + i) * .1; } g.attributes.position.needsUpdate = true; };
  return p; }

// ---------------------------------------------------------------- clocks
function dialCanvas(roman, cream = '#efe6cf') { const s = 512, c = cnv(s, s), g = c.getContext('2d');
  g.fillStyle = cream; g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2); g.fill();
  const rg = g.createRadialGradient(s / 2, s / 2, s * .1, s / 2, s / 2, s / 2); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(90,70,40,.35)'); g.fillStyle = rg; g.fill();
  g.strokeStyle = '#1b1712'; g.lineWidth = 10; g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 12, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2, r0 = s / 2 - 26, r1 = r0 - (k % 5 ? 10 : 26); g.lineWidth = k % 5 ? 3 : 7; g.beginPath(); g.moveTo(s / 2 + Math.sin(a) * r0, s / 2 - Math.cos(a) * r0); g.lineTo(s / 2 + Math.sin(a) * r1, s / 2 - Math.cos(a) * r1); g.stroke(); }
  const R = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  g.fillStyle = '#1b1712'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = roman ? '600 46px serif' : '700 58px serif';
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, r = s / 2 - 88; g.fillText(roman ? R[k] : String(k || 12), s / 2 + Math.sin(a) * r, s / 2 - Math.cos(a) * r); }
  return tex(c); }
// a clock face group: dial + hour / minute / second hands; setTime(h, m, s) with s fractional
function clockFace(radius, roman, opts = {}) {
  const g = new THREE.Group(), dial = new THREE.Mesh(new THREE.CircleGeometry(radius, 64), new THREE.MeshStandardMaterial({ map: dialCanvas(roman), roughness: .5, emissive: opts.glow ? 0xfff0d0 : 0x000000, emissiveIntensity: opts.glow || 0, emissiveMap: opts.glow ? dialCanvas(roman) : null })); g.add(dial);
  const handMat = new THREE.MeshStandardMaterial({ color: 0x15120e, roughness: .4, metalness: .3 });
  const mk = (L, w, z) => { const h = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(w, L, radius * .02), handMat); b.position.y = L * .4; h.add(b); h.position.z = z; g.add(h); return h; };
  const hh = mk(radius * .5, radius * .07, radius * .02), mh = mk(radius * .78, radius * .045, radius * .03), sh = mk(radius * .82, radius * .015, radius * .04); sh.children[0].material = new THREE.MeshStandardMaterial({ color: 0x8a1a12 });
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(radius * .05, radius * .05, radius * .06, 16), handMat); pin.rotation.x = Math.PI / 2; pin.position.z = radius * .05; g.add(pin);
  g.userData.setTime = (h, m, s) => { sh.rotation.z = -s / 60 * Math.PI * 2; mh.rotation.z = -(m + s / 60) / 60 * Math.PI * 2; hh.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; };
  return g;
}
export function buildStationClock() {   // a double-faced platform clock on a bracket
  const g = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(.48, .48, .16, 48), new THREE.MeshStandardMaterial({ color: 0x1c1f24, roughness: .45, metalness: .6 })); body.rotation.x = Math.PI / 2; g.add(body);
  const f1 = clockFace(.42, false, { glow: .25 }); f1.position.z = .081; g.add(f1); const f2 = clockFace(.42, false, { glow: .25 }); f2.position.z = -.081; f2.rotation.y = Math.PI; g.add(f2);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(.06, .9, .06), body.material); arm.position.y = .9; g.add(arm);
  g.userData.setTime = (h, m, s) => { f1.userData.setTime(h, m, s); f2.userData.setTime(h, m, s); }; return g;
}
export function buildCarriageClock() {   // the antique brass carriage clock (~14 cm tall), roman dial, a carry handle
  const brass = new THREE.MeshStandardMaterial({ color: 0xb08a3e, roughness: .32, metalness: .9 }), g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(.1, .12, .08), brass); body.position.y = .06; g.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(.112, .014, .092), brass); top.position.y = .127; g.add(top);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(.114, .012, .094), brass); foot.position.y = .006; g.add(foot);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .12, 10), brass); c.position.set(sx * .05, .066, sz * .04); g.add(c); }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.035, .004, 8, 24, Math.PI), brass); handle.position.y = .134; g.add(handle);
  const face = clockFace(.034, true, { glow: .5 }); face.position.set(0, .068, .0405); g.add(face);
  g.userData.setTime = face.userData.setTime; g.userData.face = face; return g;
}

// ---------------------------------------------------------------- the station
export const TRACK_Z = 0, PLAT_Z = 2.0, PLAT_Y = 1.0;
export function buildStation() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x03060c); scene.fog = new THREE.FogExp2(0x060b15, .045);
  const conc = new THREE.MeshStandardMaterial({ map: tex(noiseCanvas(512, 512, [70, 74, 80], 40, 40, 3)), roughness: .38, metalness: .1, color: 0x8a8f98 });
  conc.map.wrapS = conc.map.wrapT = THREE.RepeatWrapping; conc.map.repeat.set(30, 4);
  const plat = new THREE.Mesh(new THREE.BoxGeometry(220, PLAT_Y, 10), conc); plat.position.set(0, PLAT_Y / 2, PLAT_Z + 5); plat.receiveShadow = true; scene.add(plat);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(220, .2), new THREE.MeshStandardMaterial({ color: 0xc9a230, roughness: .6 })); stripe.rotation.x = -Math.PI / 2; stripe.position.set(0, PLAT_Y + .004, PLAT_Z + .55); scene.add(stripe);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(220, .08, .3), new THREE.MeshStandardMaterial({ color: 0xb0b4ba, roughness: .6 })); edge.position.set(0, PLAT_Y - .04, PLAT_Z + .15); scene.add(edge);
  // track bed: ballast, sleepers, two rails (catching the light)
  const ballast = new THREE.Mesh(new THREE.BoxGeometry(400, .3, 3.6), new THREE.MeshStandardMaterial({ map: tex(noiseCanvas(256, 256, [52, 50, 48], 70, 3, 7)), roughness: 1 })); ballast.material.map.wrapS = ballast.material.map.wrapT = THREE.RepeatWrapping; ballast.material.map.repeat.set(120, 1); ballast.position.set(0, .05, TRACK_Z); ballast.receiveShadow = true; scene.add(ballast);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 200), new THREE.MeshStandardMaterial({ color: 0x0b0e12, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.05, -90); scene.add(ground);
  const sl = new THREE.InstancedMesh(new THREE.BoxGeometry(.24, .14, 2.6), new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: .9 }), 700), M = new THREE.Matrix4();
  for (let i = 0; i < 700; i++) { M.makeTranslation(-210 + i * .6, .25, TRACK_Z); sl.setMatrixAt(i, M); } scene.add(sl);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x8c9096, roughness: .22, metalness: .95 });
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(420, .16, .08), railMat); r.position.set(0, .4, TRACK_Z + s * .72); scene.add(r); }
  // the canopy and its columns, the back wall of the station building with dark windows and an old notice board
  const iron = new THREE.MeshStandardMaterial({ color: 0x1d2229, roughness: .55, metalness: .6 });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(90, .25, 8.6), iron); roof.position.set(0, PLAT_Y + 5.0, PLAT_Z + 5.3); roof.castShadow = true; scene.add(roof);
  for (let x = -40; x <= 40; x += 8) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.12, .15, 5.0, 12), iron); c.position.set(x, PLAT_Y + 2.5, PLAT_Z + 6.4); c.castShadow = true; scene.add(c); }
  const wallMat = new THREE.MeshStandardMaterial({ map: tex(noiseCanvas(512, 256, [64, 58, 52], 34, 30, 11)), roughness: .9 }); wallMat.map.wrapS = THREE.RepeatWrapping; wallMat.map.repeat.set(10, 1);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(110, 6.4, .5), wallMat); wall.position.set(0, PLAT_Y + 3.2, PLAT_Z + 9.6); scene.add(wall);
  const winMat = new THREE.MeshStandardMaterial({ color: 0x0c1218, roughness: .15, metalness: .5 });
  for (let x = -44; x <= 44; x += 7) { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), winMat); w.position.set(x, PLAT_Y + 2.6, PLAT_Z + 9.34); w.rotation.y = Math.PI; scene.add(w); }
  { const c = cnv(1024, 256), g = c.getContext('2d'); g.fillStyle = '#e7e0cf'; g.fillRect(0, 0, 1024, 256); g.strokeStyle = '#1b1712'; g.lineWidth = 12; g.strokeRect(10, 10, 1004, 236);
    g.fillStyle = '#1b1712'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 88px "NSD"'; g.fillText('प्लेटफ़ॉर्म 1', 512, 98); g.font = '600 64px serif'; g.fillText('PLATFORM 1', 512, 190);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .6), new THREE.MeshStandardMaterial({ map: tex(c), roughness: .6 })); s.position.set(6, PLAT_Y + 3.6, PLAT_Z + 6.25); s.rotation.y = Math.PI; scene.add(s);
    const s2 = s.clone(); s2.rotation.y = 0; s2.position.z -= .02; scene.add(s2); }
  // benches
  const wood = new THREE.MeshStandardMaterial({ color: 0x3b2a1c, roughness: .7 });
  for (const x of [-14, 14, 30]) { const b = new THREE.Group(); const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, .06, .45), wood); seat.position.y = .45; b.add(seat); const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, .4, .05), wood); back.position.set(0, .72, .2); b.add(back);
    for (const sx of [-.8, .8]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, .45, .45), iron); l.position.set(sx, .22, 0); b.add(l); } b.position.set(x, PLAT_Y, PLAT_Z + 5.4); b.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(b); }
  // the platform lamps: bulbs + warm point lights + fake volumetric cones; two of them flicker
  const lamps = [], bulbGeo = new THREE.SphereGeometry(.12, 16, 12);
  for (const [i, x] of [-24, -12, 0, 12, 24].entries()) { const L = new THREE.Group(); L.position.set(x, PLAT_Y + 4.65, PLAT_Z + 3.4);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(.42, .28, 24, 1, true), iron); shade.position.y = .1; L.add(shade);
    const bulb = new THREE.Mesh(bulbGeo, new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffd9a0, emissiveIntensity: 3 })); L.add(bulb);
    const cone = lightCone(4.4, 2.0, 0xffd6a0, .16); L.add(cone);
    const light = i % 2 === 0 ? new THREE.PointLight(0xffd2a0, 46, 17, 1.5) : null; if (light) { light.position.y = -.25; L.add(light); if (i === 2) { light.castShadow = true; light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -.002; } }
    scene.add(L); lamps.push({ L, bulb, cone, light, flick: i === 1 || i === 3 }); }
  const clock = buildStationClock(); clock.position.set(-3, PLAT_Y + 3.75, PLAT_Z + 3.0); clock.rotation.y = -.5; scene.add(clock);
  // cold fill (the night itself), papers in the wind, low mist, floating motes
  const hemi = new THREE.HemisphereLight(0x34466c, 0x080a0e, 1.0); scene.add(hemi); const rim = new THREE.DirectionalLight(0x6f86b8, .6); rim.position.set(10, 12, -30); scene.add(rim);
  const moon = new THREE.DirectionalLight(0x8fa5d8, .45); moon.position.set(-30, 40, -20); scene.add(moon);
  const paperTex = (() => { const c = cnv(128, 160), g = c.getContext('2d'); g.fillStyle = '#d8d2c2'; g.fillRect(0, 0, 128, 160); g.fillStyle = 'rgba(40,40,40,.55)'; for (let k = 0; k < 9; k++) g.fillRect(12, 18 + k * 15, 60 + (k * 37) % 44, 4); return tex(c); })();
  const papers = []; for (let i = 0; i < 7; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(.24, .3), new THREE.MeshStandardMaterial({ map: paperTex, side: THREE.DoubleSide, roughness: .8 })); p.castShadow = true; scene.add(p); papers.push(p); }
  const mists = mistField(scene, 34, [-60, 60, -14, 12], .2, 5), motes = dustPoints(scene, 900, [-40, 40, 0, 7, -6, 10], 9, .05, 0xc7d6f0);
  return { scene, lamps, clock, papers, mists, motes, hemi,
    update(t, o = {}) {
      clock.userData.setTime(0, o.minute ?? 7, o.sec ?? (t % 60));
      for (const [i, l] of lamps.entries()) { let k = 1; if (l.flick) k = (Math.sin(t * 37 + i) > .3 && Math.sin(t * 5.3 + i * 2) > -.6) ? 1 : (.25 + .3 * Math.abs(Math.sin(t * 61))); k *= o.lampK ?? 1;
        l.bulb.material.emissiveIntensity = 3 * k; l.cone.material.uniforms.k.value = .2 * k; if (l.light) l.light.intensity = 46 * k; }
      papers.forEach((p, i) => { const s = (t * (.9 + i * .13) + i * 7) % 26, x = -13 + s * 1.6 + Math.sin(t + i) * .4; p.position.set(x + i * 1.3 - 6, PLAT_Y + .03 + Math.abs(Math.sin(t * 2.2 + i * 1.7)) * .35 * (.5 + .5 * Math.sin(i + t * .4)), PLAT_Z + 1.4 + i * .9 + Math.sin(t * .7 + i) * .4);
        p.rotation.set(-Math.PI / 2 + Math.sin(t * 3 + i) * .9, t * 1.7 + i, Math.cos(t * 2.3 + i) * .7); });
      for (const m of mists) { m.position.set(m.userData.x + ((t * m.userData.sp) % 40) - 20, m.userData.y, m.userData.z); if (o.camQuat) m.quaternion.copy(o.camQuat); m.material.opacity = m.userData.op * (o.mistK ?? 1); }
      motes.userData.update(t); scene.fog.density = o.fog ?? .03; }
  };
}

// ---------------------------------------------------------------- the train: a locomotive and three coaches; x = position of the loco nose
export const COACH_L = 20, LOCO_L = 16, DOOR_LOCAL = -2.0;   // the door of coach 1 is at noseX − LOCO_L − 1 − DOOR_LOCAL… (computed in main)
export function buildTrain() {
  const g = new THREE.Group(), body = new THREE.MeshStandardMaterial({ color: 0x3c1514, roughness: .42, metalness: .35 }), roofM = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: .6, metalness: .4 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xa8843c, roughness: .3, metalness: .9 }), dark = new THREE.MeshStandardMaterial({ color: 0x0f1012, roughness: .6, metalness: .6 });
  const winM = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffb860, emissiveIntensity: 2.4 }), wheels = [], winMats = [winM], doors = [];
  const wheelGeo = new THREE.CylinderGeometry(.46, .46, .14, 24); wheelGeo.rotateX(Math.PI / 2);
  const addWheels = (x0, L) => { for (const bx of [x0 + 2.6, x0 + L - 2.6]) for (const dx of [-.9, .9]) for (const s of [-1, 1]) { const w = new THREE.Mesh(wheelGeo, dark); w.position.set(bx + dx, .62, s * .72); const spoke = new THREE.Mesh(new THREE.BoxGeometry(.8, .06, .02), brass); spoke.position.z = s * .08; w.add(spoke); g.add(w); wheels.push(w); }
    const bogie = new THREE.Mesh(new THREE.BoxGeometry(L - 2, .4, 1.9), dark); bogie.position.set(x0 + L / 2, 1.0, 0); g.add(bogie); };
  // coaches (behind the loco: x from −LOCO_L−1 backwards)
  const H0 = 1.25;
  for (let c = 0; c < 3; c++) { const x0 = -LOCO_L - 1 - (c + 1) * (COACH_L + 1), cg = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(COACH_L, 2.6, 3.0), body); b.position.set(x0 + COACH_L / 2, H0 + 1.3, 0); b.castShadow = true; g.add(b);
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, COACH_L, 24, 1, false, 0, Math.PI), roofM); rf.rotation.z = Math.PI / 2; rf.rotation.y = Math.PI / 2; rf.scale.set(1, 1, .32); rf.position.set(x0 + COACH_L / 2, H0 + 2.6, 0);
    rf.rotation.set(0, 0, Math.PI / 2); rf.scale.set(.3, 1, 1); g.add(rf);
    for (const s of [-1, 1]) { const band = new THREE.Mesh(new THREE.BoxGeometry(COACH_L, .05, .02), brass); band.position.set(x0 + COACH_L / 2, H0 + .95, s * 1.51); g.add(band);
      for (let k = 0; k < 9; k++) { const wx = x0 + 2.4 + k * 1.95; if (k === 4 && s > 0) { const d = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, .04), new THREE.MeshStandardMaterial({ color: 0x2c1010, roughness: .5, metalness: .3 })); d.position.set(wx, H0 + 1.15, s * 1.52); g.add(d); doors.push({ d, x: wx - x0 }); continue; }
        const w = new THREE.Mesh(new THREE.PlaneGeometry(1.14, .8), winM); w.position.set(wx, H0 + 1.55, s * 1.53); if (s < 0) w.rotation.y = Math.PI; g.add(w);
        const fr = new THREE.Mesh(new THREE.BoxGeometry(1.3, .95, .03), dark); fr.position.set(wx, H0 + 1.55, s * 1.505); g.add(fr); } }
    addWheels(x0, COACH_L); if (c < 2) { const v = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 2.2), dark); v.position.set(x0 - .5, H0 + 1.2, 0); g.add(v); } void cg; }
  // locomotive: long hood, cab with lit windows, rounded nose, headlight with a beam
  const lb = new THREE.Mesh(new THREE.BoxGeometry(LOCO_L - 3, 2.4, 2.8), body); lb.position.set(-LOCO_L / 2 - 1.5, H0 + 1.2, 0); lb.castShadow = true; g.add(lb);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(4, 3.0, 3.0), body); cab.position.set(-LOCO_L + 2, H0 + 1.5, 0); g.add(cab);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .8), winM); w.position.set(-LOCO_L + 2, H0 + 2.1, s * 1.515); if (s < 0) w.rotation.y = Math.PI; g.add(w); }
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.4, 24, 1, false, 0, Math.PI), body); nose.rotation.set(Math.PI / 2, 0, 0); nose.position.set(-3, H0 + 1.2, 0); nose.scale.set(1, 1, 1); g.add(nose);
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(.25, .3, .8, 16), dark); stack.position.set(-5, H0 + 2.7, 0); g.add(stack);
  const band2 = new THREE.Mesh(new THREE.BoxGeometry(LOCO_L, .06, 2.86), brass); band2.position.set(-LOCO_L / 2, H0 + .4, 0); g.add(band2);
  addWheels(-LOCO_L, LOCO_L - 1);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.22, 20, 16), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xfff1d0, emissiveIntensity: 8 })); head.position.set(-1.45, H0 + 2.0, 0); g.add(head);
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(255, 236, 200), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); flare.scale.setScalar(5); flare.position.copy(head.position).add(new THREE.Vector3(.3, 0, 0)); g.add(flare);
  const beam = lightCone(60, 3, 0xfff0d0, .18); beam.rotation.z = Math.PI / 2; beam.position.set(-1.3, H0 + 2.0, 0); g.add(beam);
  const spot = new THREE.SpotLight(0xfff0d0, 140, 90, .22, .6, 1.6); spot.position.copy(head.position); spot.target.position.set(40, 0, 0); g.add(spot); g.add(spot.target);
  const glowL = new THREE.PointLight(0xffb060, 30, 14, 1.4); glowL.position.set(-LOCO_L - 1 - 1.5 * (COACH_L + 1), H0 + 1.5, 3.2); g.add(glowL);
  const glowL2 = glowL.clone(); glowL2.position.x -= COACH_L * .9; g.add(glowL2);
  g.traverse(o => { if (o.isMesh && !o.material.transparent) o.castShadow = true; });
  return { group: g, wheels, winMats, doors, head, flare, beam, spot, glows: [glowL, glowL2],
    set(noseX, lit = 1, doorOpen = 0) { g.position.x = noseX; for (const w of wheels) w.rotation.z = -noseX / .46; for (const m of winMats) m.emissiveIntensity = 2.4 * lit; head.material.emissiveIntensity = 8 * lit; flare.material.opacity = lit; beam.material.uniforms.k.value = .18 * lit; spot.intensity = 140 * lit; for (const l of [glowL, glowL2]) l.intensity = 30 * lit;
      if (doors[0]) doors[0].d.position.x = (doors[0].d.userData.x0 ??= doors[0].d.position.x) + doorOpen * 1.05; } };
}

// ---------------------------------------------------------------- the coach interior (its own set): aisle along x, the clock's window on the +z wall
export const WIN = { x: 2.6, z: 1.4, y0: .95, y1: 1.85, w: 1.15 };
export function buildInterior() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05080e); scene.fog = new THREE.FogExp2(0x0a0b0d, .05);
  const woodF = new THREE.MeshStandardMaterial({ map: tex(noiseCanvas(512, 128, [86, 58, 36], 40, 8, 4)), roughness: .55 }); woodF.map.wrapS = woodF.map.wrapT = THREE.RepeatWrapping; woodF.map.repeat.set(6, 1);
  const panel = new THREE.MeshStandardMaterial({ color: 0x4a2c1c, roughness: .5, metalness: .1 }), cream = new THREE.MeshStandardMaterial({ color: 0xcfc2a2, roughness: .7 });
  const velvet = new THREE.MeshStandardMaterial({ color: 0x5a1416, roughness: .85 }), brass = new THREE.MeshStandardMaterial({ color: 0xa8843c, roughness: .3, metalness: .9 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 2.8), woodF); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(24, 2.8), cream); ceil.rotation.x = Math.PI / 2; ceil.position.y = 2.45; scene.add(ceil);
  // walls with window openings (built from strips around each opening); glass in each, dark fog outside
  const winXs = []; for (let x = -10; x <= 10.1; x += 1.8) winXs.push(x);
  for (const s of [-1, 1]) { const zz = s * 1.4;
    const low = new THREE.Mesh(new THREE.BoxGeometry(24, WIN.y0, .06), panel); low.position.set(0, WIN.y0 / 2, zz); scene.add(low);
    const up = new THREE.Mesh(new THREE.BoxGeometry(24, 2.45 - WIN.y1, .06), cream); up.position.set(0, (WIN.y1 + 2.45) / 2, zz); scene.add(up);
    for (let k = 0; k < winXs.length; k++) { const x0 = winXs[k] + WIN.w / 2, x1 = (winXs[k + 1] ?? 12) - WIN.w / 2; if (x1 > x0) { const p = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, WIN.y1 - WIN.y0, .06), cream); p.position.set((x0 + x1) / 2, (WIN.y0 + WIN.y1) / 2, zz); scene.add(p); } }
    const L = new THREE.Mesh(new THREE.BoxGeometry(.3, WIN.y1 - WIN.y0, .06), cream); L.position.set(winXs[0] - WIN.w / 2 - .15, (WIN.y0 + WIN.y1) / 2, zz); scene.add(L);
    for (const x of winXs) { const fr = new THREE.Mesh(new THREE.BoxGeometry(WIN.w + .08, .05, .08), brass); fr.position.set(x, WIN.y0, zz - s * .01); scene.add(fr); const f2 = fr.clone(); f2.position.y = WIN.y1; scene.add(f2); } }
  // the dark beyond the windows: deep blue fog with faint lights passing
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), new THREE.MeshBasicMaterial({ color: 0x0a1426, fog: false })); outside.position.set(0, 1.4, 6); outside.rotation.y = Math.PI; scene.add(outside);
  const outside2 = outside.clone(); outside2.position.z = -6; outside2.rotation.y = 0; scene.add(outside2);
  // seats: facing pairs along both walls; luggage racks
  for (const x of winXs) for (const s of [-1, 1]) for (const f of [-1, 1]) { const g = new THREE.Group(), seat = new THREE.Mesh(new THREE.BoxGeometry(.5, .14, .9), velvet); seat.position.set(0, .45, 0); g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(.12, .75, .9), velvet); back.position.set(f * .28, .85, 0); g.add(back); const base = new THREE.Mesh(new THREE.BoxGeometry(.5, .38, .85), panel); base.position.y = .19; g.add(base);
    g.position.set(x + f * .52, 0, s * .88); g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(g); }
  for (const s of [-1, 1]) for (const dy of [0, .1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 24, 8), brass); r.rotation.z = Math.PI / 2; r.position.set(0, 2.02 + dy, s * 1.1); scene.add(r); }
  // ceiling lamps (globes) and their light; they flicker; one (over the clock) is the one that returns
  const lamps = []; for (const x of [-7.2, -3.6, 0, 3.6, 7.2]) { const b = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffc888, emissiveIntensity: 3 })); b.position.set(x, 2.3, 0); scene.add(b);
    const l = Math.abs(x) <= 3.6 ? new THREE.PointLight(0xffc488, 8, 7, 1.5) : null; if (l) { l.position.set(x, 2.15, 0); scene.add(l); } lamps.push({ b, l, x }); }
  const key = new THREE.PointLight(0xffc488, 0, 6, 1.4); key.position.set(WIN.x - .2, 2.2, .5); scene.add(key);
  const keyMirror = new THREE.PointLight(0xc8d0e8, 0, 6, 1.4); keyMirror.position.set(WIN.x - .2, 2.2, 2 * WIN.z - .5); scene.add(keyMirror);   // the same lamp, seen in the glass
  const hemi = new THREE.HemisphereLight(0x3a3a48, 0x100c08, .25); scene.add(hemi); const rimI = new THREE.DirectionalLight(0x7f93c4, .35); rimI.position.set(-6, 3, -4); scene.add(rimI);
  // the glass of the window by the clock: a dark, slightly mirrored pane + a layer of condensation the message is written into
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(WIN.w, WIN.y1 - WIN.y0), new THREE.MeshStandardMaterial({ color: 0x0b1626, roughness: .05, metalness: .2, transparent: true, opacity: .42, depthWrite: false }));
  glass.position.set(WIN.x, (WIN.y0 + WIN.y1) / 2, WIN.z - .005); glass.rotation.y = Math.PI; scene.add(glass);
  const fogC = cnv(1024, 800), fogT = tex(fogC); const fogPane = new THREE.Mesh(new THREE.PlaneGeometry(WIN.w, WIN.y1 - WIN.y0), new THREE.MeshStandardMaterial({ map: fogT, transparent: true, depthWrite: false, roughness: .9 }));
  fogPane.position.set(WIN.x, (WIN.y0 + WIN.y1) / 2, WIN.z - .012); fogPane.rotation.y = Math.PI; scene.add(fogPane);
  const fogBase = softFog(1024, 800);
  const clock = buildCarriageClock(); scene.add(clock);
  const dust = dustPoints(scene, 700, [-9, 9, .2, 2.3, -1.2, 1.2], 21, .025);
  return { scene, lamps, key, keyMirror, hemi, glass, fogPane, clock, dust,
    // write the message into the condensation (p: 0..1 of the strokes); returns the fingertip's position on the pane (u, v in 0..1)
    writeFog(p, a = 1) { const g = fogC.getContext('2d'); g.clearRect(0, 0, 1024, 800); g.globalAlpha = a; g.drawImage(fogBase, 0, 0); g.globalAlpha = 1;
      const lines = [["DON'T MISS", 250], ['YOUR NEXT', 450], ['TRAIN.', 640]]; let tip = null; const total = lines.length;
      g.save(); g.globalCompositeOperation = 'destination-out'; g.font = '600 104px Georgia, serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
      lines.forEach(([s, y], i) => { const w = g.measureText(s).width, x0 = 512 - w / 2, k = Math.max(0, Math.min(1, p * total - i)); if (k <= 0) return;
        g.save(); g.beginPath(); g.rect(x0 - 20, y - 90, (w + 40) * k, 180); g.clip(); g.lineWidth = 5; g.strokeStyle = '#000'; g.fillStyle = 'rgba(0,0,0,.92)'; g.fillText(s, x0, y); g.strokeText(s, x0, y); g.restore();
        for (let d = 0; d < 3; d++) { const dx = x0 + (w * (d + .5) / 6), len = 30 + 60 * ((d * 37) % 7) / 7; if ((dx - x0) / w < k) { g.fillRect(dx - 3, y + 50, 6, len * Math.min(1, (p * total - i) * 1.2)); } }   // drips
        if (k > 0 && k < 1) tip = [(x0 + w * k) / 1024, y / 800]; });
      g.restore(); fogT.needsUpdate = true; return tip; },
    update(t) { dust.userData.update(t); } };
}
function softFog(w, h) { const c = cnv(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = fbm(x / 120, y / 120, 5), e = Math.min(1, Math.min(x, w - x, y, h - y) / 60), a = (.1 + .22 * n) * e, i = (y * w + x) * 4; d[i] = 205; d[i + 1] = 214; d[i + 2] = 228; d[i + 3] = a * 255; }
  g.putImageData(im, 0, 0); return c; }

// ---------------------------------------------------------------- the character: one rig, young or old (grey hair, stubble, lines). Faces +z locally; feet at y = 0.
function faceCanvas(old) { const w = 512, h = 256, c = cnv(w, h), g = c.getContext('2d');
  g.fillStyle = old ? '#c39a7e' : '#d2a283'; g.fillRect(0, 0, w, h);
  const cx = w * .25;   // the front of a three.js sphere is u = .25
  const gr = g.createRadialGradient(cx, h * .55, 10, cx, h * .55, 150); gr.addColorStop(0, 'rgba(255,220,200,.18)'); gr.addColorStop(1, 'rgba(80,40,20,.18)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(160,80,70,.12)'; for (const dx of [-38, 38]) { g.beginPath(); g.ellipse(cx + dx, h * .62, 22, 14, 0, 0, 7); g.fill(); }
  if (old) { g.strokeStyle = 'rgba(70,40,25,.55)'; g.lineWidth = 2.2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(cx - 40, h * (.22 + k * .045)); g.quadraticCurveTo(cx, h * (.2 + k * .045), cx + 40, h * (.22 + k * .045)); g.stroke(); }   // forehead
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(cx + s * 52, h * (.47 + k * .03)); g.lineTo(cx + s * 66, h * (.45 + k * .04)); g.stroke(); }   // crow's feet
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 16, h * .62); g.quadraticCurveTo(cx + s * 26, h * .72, cx + s * 22, h * .8); g.stroke(); g.beginPath(); g.ellipse(cx + s * 34, h * .55, 18, 6, 0, 0, Math.PI); g.stroke(); }   // smile folds, eye bags
    g.fillStyle = 'rgba(140,140,140,.55)'; for (let k = 0; k < 1600; k++) { const a = Math.random() * Math.PI, r = 40 + Math.random() * 48, x = cx + Math.cos(a) * r * 1.1, y = h * .66 + Math.sin(a) * r * .6; if (y > h * .66) g.fillRect(x, y, 2, 2); } }   // grey stubble
  return tex(c); }
export function buildPerson(old = false) {
  const skin = new THREE.MeshStandardMaterial({ map: faceCanvas(old), roughness: .62 }), skin2 = new THREE.MeshStandardMaterial({ color: old ? 0xb58d72 : 0xc6977a, roughness: .62 });
  const jacket = new THREE.MeshStandardMaterial({ color: 0x2b3547, roughness: .62 }), jacketD = new THREE.MeshStandardMaterial({ color: 0x1b2230, roughness: .7 }), pants = new THREE.MeshStandardMaterial({ color: 0x2b2d31, roughness: .8 });
  const hairM = new THREE.MeshStandardMaterial({ color: old ? 0x8d8a86 : 0x17120e, roughness: .9 }), eyeW = new THREE.MeshStandardMaterial({ color: 0xe9e4dc, roughness: .3 }), iris = new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: .2 });
  const cap = (r, L, m) => { const g = new THREE.CapsuleGeometry(r, L, 6, 12); g.translate(0, -L / 2 - r, 0); const x = new THREE.Mesh(g, m); x.castShadow = true; return x; };
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const hips = new THREE.Group(); hips.position.y = .95; body.add(hips);
  // the jacket: a padded torso with quilt seams, a stand collar, a zip
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.19, .36, 8, 16), jacket); torso.position.y = .3; torso.scale.set(1.05, 1, .78); torso.castShadow = true; hips.add(torso);
  for (let k = 1; k < 4; k += 2) { const ring = new THREE.Mesh(new THREE.TorusGeometry(.198, .0035, 6, 24), jacketD); ring.rotation.x = Math.PI / 2; ring.scale.set(1.04, .78, 1); ring.position.y = .18 + k * .1; hips.add(ring); }
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.095, .11, .1, 18, 1, true), jacket); collar.position.y = .58; collar.material = jacket; hips.add(collar);
  const zip = new THREE.Mesh(new THREE.BoxGeometry(.012, .5, .01), new THREE.MeshStandardMaterial({ color: 0x777b82, metalness: .8, roughness: .3 })); zip.position.set(0, .32, .155); hips.add(zip);
  const hem = new THREE.Mesh(new THREE.CylinderGeometry(.2, .21, .1, 18), jacketD); hem.position.y = .02; hem.scale.z = .8; hips.add(hem);
  // head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.045, .05, .1, 12), skin2); neck.position.y = .64; hips.add(neck);
  const head = new THREE.Group(); head.position.y = .78; hips.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(.105, 32, 24), skin); skull.scale.set(.88, 1.12, .98); skull.rotation.y = -Math.PI / 2; skull.castShadow = true; head.add(skull);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(.07, 20, 14), skin2); jaw.position.set(0, -.065, .03); jaw.scale.set(1, .75, 1); head.add(jaw);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(.016, .045, 10), skin2); nose.rotation.x = Math.PI / 2 + .3; nose.position.set(0, -.005, .1); head.add(nose);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(.022, 10, 8), skin2); ear.scale.set(.5, 1, .8); ear.position.set(s * .093, 0, 0); head.add(ear); }
  const eyes = [], lids = [], brows = [];
  for (const s of [-1, 1]) { const e = new THREE.Group(); e.position.set(s * .036, .022, .083); head.add(e);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.014, 14, 10), eyeW); e.add(ball); const ir = new THREE.Mesh(new THREE.SphereGeometry(.0075, 12, 8), iris); ir.position.z = .009; e.add(ir); eyes.push(ir);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(.0155, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), skin2); lid.rotation.x = -.35; e.add(lid); lids.push(lid);
    const br = new THREE.Mesh(new THREE.CapsuleGeometry(.004, .028, 4, 8), hairM); br.rotation.z = Math.PI / 2 + s * .12; br.position.set(s * .036, .048, .092); head.add(br); brows.push(br); }
  const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(.0045, .028, 4, 8), new THREE.MeshStandardMaterial({ color: 0x5a2a24, roughness: .5 })); mouth.rotation.z = Math.PI / 2; mouth.position.set(0, -.052, .088); head.add(mouth);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.112, 28, 16, 0, Math.PI * 2, 0, Math.PI * (old ? .4 : .46)), hairM); hair.scale.set(.9, 1.1, 1.02); hair.rotation.x = -.32; hair.position.set(0, .01, -.006); head.add(hair);
  const back = new THREE.Mesh(new THREE.SphereGeometry(.108, 20, 12, Math.PI * .55, Math.PI * .9, 0, Math.PI * .75), hairM); back.scale.set(.92, 1.1, 1); back.rotation.y = Math.PI; head.add(back);
  // legs and arms
  const limbs = {};
  for (const s of [-1, 1]) { const th = new THREE.Group(); th.position.set(s * .1, 0, 0); hips.add(th); th.add(cap(.068, .34, pants)); const kn = new THREE.Group(); kn.position.y = -.48; th.add(kn); kn.add(cap(.058, .36, pants));
    const foot = new THREE.Mesh(new THREE.BoxGeometry(.1, .07, .26), jacketD); foot.position.set(0, -.49, .05); foot.castShadow = true; kn.add(foot); limbs['leg' + s] = { th, kn };
    const sho = new THREE.Group(); sho.position.set(s * .22, .5, 0); hips.add(sho); sho.add(cap(.062, .24, jacket)); const el = new THREE.Group(); el.position.y = -.37; sho.add(el); el.add(cap(.055, .22, jacket));
    const hand = new THREE.Group(); hand.position.y = -.36; el.add(hand); const palm = new THREE.Mesh(new THREE.BoxGeometry(.075, .085, .03), skin2); palm.position.y = -.035; hand.add(palm);
    const fingers = new THREE.Group(); fingers.position.y = -.078; hand.add(fingers); for (let f = 0; f < 4; f++) { const fg = cap(.008, .035, skin2); fg.position.x = -.027 + f * .018; fingers.add(fg); }
    const index = fingers.children[s < 0 ? 3 : 0]; const thumb = cap(.009, .03, skin2); thumb.position.set(-s * .04, -.02, .012); thumb.rotation.z = -s * .7; hand.add(thumb);
    limbs['arm' + s] = { sho, el, hand, fingers, index }; }
  const Q = new THREE.Quaternion(), DOWN = new THREE.Vector3(0, -1, 0), A1 = .37, A2 = .36 + .05;
  function reach(side, T, pole = new THREE.Vector3(0, -.2, -1)) {   // two-bone IK, target T in hips space
    const A = limbs['arm' + side], S = A.sho.position.clone(), d = T.clone().sub(S); let L = Math.min(Math.max(d.length(), .12), A1 + A2 - .005); const dn = d.clone().normalize();
    const off = Math.acos(Math.min(1, Math.max(-1, (A1 * A1 + L * L - A2 * A2) / (2 * A1 * L)))), n = new THREE.Vector3().crossVectors(dn, pole).normalize();
    const u1 = dn.clone().applyAxisAngle(n, off), q1 = new THREE.Quaternion().setFromUnitVectors(DOWN, u1); A.sho.quaternion.copy(q1);
    const E = S.clone().add(u1.clone().multiplyScalar(A1)), u2 = T.clone().sub(E).normalize(), q2 = new THREE.Quaternion().setFromUnitVectors(DOWN, u2); A.el.quaternion.copy(q1.clone().invert().multiply(q2)); }
  return { root, head, hips, limbs,
    // o: phase, walk, heading, yaw, pitch, gaze [x,y], blink, brow, mouth, lean, armL/armR (targets in hips space or null), grip (0..1 fingers curl), point (index straight for writing)
    pose(o = {}) { const ph = o.phase || 0, w = o.walk || 0;
      for (const s of [-1, 1]) { const p = ph + (s > 0 ? 0 : Math.PI), Lg = limbs['leg' + s]; Lg.th.rotation.x = -Math.sin(p) * .42 * w + (o.stepBack && s > 0 ? -.35 * o.stepBack : 0); Lg.kn.rotation.x = Math.max(0, Math.sin(p + 1.6)) * .8 * w + (o.stepBack && s > 0 ? .3 * o.stepBack : 0); }
      hips.position.y = .95 + Math.abs(Math.cos(ph)) * .03 * w - .03 * w; hips.rotation.y = Math.sin(ph) * .07 * w; hips.rotation.x = -(o.lean || 0) + .015 * Math.sin((o.t || 0) * 1.4);
      const br = Math.sin((o.t || 0) * 1.4) * .006; hips.scale.set(1 + br * .5, 1, 1 + br);
      root.rotation.y = o.heading || 0; root.updateMatrixWorld(true);
      for (const s of [-1, 1]) { const A = limbs['arm' + s], Tw = s < 0 ? o.armL : o.armR, T = Tw ? hips.worldToLocal(Tw.clone()) : null;
        if (T) reach(s, T); else { const p = ph + (s > 0 ? 0 : Math.PI); A.sho.quaternion.setFromEuler(new THREE.Euler(Math.sin(p) * .34 * w, 0, s * .07)); A.el.quaternion.setFromEuler(new THREE.Euler(-(.15 + .2 * Math.max(0, Math.sin(p))) * w - .08, 0, 0)); }
        const grip = s < 0 ? (o.gripL ?? .3) : (o.gripR ?? .3); A.fingers.rotation.x = grip * 1.2; if (s > 0 && o.point) { A.fingers.rotation.x = 1.1; A.index.rotation.x = -1.1; } else A.index.rotation.x = 0; }
      head.rotation.set(-(o.pitch || 0), o.yaw || 0, 0); const gz = o.gaze || [0, 0]; for (const e of eyes) { e.position.x = gz[0] * .004; e.position.y = gz[1] * .004; }
      const bl = o.blink || 0, wide = o.wide || 0; for (const l of lids) { l.rotation.x = -.35 + bl * 1.25 - wide * .25; }
      brows.forEach((b, i) => { b.position.y = .048 + (o.brow || 0) * .008; b.rotation.z = Math.PI / 2 + (i ? 1 : -1) * (.12 - (o.brow || 0) * .1); });
      mouth.scale.set(1 - (o.mouth || 0) * .25, 1 + (o.mouth || 0) * 1.8, 1); root.rotation.y = o.heading || 0; },
    handWorld(side) { const v = new THREE.Vector3(); limbs['arm' + side].hand.getWorldPosition(v); return v; },
    fingerWorld() { const v = new THREE.Vector3(0, -.05, 0); limbs.arm1.index.localToWorld(v); return v; } };
}
