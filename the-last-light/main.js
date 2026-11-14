// आखिरी रोशनी / THE LAST LIGHT — complete 60 s film. Lemo-Opuscar Watercolor Brush, 1920×1080, 60 fps (3,600 frames).
// Nine scenes joined by painted brush-edge wipes; one paper texture and grain over everything. Pure function of t.
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const DUR = 60.0, Q = new URLSearchParams(location.search);
let PAPER_IMG, GRAIN;
const ORDER = [['s1', scene1], ['s2', scene2], ['s3', scene3], ['s4', scene4], ['s5', scene5], ['s6', scene6], ['s7', scene7], ['s8', scene8], ['s9', scene9]];
const WIPE = .8;   // seconds, centred on each boundary
// narration: id → start time (film seconds); text = subtitle (the message in s8 and the closing question are on screen, not subtitled)
const VO = [['s1', .5], ['s2', 6.9], ['s3', 12.6], ['s4', 18.7], ['s5', 25.3], ['s6', 32.6], ['s7', 40.0], ['s8', 46.4], ['m8', 51.0], ['s9', 53.6], ['q9', 57.9]];
const SUBTXT = { s1: 'हर रात... ठीक बारह बजे... समुद्र के किनारे, एक रोशनी जलती है।', s2: 'पर उस लाइटहाउस में... पिछले बीस सालों से, कोई नहीं रहता।',
  s3: 'गाँव वाले कहते हैं... वो रोशनी, किसी का इंतज़ार कर रही है।', s4: 'एक रात, एक नौजवान फ़ोटोग्राफ़र... सच जानने के लिए, वहाँ पहुँचा।',
  s5: 'ठीक बारह बजे, रोशनी जल उठी... और ऊपर की खिड़की में, कोई खड़ा था।', s6: 'उसने वो पुराना दरवाज़ा खोला...', s7: 'अंदर... कोई नहीं था। बस धूल... और ख़ामोशी।',
  s8: 'उसने कैमरे में, वो तस्वीर देखी... स्क्रीन पर लिखा था...', s9: 'और तभी... रोशनी फिर से जल उठी।' };
let DURS = {};

function drawScene(i, t) { const [k, fn] = ORDER[i]; fn(ctx, t, t - SC[k][0]); }
function render(t) {
  rset(ctx); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t >= K.black) endTitle(ctx, t);
  else {
    let i = ORDER.findIndex(([k]) => t < SC[k][1]); if (i < 0) i = 8;
    const b0 = SC[ORDER[i][0]][0], w = i > 0 ? seg(t, b0 - WIPE / 2, b0 + WIPE / 2) : 1;
    const next = i < 8 ? SC[ORDER[i][0]][1] : 1e9, wn = seg(t, next - WIPE / 2, next + WIPE / 2);
    if (wn > 0 && i < 8) { drawScene(i, t); wipe(eio(wn), () => drawScene(i + 1, t)); }   // leaving this scene: the next one is painted over it
    else if (w < 1) { drawScene(i - 1, t); wipe(eio(w), () => drawScene(i, t)); }
    else drawScene(i, t);
  }
  // paper + pigment grain over every frame; vignette
  rset(ctx); const vg = ctx.createRadialGradient(W / 2, H / 2, 520, W / 2, H / 2, 1180); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(2,4,8,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .55; ctx.drawImage(PAPER_IMG, 0, 0); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .24; ctx.drawImage(GRAIN, 0, 0, W, H); ctx.restore();
  const dk = 1 - eio(seg(t, .15, 1.6)); if (dk > 0) { ctx.fillStyle = `rgba(1,2,5,${(.98 * dk).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
  const end = seg(t, 59.55, 60); if (end > 0) { ctx.fillStyle = `rgba(1,2,5,${ss(end).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
  if (!Q.has('nosub')) subs(t);
}
// brush-edge wipe: a ragged painted edge sweeps left → right, the next scene appears behind it
function wipe(p, draw) {
  ctx.save(); rset(ctx); ctx.beginPath(); const xe = -260 + (W + 520) * p; ctx.moveTo(-10, -10);
  for (let y = -10; y <= H + 10; y += 30) ctx.lineTo(xe + (fbm(y * .011 + 3) - .5) * 260 + Math.sin(y * .045) * 16, y);
  ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip(); ctx.fillStyle = '#05080d'; ctx.fillRect(0, 0, W, H); draw(); ctx.restore();
  rset(ctx);
}
function subs(t) {
  for (const [id, t0] of VO) { const txt = SUBTXT[id]; if (!txt) continue; const t1 = t0 + Math.max(1.8, (DURS[id] || 3) + .6); if (t < t0 || t >= t1) continue;
    const a = Math.min(1, (t - t0) / .35, (t1 - t) / .35); rset(ctx); subtitleBand(ctx);
    ctx.save(); ctx.font = "500 40px 'Noto Serif Devanagari'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = a; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(3,6,12,.85)'; ctx.lineWidth = 10; ctx.strokeText(txt, W / 2, H - 80); ctx.fillStyle = 'rgba(234,228,212,.95)'; ctx.fillText(txt, W / 2, H - 80); ctx.restore(); }
}
function makeGrain() {
  const g = document.createElement('canvas'); g.width = 960; g.height = 540; const x = g.getContext('2d'), im = x.createImageData(960, 540), R = mulberry(77);
  for (let i = 0; i < 960 * 540; i++) { const v = 128 + (R() - .5) * 70 + (R() < .012 ? 60 : 0); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  x.putImageData(im, 0, 0); return g;
}
// —— sound events for mix.py ——
function events() {
  const ev = VO.map(([id, t]) => ({ t, type: 'line', id }));
  const add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  add('flash', K.flash1); add('lamp', K.lamp5); add('sil', K.sil5); add('creak', K.open6, { d: 1.8 }); add('handle', K.open6 - .25); add('beep', K.msgPhoto); add('msg', K.msgText);
  add('flood', K.flood9); add('black', K.black); add('title', K.title);
  for (let k = 1; ; k++) { const t = 18 + k * WALK.stride / WALK.speed; if (t >= 25.2) break; add('step', t, { surf: 'grass' }); }   // a footfall each stride (one per π of phase)
  for (const t of [39.6, 40.15, 40.75, 41.3, 41.8, 42.2]) add('step', t, { surf: 'wood' });
  for (const [k, [, b]] of Object.entries(SC)) if (b < 60) add('wipe', b - WIPE / 2, { d: WIPE });
  return ev.sort((a, b) => a.t - b.t);
}
window.DUR = DUR; window.render = render; window.EV = events();
window.TEXTS = t => [];
(async () => {
  PAPER_IMG = new Image(); PAPER_IMG.src = 'paper.jpg'; await PAPER_IMG.decode();
  for (const f of ["600 150px 'Noto Serif Devanagari'", "500 40px 'Noto Serif Devanagari'"]) await document.fonts.load(f, 'आखिरी रोशनी समुद्र');
  try { const r = await fetch('voices60/dur.json'); if (r.ok) DURS = await r.json(); } catch (e) { }
  GRAIN = makeGrain(); render(Number(Q.get('t') ?? 3)); window.READY = true;
})();
