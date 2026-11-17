// WHY DOES THE MOON FOLLOW YOU? — the 3D world: procedural textures, the sky layer (at infinity), the moonlit landscape,
// the walking figure, and the Earth–Moon space scene. Units: metres; y up; the Moon is due −z, low over the horizon.
import * as THREE from 'three';

// ---------------------------------------------------------------- noise
const hash2 = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
export function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
export function fbm(x, y, o = 5) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; } return s; }
export function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

// ---------------------------------------------------------------- textures
function moonCanvas() {   // equirectangular lunar albedo: highlands, dark maria, craters with bright rims, a rayed crater
  const w = 1024, h = 512, c = cnv(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = x / w * 8, v = y / h * 4, n = fbm(u, v, 6), mar = fbm(u * .35 + 7, v * .35 + 3, 4);
    let k = 178 + (n - .5) * 46; if (mar > .52) k -= 58 * Math.min(1, (mar - .52) * 5);
    const i = (y * w + x) * 4; d[i] = k; d[i + 1] = k * .985; d[i + 2] = k * .96; d[i + 3] = 255; }
  g.putImageData(im, 0, 0); const R = mulberry(5);
  for (let i = 0; i < 700; i++) { const x = R() * w, y = h * (.1 + .8 * R()), r = Math.pow(R(), 3) * 26 + 1.5;
    g.fillStyle = `rgba(90,90,86,${.08 + R() * .1})`; g.beginPath(); g.ellipse(x, y, r, r * .9, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = `rgba(235,235,228,${.1 + R() * .18})`; g.lineWidth = Math.max(1, r * .18); g.beginPath(); g.ellipse(x + r * .1, y + r * .05, r, r * .9, 0, -.4, 2.2); g.stroke(); }
  const tx = w * .54, ty = h * .74; g.strokeStyle = 'rgba(240,240,232,.16)'; for (let k = 0; k < 26; k++) { const a = k / 26 * Math.PI * 2; g.lineWidth = 2 + R() * 3; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + Math.cos(a) * (80 + R() * 160), ty + Math.sin(a) * (50 + R() * 90)); g.stroke(); }
  g.fillStyle = 'rgba(250,250,244,.8)'; g.beginPath(); g.arc(tx, ty, 6, 0, Math.PI * 2); g.fill();
  return c;
}
function earthCanvas() {   // stylised Earth: deep oceans, land masses (procedural), cloud bands
  const w = 1024, h = 512, c = cnv(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = x / w * 6, v = y / h * 3, n = fbm(u + 11, v + 4, 6), lat = Math.abs(y / h - .5) * 2, land = n > .53, ice = lat > .86;
    const cl = fbm(u * 1.6 + 30, v * 3.2 + 9, 5), cloud = Math.max(0, cl - .52) * 2.6;
    let r, gg, b; if (ice) { r = 220; gg = 228; b = 236; } else if (land) { const k = (n - .53) * 4; r = 70 + 60 * k; gg = 92 + 30 * k; b = 58; } else { r = 14; gg = 42 + 20 * n; b = 92 + 40 * n; }
    const i = (y * w + x) * 4; d[i] = r + (235 - r) * Math.min(1, cloud); d[i + 1] = gg + (240 - gg) * Math.min(1, cloud); d[i + 2] = b + (248 - b) * Math.min(1, cloud); d[i + 3] = 255; }
  g.putImageData(im, 0, 0); const c2 = cnv(w, h), g2 = c2.getContext('2d'); g2.filter = 'blur(2px)'; g2.drawImage(c, 0, 0); return c2;
}
function softCanvas(w, h, seed, kind) {   // cloud / mist alpha textures
  const c = cnv(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = x / w, ny = y / h, edge = Math.sin(Math.PI * nx) * Math.sin(Math.PI * ny), n = fbm(nx * 5 + seed, ny * (kind === 'mist' ? 2 : 3.5) + seed * 2, 6);
    const a = Math.max(0, (n - (kind === 'mist' ? .38 : .44)) * 2.4) * Math.pow(edge, kind === 'mist' ? .7 : 1.1);
    const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.min(255, a * 255); }
  g.putImageData(im, 0, 0); return c;
}
function glowCanvas(col) { const s = 256, c = cnv(s, s), g = c.getContext('2d'), r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, col(1)); r.addColorStop(.2, col(.45)); r.addColorStop(.5, col(.12)); r.addColorStop(1, col(0)); g.fillStyle = r; g.fillRect(0, 0, s, s); return c; }
const tex = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

// ---------------------------------------------------------------- the sky (rendered from the origin: infinitely far, so it never shows parallax)
export const MOON_DIR = new THREE.Vector3(0, Math.sin(9.5 * Math.PI / 180), -Math.cos(9.5 * Math.PI / 180)).normalize();
export function buildSky() {
  const scene = new THREE.Scene();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(950, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
    uniforms: { md: { value: MOON_DIR }, k: { value: 1 } },
    vertexShader: 'varying vec3 vd; void main(){ vd = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec3 vd; uniform vec3 md; uniform float k;
      void main(){ float h = clamp(vd.y, -0.2, 1.0);
        vec3 zen = vec3(.004,.007,.018), hor = vec3(.025,.045,.095);
        vec3 c = mix(hor, zen, pow(clamp(h*1.6+.05,0.,1.), .55));
        float m = max(dot(vd, md), 0.); c += vec3(.22,.24,.30) * pow(m, 90.) * .45 + vec3(.08,.10,.15) * pow(m, 14.) * .22 + vec3(.05,.04,.02) * pow(m, 5.) * .08;
        gl_FragColor = vec4(c * k, 1.); }` }));
  scene.add(dome);
  // stars: points on the dome; twinkle in the shader
  const R = mulberry(3), N = 5000, pos = new Float32Array(N * 3), sz = new Float32Array(N), ph = new Float32Array(N);
  for (let i = 0; i < N; i++) { const u = R() * 2 - 1, a = R() * Math.PI * 2, y = Math.abs(u) * .98 + .02, rr = Math.sqrt(1 - y * y); pos[i * 3] = Math.cos(a) * rr * 900; pos[i * 3 + 1] = y * 900; pos[i * 3 + 2] = Math.sin(a) * rr * 900; sz[i] = .6 + Math.pow(R(), 6) * 3.4; ph[i] = R() * 6.28; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); sg.setAttribute('sz', new THREE.BufferAttribute(sz, 1)); sg.setAttribute('ph', new THREE.BufferAttribute(ph, 1));
  const starMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { t: { value: 0 }, k: { value: 1 }, md: { value: MOON_DIR } },
    vertexShader: `attribute float sz; attribute float ph; uniform float t; varying float a; uniform vec3 md;
      void main(){ vec3 d = normalize(position); a = (.55 + .45 * sin(t * (1.3 + ph) + ph * 7.)) * smoothstep(.02, .18, d.y) * (1. - .85 * pow(max(dot(d, md),0.), 30.));
        gl_PointSize = sz * 1.4; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `varying float a; uniform float k; void main(){ vec2 p = gl_PointCoord - .5; float f = exp(-dot(p,p) * 18.); gl_FragColor = vec4(vec3(1., .96, .9) * f * a * k, f * a * k); }` });
  scene.add(new THREE.Points(sg, starMat));
  // the Moon: a lit sphere (near-full, a little gibbous), a soft silver halo with a faint gold outer ring
  const mtex = tex(moonCanvas()), moon = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshStandardMaterial({ map: mtex, bumpMap: mtex, bumpScale: 2.5, roughness: 1, metalness: 0 }));
  const D = 800, rad = D * Math.tan(2.2 * Math.PI / 180); moon.scale.setScalar(rad); moon.position.copy(MOON_DIR).multiplyScalar(D); moon.rotation.y = .6; scene.add(moon);
  const sun = new THREE.DirectionalLight(0xffffff, 3.2); sun.position.copy(moon.position).add(new THREE.Vector3(-.35, .25, 1).multiplyScalar(rad * 40)); sun.target = moon; scene.add(sun); scene.add(sun.target);
  scene.add(new THREE.AmbientLight(0x223355, .12));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(glowCanvas(a => `rgba(200,214,255,${a})`)), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .9 }));
  halo.scale.setScalar(rad * 5.2); halo.material.opacity = .55; halo.position.copy(moon.position).multiplyScalar(1.02); scene.add(halo);
  const gold = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(glowCanvas(a => `rgba(255,214,150,${a * .5})`)), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .45 }));
  gold.scale.setScalar(rad * 11); gold.material.opacity = .22; gold.position.copy(moon.position).multiplyScalar(1.03); scene.add(gold);
  // high clouds drifting across the sky, silvered by the moon
  const clouds = []; const CR = mulberry(9);
  for (let i = 0; i < 9; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(softCanvas(512, 192, i * 3.1 + 1, 'cloud')), color: new THREE.Color(.24, .29, .42), transparent: true, opacity: .45, depthWrite: false }));
    const az = -Math.PI / 2 + (CR() - .5) * 1.6, el = .1 + CR() * .35; m.userData = { az, el, sp: .004 + CR() * .006, w: 260 + CR() * 260 }; m.scale.set(m.userData.w, m.userData.w * .32, 1); scene.add(m); clouds.push(m); }
  return { scene, starMat, dome, moon, halo, gold, clouds, moonRad: rad, D,
    update(t, k = 1) { starMat.uniforms.t.value = t; starMat.uniforms.k.value = k; dome.material.uniforms.k.value = k;
      for (const m of clouds) { const az = m.userData.az + t * m.userData.sp, el = m.userData.el; m.position.set(Math.cos(az) * 700 * Math.cos(el), Math.sin(el) * 700, Math.sin(az) * 700 * Math.cos(el)); m.material.opacity = .42 * k; } } };
}

// ---------------------------------------------------------------- the landscape
export function heightAt(x, z) {
  let h = 7 * (fbm(x * .006 + 3, z * .006 + 1, 4) - .45) + 2.2 * (fbm(x * .03, z * .03, 3) - .5);
  const road = Math.exp(-(x * x) / (2 * 9 * 9)), side = Math.exp(-Math.pow(z + 12, 2) / (2 * 8 * 8)) * (x > 0 ? 1 : 0);   // the main road (x≈0) and the side path (z≈−12, x>0)
  return h * (1 - .85 * Math.max(road, side)) + .0;
}
export function buildWorld() {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x070d19, .0036);
  // terrain
  const S = 4200, seg = 320, tg = new THREE.PlaneGeometry(S, S, seg, seg); tg.rotateX(-Math.PI / 2);
  const p = tg.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 200; p.setZ(i, z); p.setY(i, heightAt(x, z)); const n = fbm(x * .05, z * .05, 3); col[i * 3] = .10 + .05 * n; col[i * 3 + 1] = .15 + .07 * n; col[i * 3 + 2] = .14 + .05 * n; }
  tg.setAttribute('color', new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals();
  const ground = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 })); ground.receiveShadow = true; scene.add(ground);
  // the road (along z) and the side path (along +x at z = −12): ribbons laid on the ground, a dashed centre line
  const ribbon = (pts, w, mat, y = .04) => { const g = new THREE.BufferGeometry(), v = [], idx = [];
    pts.forEach((q, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L * w / 2, nz = dx / L * w / 2;
      v.push(q[0] + nx, heightAt(q[0] + nx, q[1] + nz) + y, q[1] + nz, q[0] - nx, heightAt(q[0] - nx, q[1] - nz) + y, q[1] - nz); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } });
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.receiveShadow = true; scene.add(m); return m; };
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x23262c, roughness: .85, metalness: 0 });
  const roadPts = []; for (let z = 120; z >= -700; z -= 4) roadPts.push([Math.sin(z * .004) * 2, z]); ribbon(roadPts, 6.4, asphalt);
  const sidePts = []; for (let x = 0; x <= 300; x += 4) sidePts.push([x, -12 + Math.sin(x * .02) * 1.5]); ribbon(sidePts, 3.6, new THREE.MeshStandardMaterial({ color: 0x3a3630, roughness: .95 }), .05);
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xcfd3d8, roughness: .6, emissive: 0x1a1d22 });
  for (let z = 110; z > -700; z -= 9) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.16, 3), dashMat); d.rotation.x = -Math.PI / 2; d.position.set(Math.sin(z * .004) * 2, heightAt(Math.sin(z * .004) * 2, z) + .07, z); scene.add(d); }
  // trees (instanced: trunk + three foliage cones), more of them away from the road; a few named ones for the parallax demo
  const R = mulberry(17), trunks = [], crowns = [];
  const place = (x, z, s) => { trunks.push([x, z, s]); crowns.push([x, z, s]); };
  for (let i = 0; i < 520; i++) { const x = (R() - .5) * 900, z = 150 - R() * 950; if (Math.abs(x) < 9 || (x > -4 && Math.abs(z + 12) < 6) || (x > -8 && x < 30 && z > -10 && z < 9)) continue; place(x, z, .7 + R() * .9); }
  for (let i = 0; i < 26; i++) { const z = 60 - i * 26 + R() * 8; place(-11 - R() * 6, z, 1 + R() * .3); if (i % 2) place(12 + R() * 5, z + 10, .9 + R() * .3); }
  const TREES = { near: [8, -8], near2: [17.5, -8.5], mid: [-34, -70] }; place(...TREES.near, 1.15); place(...TREES.near2, 1.05); place(...TREES.mid, 1.3);
  const trunkG = new THREE.CylinderGeometry(.18, .3, 4, 7); trunkG.translate(0, 2, 0);
  const crownG = []; for (let k = 0; k < 3; k++) { const c = new THREE.ConeGeometry(2.6 - k * .6, 3.4, 9); c.translate(0, 4.2 + k * 1.7, 0); crownG.push(c); }
  const it = new THREE.InstancedMesh(trunkG, new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 1 }), trunks.length); it.castShadow = true;
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x14281f, roughness: .9 });
  const ics = crownG.map(g => { const m = new THREE.InstancedMesh(g, crownMat, crowns.length); m.castShadow = true; m.receiveShadow = true; return m; });
  const M = new THREE.Matrix4(), Qn = new THREE.Quaternion(), V = new THREE.Vector3();
  trunks.forEach(([x, z, s], i) => { M.compose(V.set(x, heightAt(x, z), z), Qn.setFromAxisAngle(new THREE.Vector3(0, 1, 0), hash2(i, 3) * 6), new THREE.Vector3(s, s, s)); it.setMatrixAt(i, M); ics.forEach(m => m.setMatrixAt(i, M)); });
  scene.add(it); ics.forEach(m => scene.add(m));
  // a few houses with warm windows near the road, and a lamp post at the junction
  const wall = new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: .9 }), roof = new THREE.MeshStandardMaterial({ color: 0x1f2128, roughness: .9 }), win = new THREE.MeshStandardMaterial({ color: 0xffb35c, emissive: 0xffa040, emissiveIntensity: 2.2 });
  for (const [x, z, ry] of [[-26, -95, .3], [30, -150, -.2], [-40, -220, .1], [22, 40, .4], [60, -24, 0]]) {
    const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(9, 5, 7), wall); b.position.y = 2.5; b.castShadow = b.receiveShadow = true; g.add(b);
    const r = new THREE.Mesh(new THREE.ConeGeometry(7, 3, 4), roof); r.position.y = 6.5; r.rotation.y = Math.PI / 4; r.scale.set(1, 1, .8); g.add(r);
    for (const wx of [-2.5, 2.2]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.5), win); w.position.set(wx, 2.6, 3.52); g.add(w); }
    g.position.set(x, heightAt(x, z), z); g.rotation.y = ry; scene.add(g); }
  const LX = -6.5, LZ = -18; const lamp = new THREE.PointLight(0xffb060, 9, 22, 2); lamp.position.set(LX + .4, heightAt(LX, LZ) + 4.5, LZ); scene.add(lamp);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, 4.6, 6), new THREE.MeshStandardMaterial({ color: 0x15171b })); post.position.set(LX, heightAt(LX, LZ) + 2.3, LZ); scene.add(post);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.18, 12, 8), new THREE.MeshStandardMaterial({ emissive: 0xffc070, emissiveIntensity: 1.6, color: 0x000000 })); bulb.position.set(LX + .4, heightAt(LX, LZ) + 4.5, LZ); scene.add(bulb);
  // distant mountains: ridges far away (1.3–2.6 km), deep blue, softened by fog
  const mtMat = new THREE.MeshStandardMaterial({ color: 0x1b2742, roughness: 1, fog: false });
  for (const [D, ht, sd, k] of [[1400, 170, 2, .9], [2000, 300, 5, .7], [2600, 420, 8, .55]]) {
    const g = new THREE.BufferGeometry(), v = [], idx = [], n = 160; for (let i = 0; i <= n; i++) { const a = -Math.PI * .55 + i / n * Math.PI * 1.1 - Math.PI / 2, hh = ht * (.35 + .65 * fbm(i * .07 + sd, sd, 5));
      v.push(Math.cos(a) * D, -20, Math.sin(a) * D, Math.cos(a) * D, hh, Math.sin(a) * D); if (i) { const q = i * 2; idx.push(q - 2, q - 1, q, q - 1, q + 1, q); } }
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mtMat.clone()); m.material.color.setRGB(.06 * k + .02, .085 * k + .03, .15 * k + .05); m.material.side = THREE.DoubleSide; scene.add(m); }
  // ground mist: soft sheets drifting low over the fields
  const mistTex = tex(softCanvas(512, 256, 7.7, 'mist')), mists = [], MR = mulberry(29);
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(60 + MR() * 60, 7 + MR() * 6), new THREE.MeshBasicMaterial({ map: mistTex, color: 0x8ea4c8, transparent: true, opacity: .16 + MR() * .1, depthWrite: false, fog: true }));
    const x = (MR() - .5) * 240, z = 40 - MR() * 360; m.userData = { x, z, sp: .3 + MR() * .6 }; m.position.set(x, heightAt(x, z) + 1.6 + MR() * 2, z); scene.add(m); mists.push(m); }
  // light: the moon (from the sky's moon direction), a dim blue sky fill
  const moonLight = new THREE.DirectionalLight(0xbfcdf5, 1.15); moonLight.position.copy(MOON_DIR).multiplyScalar(200); moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048); Object.assign(moonLight.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 500 }); moonLight.shadow.bias = -.0008; moonLight.shadow.radius = 3;
  scene.add(moonLight); scene.add(moonLight.target); const hemi = new THREE.HemisphereLight(0x2a3d6a, 0x06080c, .5); scene.add(hemi);
  return { scene, moonLight, hemi, mists, TREES,
    update(t, focus, camQuat) { moonLight.position.copy(focus).add(MOON_DIR.clone().multiplyScalar(200)); moonLight.target.position.copy(focus);
      for (const m of mists) { const x = m.userData.x + t * m.userData.sp; m.position.x = x; if (camQuat) m.quaternion.copy(camQuat); } } };
}

// ---------------------------------------------------------------- the walker: a jointed figure in a long dark coat; o: phase (rad), walk 0..1, heading (rad, 0 = −z), look (head pitch)
export function buildWalker() {
  const cloth = new THREE.MeshStandardMaterial({ color: 0x262b34, roughness: .75 }), skin = new THREE.MeshStandardMaterial({ color: 0x7a5a48, roughness: .7 }), dark = new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: .8 });
  const cap = (r, L, m) => { const g = new THREE.CapsuleGeometry(r, L, 6, 12); g.translate(0, -L / 2 - r, 0); const x = new THREE.Mesh(g, m); x.castShadow = true; return x; };
  const root = new THREE.Group(), hips = new THREE.Group(); hips.position.y = .95; root.add(hips);
  const torso = cap(.17, .42, cloth); torso.rotation.x = Math.PI; torso.position.y = 0; hips.add(torso);
  const coat = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.21, .58), new THREE.Vector2(.24, .3), new THREE.Vector2(.27, 0), new THREE.Vector2(.31, -.38), new THREE.Vector2(.33, -.46)], 18), cloth); coat.castShadow = true; hips.add(coat);
  const head = new THREE.Group(); head.position.y = .78; hips.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(.12, 20, 14), skin); skull.scale.set(.92, 1.08, 1); skull.castShadow = true; head.add(skull);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.128, 20, 12, 0, Math.PI * 2, 0, Math.PI * .55), dark); hair.rotation.x = -.25; head.add(hair);
  const limbs = {};
  for (const s of [-1, 1]) { const th = new THREE.Group(); th.position.set(s * .1, 0, 0); hips.add(th); const t1 = cap(.075, .36, dark); th.add(t1); const kn = new THREE.Group(); kn.position.y = -.51; th.add(kn); const sh = cap(.065, .36, dark); kn.add(sh);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(.1, .07, .26), dark); foot.position.set(0, -.5, -.06); foot.castShadow = true; kn.add(foot); limbs['leg' + s] = { th, kn };
    const sho = new THREE.Group(); sho.position.set(s * .22, .56, 0); hips.add(sho); const u = cap(.06, .26, cloth); sho.add(u); const el = new THREE.Group(); el.position.y = -.38; sho.add(el); const f = cap(.05, .24, cloth); el.add(f);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), skin); hand.position.y = -.36; el.add(hand); limbs['arm' + s] = { sho, el }; }
  return { root, update(o) { const ph = o.phase || 0, w = o.walk ?? 0, sw = Math.sin(ph);
    for (const s of [-1, 1]) { const p = ph + (s > 0 ? 0 : Math.PI), L = limbs['leg' + s], A = limbs['arm' + s];
      L.th.rotation.x = -Math.sin(p) * .42 * w; L.kn.rotation.x = Math.max(0, Math.sin(p + 1.6)) * .85 * w;
      A.sho.rotation.x = Math.sin(p) * .36 * w; A.sho.rotation.z = s * .06; A.el.rotation.x = -(.2 + .25 * Math.max(0, Math.sin(p))) * w - .1; }
    hips.position.y = .95 + Math.abs(Math.cos(ph)) * .035 * w - .035 * w; hips.rotation.y = sw * .08 * w; head.rotation.y = -sw * .06 * w; head.rotation.x = -(o.look || 0);
    root.rotation.y = o.heading || 0; } };
}

// ---------------------------------------------------------------- space: Earth and Moon (true scale available)
export function buildSpace() {
  const scene = new THREE.Scene();
  const R = mulberry(41), N = 6000, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const u = R() * 2 - 1, a = R() * 6.283, r = Math.sqrt(1 - u * u); pos[i * 3] = Math.cos(a) * r * 5000; pos[i * 3 + 1] = u * 5000; pos[i * 3 + 2] = Math.sin(a) * r * 5000; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: .8 })));
  // Earth radius 1 (6,371 km); Moon radius 0.2727 at 60.34 Earth radii (384,400 km)
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshStandardMaterial({ map: tex(earthCanvas()), roughness: .8, metalness: 0 })); earth.rotation.z = .41; scene.add(earth);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(1.035, 64, 48), new THREE.ShaderMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
    vertexShader: 'varying vec3 n; varying vec3 v; void main(){ n = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); v = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 n; varying vec3 v; void main(){ float r = pow(1. - abs(dot(n, v)), 2.4); gl_FragColor = vec4(vec3(.35,.6,1.) * r * 1.4, r); }' }));
  scene.add(atm);
  const mtex = tex(moonCanvas()), moon = new THREE.Mesh(new THREE.SphereGeometry(.2727, 64, 48), new THREE.MeshStandardMaterial({ map: mtex, bumpMap: mtex, bumpScale: 1.5, roughness: 1 }));
  moon.position.set(0, 60.34, 0); scene.add(moon);
  const sun = new THREE.DirectionalLight(0xffffff, 3.0); sun.position.set(-40, 20, 30); scene.add(sun); scene.add(new THREE.AmbientLight(0x1a2440, .25));
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0xd6aa5c, wireframe: true, transparent: true, opacity: 0 }), ghosts = [];
  for (let i = 1; i <= 30; i++) { const g = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), ghostMat.clone()); g.position.set(0, 1 + 2 * (i - 1) + 1, 0); scene.add(g); ghosts.push(g); }
  return { scene, earth, moon, atm, ghosts, update(t) { earth.rotation.y = t * .05; moon.rotation.y = .4; } };
}
