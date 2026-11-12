// Colour model (iro shitei) for the traveller + train, with per-light variants (multiplied lit / shade / line, skin set by hand).
import { hex } from './cel.js';
export const BASE = {
  skin: { f: '#ffdcc8', s: '#e0a090', h: '#fff2e8', l: '#5a2e2a' },
  blush: '#ff9a8a',
  hair: { f: '#7a3a2e', s: '#4e2220', h: '#c47a5a', l: '#2e1010' },     // dark auburn bob
  lash: '#24100e',
  eye: { f: '#c87a2a', s: '#7a3e14', h: '#ffd08a', l: '#2e1606' },        // amber eyes
  white_eye: '#fffaf4', mouth: '#9a3b3a',
  coat: { f: '#2f8a86', s: '#1d5c5e', h: '#7fd0c4', l: '#0e2e30' },       // teal travelling coat
  scarf: { f: '#e8a83a', s: '#b0702a', h: '#ffe0a0', l: '#5a3410' },      // long ochre scarf
  tights: { f: '#3a3048', s: '#241e30', h: '#6a5a80', l: '#0e0a14' },
  boot: { f: '#5a3a2e', s: '#36221a', h: '#9a6a52', l: '#140a06' },
  bag: { f: '#a8743e', s: '#6e4622', h: '#e0b080', l: '#2e1a08' },
  train: { f: '#1e2a5c', s: '#121a3c', h: '#3e56a0', l: '#070a1e' },    // navy body
  trim: { f: '#d8b24a', s: '#94742a', h: '#fff0b0', l: '#3e2e08' },      // gold line
  roof: { f: '#4a4e66', s: '#2c2e42', h: '#7a7e9a', l: '#0e0e18' },
  bogie: { f: '#2a2a30', s: '#16161a', h: '#56565e', l: '#060608' },
  // keys head.js expects for parts we switch off
  jacket: { f: '#2f8a86', s: '#1d5c5e', h: '#7fd0c4', l: '#0e2e30' }, stripe: { f: '#2f8a86', s: '#1d5c5e', l: '#0e2e30' },
  magenta: { f: '#e8a83a', s: '#b0702a', l: '#5a3410' }, phone: { f: '#2a2a34', s: '#16161d', h: '#5c5c70', l: '#08080c' },
  lens: { f: '#86e6ff', s: '#3a9fd0', h: '#ffffff', l: '#1d3a58' }, chrome: { f: '#dfe7f3', s: '#646f90', h: '#ffffff', l: '#2b3350' },
  strap: { f: '#5a3a2e', s: '#36221a', l: '#140a06' },
};
const mul = (c, m) => { const v = hex(c); return '#' + v.map((x, i) => Math.max(0, Math.min(255, Math.round(x * m[i]))).toString(16).padStart(2, '0')).join(''); };
export const LIGHTS = {
  day: { lit: [1, 1, 1], shade: [1, 1, 1], line: [1, 1, 1] },
  dusk: { lit: [1.06, .86, .78], shade: [.7, .5, .74], line: [.9, .66, .8] },        // low sun: warm lit, violet shade
  backlit: { lit: [.56, .38, .52], shade: [.36, .22, .4], line: [.5, .3, .5] },     // against the sunset sky
  gold: { lit: [1.12, .96, .72], shade: [.8, .6, .62], line: [.9, .7, .6] },         // lit by the train's door
};
export function palette(name) {
  const L = LIGHTS[name], out = {};
  for (const [k, v] of Object.entries(BASE)) {
    if (typeof v === 'string') { out[k] = mul(v, L.lit); continue; }
    out[k] = {}; for (const [kk, c] of Object.entries(v)) out[k][kk] = mul(c, kk === 's' ? L.shade : kk === 'l' ? L.line : L.lit);
  }
  return out;
}
export const PAL = { day: palette('day'), dusk: palette('dusk'), backlit: palette('backlit'), gold: palette('gold') };
// skin by hand per light (multiplying turns faces orange/pink)
Object.assign(PAL.dusk.skin, { f: '#ffd2bc', s: '#c58a98', h: '#fff0e0' });
Object.assign(PAL.backlit.skin, { f: '#9a6a78', s: '#6a4458', h: '#c89aa0' });
Object.assign(PAL.gold.skin, { f: '#ffe0b8', s: '#d0948a', h: '#fff6e0' });
