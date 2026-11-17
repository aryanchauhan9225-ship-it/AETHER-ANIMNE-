# THE STARS ARE ALREADY DEAD? — the soundtrack. Hindi narration (Kokoro hm_omega) over an original score built in code from the toolkit's
# samples (VSCO 2 CE contrabass / cellos / violins, Salamander piano) and synthesis (pad, sub bass, shimmers, booms, air). → out/mix.wav
import sys, os, json, numpy as np, soundfile as sf
from scipy.signal import resample_poly
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ['LIB']
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import *
import sampler as S
E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR); tt = np.arange(N) / SR
ev = lambda k: [e for e in E['ev'] if e['type'] == k]
curve = lambda keys: np.interp(tt, *np.array(keys, float).T)
def bus(): return np.zeros((N, 2))
def put(b, x, t, g=1., pan=0.):
    s = int(t * SR)
    if s >= N or s < 0: return
    x = x[:N - s]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    b[s:s + len(x), 0] += x * g * l * 1.414; b[s:s + len(x), 1] += x * g * r * 1.414
def verb(x, rt=3.0, mix=.4, seed=1):
    n = int(rt * SR); ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR / (rt / 6.9))
    return x * (1 - mix) + np.convolve(x, ir)[:len(x)] / np.sqrt(n) * 2.5 * mix
def stereo(x, d=3001): return np.stack([x, np.roll(x, d)], 1)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
# —— the space: very low air and a high faint hiss, slowly breathing ——
air = lp(brown(DUR), 120) * .5 + bp(noise(DUR), 4000, 9000) * .012 * (.6 + .4 * np.sin(2 * np.pi * .05 * tt))
amb = stereo(air * curve([(0, 0), (1.5, .8), (58.8, .8), (DUR, 0)]), 7001)
# —— pad: a slowly evolving cluster on D (Aeolian), detuned partials, opening toward the reveal ——
def pad(notes, t0, t1, amp, bright=1.0):
    d = t1 - t0; t = t_(d); x = np.zeros(len(t))
    for m in notes:
        for det in (-.07, 0, .06): x += np.sin(2 * np.pi * hz(m + det) * t + det * 9) * (1 / (1 + (m - 50) * .02))
    x = lp(x, 900 + 1400 * bright) * np.minimum(1, t / 3) * np.minimum(1, (d - t) / 3); return x * amp
P = np.zeros(N)
for t0, t1, notes, amp, br in [(0, 11, [38, 45, 50], .05, .4), (9, 25, [38, 45, 53, 57], .05, .6), (23.5, 31.5, [36, 43, 50, 55], .05, .7), (30, 38.5, [38, 45, 50, 57, 60], .055, .9),
                                (36.5, 44, [34, 41, 50, 53], .055, .7), (42.5, 50, [38, 45, 50, 57, 62, 64], .07, 1.3), (48, 60, [38, 45, 50, 54, 57, 62], .06, .9)]:
    x = pad(notes, t0, t1, amp, br); s = int(t0 * SR); x = x[:N - s]; P[s:s + len(x)] += x
P = stereo(verb(P, 4.0, .45, 3), 2203)
# —— sampled score: low pedals, high harmonics, a sparse piano that grows; the reveal swells; D major on the last words ——
S.seed(42); sc = []
def n(t, inst, p, d, v, pan=0): sc.append((t, inst, p, d, v, pan))
n(0.4, 'contrabass', 'D2', 10.5, .3, 0); n(9.9, 'cellos', 'D3', 14.8, .22, -.2); n(9.9, 'contrabass', 'D2', 14.8, .26, 0); n(24.4, 'cellos', 'C3', 6.6, .24, -.2); n(24.4, 'contrabass', 'C2', 6.6, .26, 0)
n(30.7, 'cellos', 'D3', 6.8, .26, -.2); n(30.7, 'contrabass', 'D2', 6.8, .3, 0); n(37.3, 'cellos', 'Bb2', 5.8, .26, -.2); n(37.3, 'contrabass', 'Bb1', 5.8, .3, 0)
n(43.0, 'cellos', 'D3', 5.8, .32, -.2); n(43.0, 'contrabass', 'D2', 5.8, .36, 0); n(43.0, 'violins', 'A4', 5.6, .2, .3); n(44.6, 'violins', 'D5', 4.0, .22, .3); n(46.2, 'violins', 'F5', 2.6, .22, .3)
n(48.5, 'cellos', 'D3', 11, .26, -.2); n(48.5, 'contrabass', 'D2', 11, .28, 0); n(56.3, 'violins', 'F#5', 3.4, .22, .3); n(56.3, 'violins', 'A4', 3.4, .18, .2); n(56.3, 'cellos', 'A3', 3.4, .2, -.2)
for t0, p in [(1.4, 'A5'), (3.2, 'D6'), (6.0, 'E5'), (8.4, 'A5')]: n(t0, 'violins', p, 2.4, .08, .4)   # faint high glints
piano = [(4.2, 'D5'), (6.4, 'A4'), (11.0, 'F5'), (12.4, 'E5'), (14.2, 'A4'), (17.2, 'D5'), (19.6, 'C5'), (21.4, 'A4'), (25.0, 'G4'), (26.6, 'C5'), (28.4, 'E5'),
         (31.6, 'D5'), (32.4, 'F5'), (33.2, 'A5'), (34.8, 'D6'), (38.0, 'Bb4'), (39.4, 'F5'), (41.0, 'D5'), (43.2, 'A4'), (43.9, 'D5'), (44.6, 'F5'), (45.3, 'A5'), (46.5, 'D6'), (47.6, 'F6'),
         (49.6, 'A5'), (51.2, 'F5'), (53.0, 'D5'), (54.6, 'A4'), (56.3, 'D4'), (56.32, 'F#4'), (56.34, 'A4'), (56.36, 'D5'), (57.8, 'F#5'), (58.6, 'A5')]
for t0, p in piano: n(t0, 'piano', p, 2.6, .26 if t0 < 43 else .3, -.15)
mus = S.render(sc, dur=DUR); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = verb(mus[:, 0], 3.2, .35, 5)[:, None] * [1, 0] + verb(mus[:, 1], 3.2, .35, 6)[:, None] * [0, 1]
mus = mus / (np.abs(mus).max() + 1e-9) + P / (np.abs(P).max() + 1e-9) * .55
sub = np.sin(2 * np.pi * hz(26) * tt) * curve([(0, 0), (2, .05), (30.7, .06), (43.0, .09), (48.5, .06), (58.5, .05), (DUR, 0)])   # deep, controlled bass (D1)
mus += stereo(lp(sub, 80), 0)
mus *= curve([(0, 0), (1.2, .7), (9.9, .8), (30.7, .85), (43.0, 1.0), (48.0, 1.05), (48.6, .8), (56.3, .95), (59.0, .8), (DUR, 0)])[:, None]
fx = bus()
def shimmer(d=2.4, f0=2400, seed=1):
    r = np.random.default_rng(seed); t = t_(d); x = sum(np.sin(2 * np.pi * (f0 * k + r.uniform(-20, 20)) * t + r.uniform(0, 6)) / k for k in (1, 1.5, 2.01, 3.03)) * np.exp(-t / (d * .35)) * np.minimum(1, t / .04)
    return verb(x, 3.5, .55, seed)
def boom(d=3.0, f=38): t = t_(d); return lp(np.sin(2 * np.pi * f * t * (1 - .15 * t / d)) * np.exp(-t / .9) + lp(noise(d), 200) * np.exp(-t / .4) * .3, 160)
def whoosh2(d=1.6): t = t_(d); return bp(noise(d), 300, 4000) * np.sin(np.pi * t / d) ** 2
for k, e in enumerate(ev('first_star')): put(fx, shimmer(3.0, 1760, 1), e['t'], .05, 0)
for e in ev('title') + ev('title2') + ev('final'): put(fx, shimmer(2.6, 1320, 2), e['t'], .035, -.2)
for e in ev('figure'): put(fx, shimmer(2.0, 2640, 3), e['t'], .02, .2)
for i, e in enumerate(ev('star_mark') + ev('shell')): put(fx, shimmer(1.8, [1760, 1980, 2200, 2640][i % 4], 10 + i), e['t'], .022, -.4 + i * .1)
for e in ev('transition'): put(fx, verb(whoosh2(1.6), 2.5, .4, 4), e['t'] - .8, .03, 0); put(fx, boom(2.4, 44), e['t'], .12, 0)
for e in ev('dive'): put(fx, verb(whoosh2(2.4), 2.5, .4, 7), e['t'] - .2, .06, 0); put(fx, boom(3.0, 36), e['t'] + .2, .18, 0)
for e in ev('reveal'): put(fx, boom(4.0, 32), e['t'], .24, 0); put(fx, shimmer(4.0, 880, 8), e['t'] + .2, .05, 0)
# the beam: a soft rising tone for its whole flight, a chime when it reaches Earth; the photons: a short airy swish
b0, b1 = ev('beam_start')[0]['t'], ev('beam_arrive')[0]['t']; d = b1 - b0; t = t_(d); f = 220 * 2 ** (t / d * 1.0)
put(fx, verb(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** .8 * .5 + bp(noise(d), 2000, 6000) * .05, 2.5, .4, 9), b0, .05, -.3)
put(fx, shimmer(3.0, 1568, 11), b1, .06, .3)
for e in ev('photon'): put(fx, verb(bp(noise(3.6), 1500, 6000) * np.sin(np.pi * t_(3.6) / 3.6) ** 2, 2, .4, 12), e['t'], .025, 0)
for e in ev('swell'): d = 3.0; t = t_(d); put(fx, verb(lp(noise(d), 400) * np.sin(np.pi * t / d) ** 2, 3, .5, 13), e['t'], .06, -.2)
for e in ev('particles'): d = 1.4; tt2 = t_(d); [put(fx, shimmer(1.2, 2600 - k * 260, 20 + k), e['t'] + k * .12, .012, -.5 + k * .1) for k in range(8)]
# —— narration ——
vo = bus(); env = np.zeros(N)
for e in ev('line'):
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav')); x = resample_poly(x if x.ndim == 1 else x.mean(1), SR, sr)
    x = compress(norm(hp(x, 60)) * .9, .26, 3); x = verb(lp(x, 9000), 1.4, .12, 21)
    put(vo, x, e['t'], .85, 0); s = int(e['t'] * SR); env[s:s + len(x)] = 1
k = int(.35 * SR); duck = 1 - .42 * np.convolve(env, np.ones(k) / k, 'same')
mix = vo + (mus * .26 + amb + fx) * duck[:, None]
f = int(.4 * SR); mix[:f] *= np.linspace(0, 1, f)[:, None]; g = int(.6 * SR); mix[-g:] *= np.linspace(1, 0, g)[:, None]
mix = np.stack([limit(mix[:, 0], .92), limit(mix[:, 1], .92)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
seg_db = lambda a, b, x: round(20 * np.log10(np.sqrt((x[int(a * SR):int(b * SR)] ** 2).mean()) + 1e-9), 1)
print('mix.wav', round(N / SR, 3), 'peak', round(float(np.abs(mix).max()), 3), '| speech v05', seg_db(18, 24, mix.mean(1)), '| music-only 0-1.2', seg_db(.3, 1.2, mix.mean(1)), '| reveal music 47.8-48.6', seg_db(48.3, 48.7, mix.mean(1)))
