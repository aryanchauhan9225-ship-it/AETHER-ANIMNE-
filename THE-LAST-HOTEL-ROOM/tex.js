// Procedural textures (Canvas2D) for the hotel: stone façade, wet paving, marble, damask wallpaper, carpet,
// mahogany, brass number plates, clock dial, linen, key rack, dust sheets. Deterministic, no external images.
import * as THREE from 'three';
import { mulberry } from '/core/lib.js';

const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function tex(c, { srgb = true, repeat = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}
function grain(x, w, h, n, a, R, cols) {
  for (let i = 0; i < n; i++) { x.fillStyle = cols[Math.floor(R() * cols.length)]; x.globalAlpha = a * (.3 + R() * .7); const s = 1 + R() * 2.5; x.fillRect(R() * w, R() * h, s, s); }
  x.globalAlpha = 1;
}
function streaks(x, w, h, n, R, col, a) {   // vertical grime / rain stains
  for (let i = 0; i < n; i++) { const sx = R() * w, len = h * (.2 + R() * .8), gw = 2 + R() * 10; const g = x.createLinearGradient(0, 0, 0, len);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(sx, R() * h * .3, gw, len); }
}

// Stone façade: ashlar blocks, soot streaks, rain darkening (1 tile = 4 m × 4 m)
export function stone() {
  const S = 1024, c = cv(S, S), x = c.getContext('2d'), R = mulberry(3);
  x.fillStyle = '#5d564c'; x.fillRect(0, 0, S, S);
  const bh = S / 10;
  for (let r = 0; r < 10; r++) {
    const off = (r % 2) * 64;
    for (let k = -1; k < 9; k++) { const bx = k * 128 + off, v = 70 + R() * 30; x.fillStyle = `rgb(${v + 10},${v + 4},${v - 6})`; x.fillRect(bx + 2, r * bh + 2, 124, bh - 4); }
    x.fillStyle = 'rgba(25,22,18,.8)'; x.fillRect(0, r * bh, S, 3);
  }
  grain(x, S, S, 30000, .25, R, ['#2a2620', '#8a8070', '#3e382f']);
  streaks(x, S, S, 160, R, '20,18,14', .35);
  return tex(c);
}
// Wet paving at night: dark slabs, puddles stored in alpha-free roughness (the shader reads green as wetness)
export function paving() {
  const S = 1024, c = cv(S, S), x = c.getContext('2d'), R = mulberry(4);
  x.fillStyle = '#26262a'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const v = 30 + R() * 14; x.fillStyle = `rgb(${v},${v},${v + 4})`; x.fillRect(i * 128 + 3, j * 128 + 3, 122, 122); }
  grain(x, S, S, 40000, .3, R, ['#101012', '#4a4a50']);
  return tex(c);
}
export function wetness() {   // grey = puddle mask
  const S = 512, c = cv(S, S), x = c.getContext('2d'), R = mulberry(5);
  x.fillStyle = '#303030'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 26; i++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); x.save(); x.translate(R() * S, R() * S); x.scale(30 + R() * 90, 14 + R() * 40);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.7, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); x.restore(); }
  return tex(c, { srgb: false });
}
// Lobby marble: cream and near-black checkerboard with veins (1 tile = 1.2 m)
export function marble() {
  const S = 512, c = cv(S, S), x = c.getContext('2d'), R = mulberry(6);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? '#1c1a18' : '#c9bfa8'; x.fillRect(i * 256, j * 256, 256, 256); }
  x.lineCap = 'round';
  for (let k = 0; k < 40; k++) { x.strokeStyle = `rgba(${R() < .5 ? '90,80,64' : '230,220,200'},${.15 + R() * .25})`; x.lineWidth = .6 + R() * 2;
    x.beginPath(); let px = R() * S, py = R() * S; x.moveTo(px, py); for (let s = 0; s < 8; s++) { px += (R() - .4) * 70; py += (R() - .5) * 50; x.lineTo(px, py); } x.stroke(); }
  x.fillStyle = 'rgba(20,18,14,.9)'; x.fillRect(0, 255, S, 2); x.fillRect(255, 0, 2, S);
  grain(x, S, S, 12000, .18, R, ['#6a6050', '#f0e8d8']);
  return tex(c);
}
// Damask wallpaper in dark gold (the dominant hue), faded and stained (1 tile = .64 m)
export function damask() {
  const S = 512, c = cv(S, S), x = c.getContext('2d'), R = mulberry(7);
  x.fillStyle = '#8a6c32'; x.fillRect(0, 0, S, S);
  const motif = (cx, cy, s) => {
    x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = 'rgba(64,44,14,.55)';
    for (const m of [1, -1]) { x.save(); x.scale(m, 1); x.beginPath(); x.moveTo(0, -60); x.bezierCurveTo(40, -50, 46, -10, 18, 6); x.bezierCurveTo(44, 20, 34, 56, 0, 64);
      x.bezierCurveTo(10, 30, 8, 16, 0, 10); x.closePath(); x.fill(); x.beginPath(); x.ellipse(26, -30, 8, 14, .5, 0, 7); x.fill(); x.restore(); }
    x.fillStyle = 'rgba(200,160,80,.25)'; x.beginPath(); x.ellipse(0, -2, 6, 10, 0, 0, 7); x.fill(); x.restore();
  };
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { motif(128 + i * 256, 128 + j * 256, 1.2); motif(i * 256, j * 256, .9); motif(256 * (i + 1), 256 * j, .9); }
  grain(x, S, S, 14000, .2, R, ['#3a2a10', '#b08a48']);
  streaks(x, S, S, 30, R, '40,28,10', .18);
  return tex(c);
}
// Maroon hotel carpet runner with a faded gold border pattern (desaturated: red is reserved for the phone)
export function carpet() {
  const S = 512, c = cv(S, S), x = c.getContext('2d'), R = mulberry(8);
  x.fillStyle = '#4a2a26'; x.fillRect(0, 0, S, S);
  x.strokeStyle = 'rgba(150,118,70,.45)'; x.lineWidth = 6; x.strokeRect(40, -10, S - 80, S + 20);
  x.lineWidth = 2; x.strokeRect(58, -10, S - 116, S + 20);
  for (let j = 0; j < 4; j++) { x.save(); x.translate(S / 2, 64 + j * 128); x.rotate(Math.PI / 4); x.strokeStyle = 'rgba(150,118,70,.35)'; x.lineWidth = 4; x.strokeRect(-34, -34, 68, 68); x.restore(); }
  grain(x, S, S, 50000, .3, R, ['#2a1614', '#6a4038', '#3a2420']);
  return tex(c);
}
// Mahogany panelling / door wood
export function wood(seed = 9, base = '#3a2216') {
  const S = 512, c = cv(S, S), x = c.getContext('2d'), R = mulberry(seed);
  x.fillStyle = base; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 160; i++) { x.strokeStyle = `rgba(${R() < .5 ? '20,10,6' : '110,64,36'},${.12 + R() * .2})`; x.lineWidth = .8 + R() * 2.5;
    const px = R() * S; x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + (R() - .5) * 30, S * .3, px + (R() - .5) * 30, S * .7, px + (R() - .5) * 20, S); x.stroke(); }
  return tex(c);
}
// Brass number plate
export function plate(num) {
  const c = cv(256, 128), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#d8b45a'); g.addColorStop(.5, '#8a6a28'); g.addColorStop(1, '#c49a48');
  x.fillStyle = g; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#4a3410'; x.lineWidth = 6; x.strokeRect(6, 6, 244, 116);
  x.fillStyle = '#2a1c08'; x.font = 'bold 84px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(num), 128, 70);
  return tex(c, { repeat: false });
}
// Clock dial (roman numerals), cream, aged
export function dial() {
  const S = 512, c = cv(S, S), x = c.getContext('2d'), R = mulberry(12);
  x.fillStyle = '#d8ccae'; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill();
  const g = x.createRadialGradient(256, 256, 120, 256, 256, 256); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,70,30,.45)'); x.fillStyle = g; x.fill();
  x.strokeStyle = '#2a2014'; x.lineWidth = 6; x.beginPath(); x.arc(256, 256, 236, 0, 7); x.stroke();
  const RN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  x.fillStyle = '#20180e'; x.font = 'bold 44px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; x.save(); x.translate(256 + Math.sin(a) * 190, 256 - Math.cos(a) * 190); x.rotate(a); x.fillText(RN[k], 0, 0); x.restore(); }
  for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2; x.lineWidth = k % 5 ? 2 : 5; x.beginPath(); x.moveTo(256 + Math.sin(a) * 222, 256 - Math.cos(a) * 222); x.lineTo(256 + Math.sin(a) * 236, 256 - Math.cos(a) * 236); x.stroke(); }
  grain(x, S, S, 6000, .2, R, ['#6a5a3a', '#f4ead0']);
  return tex(c, { repeat: false });
}
export function linen() {
  const S = 256, c = cv(S, S), x = c.getContext('2d'), R = mulberry(13);
  x.fillStyle = '#e8e2d4'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < S; i += 2) { x.fillStyle = `rgba(150,140,120,${.05 + R() * .05})`; x.fillRect(i, 0, 1, S); x.fillRect(0, i, S, 1); }
  grain(x, S, S, 3000, .12, R, ['#bdb4a0']);
  return tex(c);
}
export function sheet() {   // dust sheets
  const S = 256, c = cv(S, S), x = c.getContext('2d'), R = mulberry(14);
  x.fillStyle = '#b8b0a0'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 40; i++) { const g = x.createLinearGradient(0, 0, S, 0); const p = R(); g.addColorStop(Math.max(0, p - .05), 'rgba(0,0,0,0)'); g.addColorStop(p, 'rgba(60,54,44,.18)'); g.addColorStop(Math.min(1, p + .05), 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); }
  grain(x, S, S, 5000, .2, R, ['#6a6050', '#d8d0c0']);
  return tex(c);
}
// Key rack: board with 12 brass tags 301–312; hook 309 empty
export function keyRack() {
  const c = cv(1024, 512), x = c.getContext('2d'), R = mulberry(15);
  x.fillStyle = '#3a2216'; x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 80; i++) { x.strokeStyle = `rgba(20,10,6,${.2 + R() * .2})`; x.lineWidth = 1 + R() * 2; const py = R() * 512; x.beginPath(); x.moveTo(0, py); x.lineTo(1024, py + (R() - .5) * 20); x.stroke(); }
  x.strokeStyle = '#c49a48'; x.lineWidth = 8; x.strokeRect(10, 10, 1004, 492);
  for (let k = 0; k < 12; k++) {
    const col = k % 6, row = Math.floor(k / 6), cx = 110 + col * 162, cy = 90 + row * 230, n = 301 + k;
    x.fillStyle = '#d8b45a'; x.beginPath(); x.arc(cx, cy, 9, 0, 7); x.fill();                                   // hook
    x.fillStyle = '#e8dcc0'; x.font = 'bold 30px serif'; x.textAlign = 'center'; x.fillText(String(n), cx, cy - 26);   // label above the hook
    if (n === 309) { x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(cx - 34, cy + 18, 68, 120); continue; }        // empty: only the clean patch where the tag hung
    x.strokeStyle = '#b08840'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx, cy + 6); x.lineTo(cx, cy + 30); x.stroke();
    const g = x.createLinearGradient(cx - 30, 0, cx + 30, 0); g.addColorStop(0, '#9a7430'); g.addColorStop(.5, '#e0c070'); g.addColorStop(1, '#8a6428');
    x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy + 80, 30, 52, 0, 0, 7); x.fill();
    x.fillStyle = '#3a2808'; x.font = 'bold 26px serif'; x.fillText(String(n), cx, cy + 90);
  }
  return tex(c, { repeat: false });
}
export function paintingFrame() {   // a dark old oil portrait-landscape (unreadable at VHS resolution)
  const c = cv(256, 320), x = c.getContext('2d'), R = mulberry(16);
  const g = x.createLinearGradient(0, 0, 0, 320); g.addColorStop(0, '#2a2418'); g.addColorStop(1, '#14100a'); x.fillStyle = g; x.fillRect(0, 0, 256, 320);
  x.fillStyle = 'rgba(120,90,50,.35)'; x.beginPath(); x.ellipse(128, 140, 60, 80, 0, 0, 7); x.fill();
  grain(x, 256, 320, 4000, .25, R, ['#4a3a20', '#0a0806']);
  x.strokeStyle = '#8a6a28'; x.lineWidth = 18; x.strokeRect(9, 9, 238, 302);
  return tex(c, { repeat: false });
}
