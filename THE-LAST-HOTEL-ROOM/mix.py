# THE LAST HOTEL ROOM — mix: only what the tape would have recorded (STYLE §7) → out/mix.wav
# rain (outside / through glass / far), thunder, steps by material, clocks, sconce hum, low drone, door, an in-world waltz on a
# radio (sampled strings, CC0), the telephone, the guard's breath and whispers, the voice, camcorder mechanics, title beeps.
# Usage: LIB=<library> "$LIB/.venv/bin/python" mix.py   (reads events.json from core/render/events.mjs)
import sys, os, json, numpy as np, soundfile as sf
from scipy.signal import resample_poly
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ['LIB']
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import *
import sampler as S

E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR); tt = np.arange(N) / SR
ev = lambda k: [e for e in E['ev'] if e['type'] == k]
one = lambda k: ev(k)[0]
rng = np.random.default_rng(309)
curve = lambda keys: np.interp(tt, *np.array(keys, float).T)
def bus(): return np.zeros((N, 2))
def put(b, x, t, g=1., pan=0.):
    s = int(t * SR)
    if s >= N: return
    x = x[:N - s]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    b[s:s + len(x), 0] += x * g * l * 1.414; b[s:s + len(x), 1] += x * g * r * 1.414
def mono(x): return np.stack([x, x], 1)
def verb(x, rt=.6, mix=.2, seed=1):
    n = int(rt * SR); ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR / (rt / 6.9))
    w = np.convolve(x, ir)[:len(x)] / np.sqrt(n) * 2.5; return x * (1 - mix) + w * mix

T_SET = [(0, 'ext'), (7.2, 'lobby'), (13.6, 'hall')]
REC_OFF = one('recOff')['t']; HUSH = one('hush'); H0, H1 = HUSH['t'], HUSH['t'] + HUSH['d']
RING = ev('ring'); RING_STOP = max(e['t'] + e['d'] for e in RING)

# ———— rain: outside (0–7.2), through glass (lobby), far (corridor/room) ————
raw = hp(lp(noise(DUR), 9000), 250); drops = np.zeros(N); idx = rng.integers(0, N, 26000); drops[idx] = rng.uniform(.2, 1, len(idx)); drops = bp(drops, 1500, 9000) * 1.2
rain_out = (raw * .5 + drops) * curve([(0, 0), (.4, 1), (7.0, 1), (7.25, 0), (DUR, 0)])
rain_in = lp(raw, 700) * curve([(0, 0), (7.2, 0), (7.25, .55), (13.4, .55), (13.65, .12), (25.4, .12), (26.8, .22), (H0, .22), (H0 + .001, 0), (H1, 0), (H1 + .4, .14), (REC_OFF, .14), (REC_OFF + .01, 0), (DUR, 0)])
amb = np.stack([rain_out * .9, np.roll(rain_out, 3301) * .9], 1) + np.stack([rain_in, np.roll(rain_in, 2207)], 1)
gutter = bp(noise(DUR), 300, 1400) * (.6 + .4 * np.sin(2 * np.pi * 3.1 * tt)) * curve([(0, 0), (.4, .25), (7.0, .25), (7.25, 0), (DUR, 0)])
amb += mono(gutter * .5)
fx = bus()
put(fx, rumble(3.2, 1.0), one('thunder')['t'] + .55, .55, -.2)
put(fx, hp(noise(.12), 2000) * env_exp(.12, .03), one('thunder')['t'], .25)

# ———— steps by surface ————
for e in ev('step'):
    v = e['v']; s = e['set']
    if s == 'ext': x = hp(noise(.16), 900) * env_exp(.16, .04) * .7 + thump(.5, 80)[:int(.16 * SR)] * .4   # wet stone splash
    elif s == 'lobby': x = verb(click(.55, 1) * .6 + thump(.4, 120)[:int(.09 * SR)] * .5, .9, .3)        # marble, a hall
    else: x = lp(thump(.6, 70), 900)[:int(.25 * SR)] + lp(noise(.25), 600) * env_exp(.25, .05) * .3     # carpet
    put(fx, x, e['t'], .32 * v, (rng.random() - .5) * .2)

# ———— clocks (1 Hz), the sconce hum (gated by flickers), the low drone ————
for e in ev('tick'): put(fx, verb(click(.45, 1), .7, .25, 3), e['t'], .16 * e['v'], -.15)
glight = np.ones(N)
for e in ev('flick'): glight[int(e['t'] * SR):int((e['t'] + .13) * SR)] = .05
hum = sum(a * np.sin(2 * np.pi * 100 * k * tt) for k, a in [(1, 1), (2, .5), (3, .35), (5, .15)]) + bp(noise(DUR), 1800, 4500) * .15
hum *= curve([(0, 0), (13.6, 0), (13.7, .05), (25.4, .04), (26.8, .02), (H0, .02), (H0 + .001, 0), (DUR, 0)]) * glight
drone = lp(brown(DUR), 120) * .8 + .5 * (np.sin(2 * np.pi * 55 * tt) + np.sin(2 * np.pi * 55.7 * tt))
drone *= curve([(0, 0), (13.6, 0), (14.5, .02), (25.4, .06), (31, .1), (RING_STOP, .13), (RING_STOP + .001, 0), (DUR, 0)])
amb += mono(hum + drone)

# ———— door: latch + slow stick-slip hinge ————
d = one('door'); put(fx, click(.8, 1), d['t'], .2, .1)
dt = t_(d['d'] + .3); creakx = np.zeros(len(dt)); f0 = 180 + 90 * np.sin(np.pi * dt / dt[-1]); ph = np.cumsum(f0 / SR) * 2 * np.pi
creakx = np.sign(np.sin(ph)) * (np.abs(np.sin(2 * np.pi * 23 * dt)) ** 3) * np.sin(np.pi * dt / dt[-1])
put(fx, verb(bp(creakx, 300, 3000), .8, .25, 5), d['t'] + .1, .18, .1)

# ———— the waltz: original, 3/4 at 84 BPM, sampled strings + pizzicato + harp through a small radio speaker ————
w = one('waltz'); B = 60 / 84; S.seed(3)
chords = [(57, [60, 64, 69]), (52, [59, 64, 68]), (57, [60, 64, 69]), (52, [59, 62, 68]), (53, [57, 60, 65]), (50, [57, 62, 65]), (52, [56, 59, 64]), (57, [60, 64, 69])]
mel = [76, 74, 72, 71, 72, 69, 71, 68, 69, 72, 76, 77, 76, 74, 71, 69]
evs = []
for bar in range(4):
    for i, (root, ch) in enumerate(chords[bar * 2 % 8: bar * 2 % 8 + 2]):
        t0 = (bar * 2 + i) * 3 * B
        evs.append((t0, 'cellos_pizz', root - 12, B, .7, -.1))
        for k in (1, 2): evs.append((t0 + k * B, 'violins_pizz', ch[0], B * .8, .45, .1)); evs.append((t0 + k * B, 'violins_pizz', ch[1], B * .8, .4, .2))
for k, m in enumerate(mel): evs.append((k * 1.5 * B, 'violins', m, 1.4 * B, .55, 0))
evs.append((0, 'harp', 69, 2.5, .5, .2))
wz = S.render(evs, dur=w['d'] + 1.0)
wz = wz.mean(1) if wz.ndim == 2 else wz
wz = np.tanh(bp(wz, 380, 3200, 3) * 3) / 3                         # small speaker, a little saturated
wz *= 1 + .004 * np.sin(2 * np.pi * .55 * t_(len(wz) / SR))[:len(wz)]
cut = int(w['d'] * SR); wz = wz[:cut]                               # dies with the phone
wz = verb(wz, .7, .3, 7)
wz *= np.minimum(1, np.arange(len(wz)) / (SR * .8))                 # heard as the door opens
music = bus(); put(music, wz / (np.abs(wz).max() + 1e-9), w['t'], .16, -.45)

# ———— the telephone: two bells struck at ~20 Hz, double ring ————
def bell(dur):
    tt_ = t_(dur); x = np.zeros(len(tt_))
    for k in range(int(dur * 20)):
        s = int(k / 20 * SR); seg_ = tt_[:len(tt_) - s]
        f = 1040 if k % 2 else 1270
        x[s:] += sum(a * np.sin(2 * np.pi * f * m * seg_) * np.exp(-seg_ / .09) for m, a in [(1, 1), (2.76, .45), (5.4, .2)])
    return norm(x) * np.minimum(1, (dur - tt_) / .01).clip(0, 1)
for e in RING: put(fx, verb(bell(e['d']), .6, .25, 9), e['t'], .42, .45)

# ———— camcorder mechanics, tears, AF, zoom ————
put(fx, clack(.7, 1), one('recOn')['t'], .25)
put(fx, lp(noise(.25), 1500) * env_exp(.25, .08), one('recOn')['t'] + .05, .12)
for e in ev('tear'): put(fx, bp(noise(e['d']), 800, 6000) * np.sin(np.pi * t_(e['d']) / e['d']), e['t'], .12)
for e in ev('af'): put(fx, click(1.6, 1), e['t'], .05, .3)
for e in ev('zoom'):
    dd = e['d']; tz = t_(dd); m = np.sin(2 * np.pi * np.cumsum(np.full(len(tz), 2600)) / SR) * .3 + bp(noise(dd), 2000, 6000) * .4
    put(fx, m * np.minimum(1, np.minimum(tz, dd - tz) / .05), e['t'], .045, .3)
put(fx, thump(.8, 90), REC_OFF, .3); put(fx, clack(.5, 1), REC_OFF + .02, .25)
for e in ev('beep'):
    if e['v']: put(fx, np.sin(2 * np.pi * 2093 * t_(.035)) * np.minimum(1, (.035 - t_(.035)) / .005), e['t'], .05)
for e in ev('rustle'): put(fx, bp(noise(.5), 500, 4000) * np.sin(np.pi * t_(.5) / .5) ** 2, e['t'], .06 * e['v'])

# ———— voices ————
def voice(i):
    x, sr = sf.read(os.path.join(HERE, 'voices', f'{i}.wav')); x = x if x.ndim == 1 else x.mean(1)
    return resample_poly(x, SR, sr)
vo = bus()
for e in ev('line'):
    x = voice(e['id'])
    if e['who'] == 'ME':   # the guard, behind the camera: close, quiet, breathy
        x = hp(x, 90) + lp(x, 220) * .6
        x += bp(noise(len(x) / SR), 800, 6000)[:len(x)] * np.abs(lp(np.abs(x), 30)) * .5
        x = compress(norm(x) * .9, .3, 3) * .55
        put(vo, x, e['t'], .9, .05)
    else:                  # the voice behind him: close, warm, dry, slightly left and behind
        x = lp(hp(x, 80), 7000); x = verb(compress(norm(x) * .9, .3, 2.5), .5, .12, 11)
        put(vo, x, e['t'], 1.0, -.25)
# breathing: follows fear in the hall, held during the silence, one shaky exhale at the end
br = bus()
def breath(t, din, dout, g):
    for t0, dd, lo, hi in [(t, din, 500, 3000), (t + din + .05, dout, 300, 2200)]:
        x = bp(noise(dd), lo, hi) * np.sin(np.pi * t_(dd) / dd) ** 1.5; put(br, x, t0, g)
t = 14.2
while t < H0 - .6:
    per = 3.6 - 1.4 * min(1, (t - 14) / 18); breath(t, per * .3, per * .4, .035 + .03 * min(1, (t - 14) / 18)); t += per
breath(REC_OFF - .55, .12, .4, .07)

# ———— master: absolute silences (the held breath, after REC off), then sum ————
mix = amb * .6 + fx + music + vo + br
for a, b in [(H0, H1)]: mix[int(a * SR):int(b * SR)] = 0
end = int((REC_OFF + .25) * SR); mix[end:] = 0
for e in ev('beep'):   # title beeps survive after REC off
    if e['v']: put(mix, np.sin(2 * np.pi * 2093 * t_(.035)) * np.minimum(1, (.035 - t_(.035)) / .005), e['t'], .05)
fade = int(.02 * SR); mix[:fade] *= np.linspace(0, 1, fade)[:, None]
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', round(N / SR, 2), 's, peak', round(float(np.abs(mix).max()), 3))
