# WHY DOES THE MOON FOLLOW YOU? — soundtrack: Hindi narration (Kokoro hm_omega) + original score (VSCO 2 CE strings/contrabass, Salamander piano, synth pad + sub)
# + night foley (wind, crickets, footsteps on asphalt/gravel), cinematic impacts, a cloud whoosh, a sub swell for the science, chimes. → out/mix.wav
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
def verb(x, rt=2.5, mix=.35, seed=1):
    n = int(rt * SR); ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR / (rt / 6.9))
    return x * (1 - mix) + np.convolve(x, ir)[:len(x)] / np.sqrt(n) * 2.5 * mix
def addl(*xs): n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)
def stereo(x, d=3001): return np.stack([x, np.roll(x, d)], 1)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
rng = np.random.default_rng(3)
# —— places: outdoors at night (0–19.6, 31.4–60), the climb through cloud, space (21–31.4: no air) ——
OUT = curve([(0, 1), (19.4, 1), (21.0, 0), (31.2, 0), (31.6, 1), (DUR, 1)])
wind = bp(noise(DUR), 160, 800) * (.55 + .45 * np.sin(2 * np.pi * .09 * tt + 1)) + bp(noise(DUR), 900, 2400) * .12 * (.5 + .5 * np.sin(2 * np.pi * .23 * tt))
crick = np.zeros(N)
for k in range(5):   # crickets: pulsed narrow tones, each its own rate, far off
    f0 = 4300 + k * 380; rate = 15 + k * 3.1; ph = rng.uniform(0, 6); chirp = (np.sin(2 * np.pi * rate * tt + ph) > .55).astype(float) * (np.sin(2 * np.pi * .45 * tt + k) > -.2)
    crick += np.sin(2 * np.pi * f0 * tt) * lp(chirp, 300) * .5
amb = stereo((wind * .09 + lp(brown(DUR), 220) * .25 + crick * .006) * OUT, 5003)
space_air = stereo(lp(brown(DUR), 90) * .3 * (1 - OUT), 4001)
amb = (amb + space_air) * curve([(0, 0), (.4, 1), (DUR - .8, 1), (DUR, .4)])[:, None]
# —— score: a midnight pad (D minor), low pedals, sparse piano; the science gets a slow pulse; the ending resolves to D major ——
def pad(notes, t0, t1, amp, br=1.):
    d = t1 - t0; t = t_(d); x = np.zeros(len(t))
    for m in notes:
        for det in (-.08, 0, .07): x += np.sin(2 * np.pi * hz(m + det) * t + det * 11) / (1 + (m - 48) * .03)
    return lp(x, 700 + 1200 * br) * np.minimum(1, t / 2.5) * np.minimum(1, (d - t) / 2.5) * amp
P = np.zeros(N)
for t0, t1, nt, amp, br in [(0, 8, [38, 45, 50, 53], .05, .5), (6.5, 18, [38, 45, 52, 57], .05, .7), (16.5, 26, [34, 41, 50, 53, 58], .055, .9), (24.5, 33, [38, 45, 50, 57, 62], .055, 1.1),
                            (31, 43, [36, 43, 50, 55], .05, .9), (41.5, 54, [38, 45, 50, 57, 60], .055, 1.0), (52.5, 60, [38, 45, 50, 54, 57, 62], .06, 1.0)]:
    x = pad(nt, t0, t1, amp, br); s = int(t0 * SR); x = x[:N - s]; P[s:s + len(x)] += x
P = stereo(verb(P, 3.5, .4, 7), 2203)
S.seed(8); sc = []
def n(t, inst, p, d, v, pan=0): sc.append((t, inst, p, d, v, pan))
for t0, d, root in [(0.2, 7.0, 'D2'), (7.0, 10.0, 'D2'), (17.0, 8.2, 'Bb1'), (25.0, 6.6, 'D2'), (31.4, 10.8, 'C2'), (42.0, 11.2, 'D2'), (53.0, 7.0, 'D2')]:
    n(t0, 'contrabass', root, d, .3, 0); n(t0, 'cellos', root.replace('1', '2').replace('2', '3') if root.endswith('2') else 'Bb2', d, .22, -.2)
for t0, p in [(1.2, 'A4'), (3.4, 'D5'), (5.6, 'F5'), (8.0, 'E5'), (10.2, 'A4'), (12.4, 'D5'), (14.6, 'C5'), (17.6, 'Bb4'), (19.4, 'F5'), (21.4, 'D5'), (23.4, 'A5'),
              (25.6, 'D5'), (27.9, 'A5'), (29.2, 'D6'), (32.0, 'C5'), (33.6, 'G5'), (35.2, 'E5'), (36.8, 'C6'), (38.8, 'G5'), (42.6, 'D5'), (44.4, 'A5'), (46.2, 'F5'), (47.6, 'D6'), (49.6, 'A5'),
              (53.4, 'D4'), (53.43, 'F#4'), (53.46, 'A4'), (53.5, 'D5'), (55.4, 'F#5'), (57.4, 'A5')]: n(t0, 'piano', p, 2.6, .27 if t0 < 53 else .32, -.15)
for t0, p, d in [(25.0, 'A4', 6.0), (29.0, 'D5', 2.4), (42.0, 'A4', 5.4), (47.4, 'D5', 5.6), (53.0, 'F#5', 6.5), (53.0, 'A4', 6.5)]: n(t0, 'violins', p, d, .17, .3)
for k in range(28): n(31.6 + k * .37, 'violins_pizz' if 'violins_pizz' in S.instruments('strings') else 'harp', ['D4', 'A4', 'F4', 'A4'][k % 4], .5, .2, -.3)   # the science pulse
mus = S.render(sc, dur=DUR); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = np.stack([verb(mus[:, 0], 2.8, .3, 5), verb(mus[:, 1], 2.8, .3, 6)], 1)
mus = mus / (np.abs(mus).max() + 1e-9) + P / (np.abs(P).max() + 1e-9) * .5
mus += stereo(lp(np.sin(2 * np.pi * hz(26) * tt), 70) * curve([(0, 0), (2, .04), (25, .05), (31.4, .09), (42, .07), (53, .05), (DUR, 0)]), 0)   # deep D1 under everything; swells for the science
mus *= curve([(0, 0), (.6, .75), (17, .85), (25, .95), (31.4, 1.0), (42, .95), (53, 1.05), (59.2, .95), (DUR, .3)])[:, None]
fx = bus()
def impact(d=2.6, f=42): t = t_(d); return lp(np.sin(2 * np.pi * f * t * (1 - .2 * t / d)) * np.exp(-t / .7) + lp(noise(d), 300) * np.exp(-t / .25) * .4, 220)
def chime(f=1760, d=2.2, seed=1): t = t_(d); r = np.random.default_rng(seed); return verb(sum(np.sin(2 * np.pi * f * k * t + r.uniform(0, 6)) / k ** 1.5 for k in (1, 2.01, 3.02)) * np.exp(-t / .5) * np.minimum(1, t / .005), 2.5, .45, seed)
for e in ev('step'):
    if e.get('g', 1) <= 0: continue
    if e['surf'] == 'gravel': x = addl(bp(noise(.2), 800, 6000) * env_exp(.2, .04), lp(thump(.4, 90), 400) * .3)
    else: x = addl(bp(noise(.12), 400, 3500) * env_exp(.12, .02), lp(thump(.5, 80), 500) * .45)
    put(fx, x, e['t'], .08 * (.85 + .3 * rng.random()), rng.uniform(-.15, .15))
for e in ev('cut'): put(fx, verb(impact(2.4, 46), 2.0, .3, 2), e['t'], .14, 0)
for e in ev('title') + ev('final'): put(fx, verb(impact(3.0, 38), 3.0, .4, 3), e['t'], .2, 0); put(fx, chime(1318, 3.0, 4), e['t'] + .1, .03, .2)
for e in ev('mark') + ev('moon_mark'): put(fx, chime(1760, 2.4, 5), e['t'], .035, .3)
for e in ev('why'): put(fx, verb(impact(3.2, 34), 3.0, .4, 6), e['t'], .22, 0)
for e in ev('cloud'): d = 2.6; t = t_(d); put(fx, verb(bp(noise(d), 300, 5000) * (t / d) ** 2 * np.sin(np.pi * np.minimum(1, t / d * 1.1)) ** .5, 2.5, .4, 7), e['t'], .09, 0)
for e in ev('space'): put(fx, verb(impact(4.0, 30), 3.5, .5, 8), e['t'], .2, 0)
for e in ev('line_draw'): d = 2.6; t = t_(d); put(fx, verb(np.sin(2 * np.pi * np.cumsum(330 * 2 ** (t / d)) / SR) * np.sin(np.pi * t / d) * .4, 2.5, .4, 9), e['t'], .04, 0)
for e in ev('number') + ev('value'): put(fx, verb(impact(2.6, 44), 2.4, .35, 10), e['t'], .14, 0); put(fx, chime(2093, 2.0, 11), e['t'] + .05, .025, -.2)
for e in ev('ghost'): put(fx, chime(1568 * 2 ** (e['i'] / 30), .9, 20 + e['i']), e['t'], .008, -.5 + e['i'] / 30)
for e in ev('reveal'): d = 10.0; t = t_(d); put(fx, lp(np.sin(2 * np.pi * 36 * t) * np.sin(np.pi * t / d) ** 2, 120), e['t'], .18, 0)   # soft low-frequency bed under the science
for e in ev('moon_lines') + ev('near'): put(fx, chime(1175, 1.8, 12), e['t'], .025, .2)
for e in ev('brand'): put(fx, chime(880, 3.0, 13), e['t'], .03, 0)
# —— narration ——
vo = bus(); env = np.zeros(N)
for e in ev('line'):
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav')); x = resample_poly(x if x.ndim == 1 else x.mean(1), SR, sr)
    x = verb(compress(norm(hp(x, 65)) * .9, .26, 3), 1.0, .1, 21); put(vo, x, e['t'], .86, 0); s = int(e['t'] * SR); env[s:s + len(x)] = 1
k = int(.35 * SR); duck = 1 - .45 * np.convolve(env, np.ones(k) / k, 'same')
mix = vo + (mus * .24 + amb + fx) * duck[:, None]
f = int(.3 * SR); mix[:f] *= np.linspace(0, 1, f)[:, None]; gq = int(.5 * SR); mix[-gq:] *= np.linspace(1, .2, gq)[:, None]
mix = np.stack([limit(mix[:, 0], .92), limit(mix[:, 1], .92)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
db = lambda a, b: round(20 * np.log10(np.sqrt((mix[int(a * SR):int(b * SR)].mean(1) ** 2).mean()) + 1e-9), 1)
print('mix.wav', round(N / SR, 2), 'peak', round(float(np.abs(mix).max()), 3), '| speech m7', db(32.5, 40), '| music-only 23.5-25.4', db(23.5, 25.4), '| opening 0.1-0.6', db(.1, .6))
