// CEA-608-style closed captions (monospace, white on a black box per row, ≤ 26 columns in the vertical frame).
// Dialogue captions are in the Latin-script Hindi the film was written in; SDH descriptions in brackets.
import { T, LINES } from './story.js';

const COLS = 26;
function wrap(s) { const out = []; let cur = ''; for (const w of s.split(' ')) { const t = cur ? cur + ' ' + w : w; if (t.length > COLS && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
export function buildCaps(dur) {
  const L = Object.fromEntries(LINES.map(l => [l.id, l.t]));
  const end = (id, pad = .7, min = 1.9) => L[id] + Math.max(min, (dur[id] || 2) + pad);
  const C = [
    { t0: .45, t1: 2.5, text: '[HEAVY RAIN]' },
    { t0: L.g1, t1: end('g1'), text: 'Tees sau nau... ki light?', it: true },
    { t0: T.tick1, t1: T.tick1 + 2.0, text: '[CLOCK TICKING]' },
    { t0: T.flick[0] - .05, t1: T.flick[0] + 1.9, text: '[LIGHTS FLICKER]' },
    { t0: L.g2, t1: end('g2', .9), text: 'Koi hai?', it: true },
    { t0: T.waltz, t1: T.waltz + 1.3, text: '[OLD WALTZ ON A RADIO]' },
    { t0: T.ring, t1: T.ring + 2.2, text: '[TELEPHONE RINGING]' },
    { t0: T.hush[0], t1: T.hush[1], text: '[SILENCE]' },
    { t0: L.v1, t1: T.recOff, text: 'Sir... aap itni der se bahar kyun khade hain?' },
  ];
  C.sort((a, b) => a.t0 - b.t0);
  for (let k = 0; k < C.length - 1; k++) C[k].t1 = Math.min(C[k].t1, C[k + 1].t0);
  C.forEach(c => c.rows = wrap(c.text));
  return C;
}
export function drawCaps(x, caps, t, W = 1080, H = 1920) {
  const c = caps.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const fs = 40, cw = fs * .6, rh = 52, cx = W / 2;
  x.font = `600 ${fs}px 'IBM Plex Mono'`; x.textBaseline = 'middle';
  const n = c.rows.length, yb = H - 360;
  c.rows.forEach((r, i) => {
    const y = yb - (n - 1 - i) * rh, w = (r.length + 2) * cw, x0 = Math.round(cx - w / 2);
    x.fillStyle = '#000'; x.fillRect(x0, y - rh / 2, w, rh); x.fillStyle = '#f2f2f2';
    x.save();
    if (c.it && !r.startsWith('[')) { x.translate(x0 + cw, y); x.transform(1, 0, -.2, 1, 0, 0); x.fillText(r, 0, 2); } else x.fillText(r, x0 + cw, y + 2);
    x.restore();
  });
}
// readcheck: captions are timed by their .srt, but expose them as TEXTS with pass:true is not right; captions are excluded from readcheck
