# "समुद्र नीला क्यों है?" 10 s test — mix: Kokoro Hindi narration + gentle acoustic score (sampled harp, flute, cellos; CC0)
# + sea, wind, brush-on-paper, distant ship horn, gulls, deck creak → out/mix.wav. Timed from events.json.
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
    if s >= N: return
    x = x[:N - s]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    b[s:s + len(x), 0] += x * g * l * 1.414; b[s:s + len(x), 1] += x * g * r * 1.414
def verb(x, rt=1.2, mix=.25, seed=1):
    n = int(rt * SR); ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR / (rt / 6.9))
    return x * (1 - mix) + np.convolve(x, ir)[:len(x)] / np.sqrt(n) * 2.5 * mix
WIPE = 6.5
# —— sea: low swell + surf hiss breathing every ~4 s; closer and brighter on deck ——
swell = lp(brown(DUR), 220) * (.6 + .4 * np.sin(2 * np.pi * .23 * tt))
hiss = bp(noise(DUR), 700, 5200) * (.35 + .65 * np.clip(np.sin(2 * np.pi * .27 * tt + 1), 0, 1) ** 2)
sea = swell * curve([(0, 0), (.3, .5), (WIPE, .7), (7.2, .95), (DUR, .95)]) + hiss * curve([(0, 0), (.6, .04), (WIPE, .09), (7.2, .2), (DUR, .2)])
wind = bp(noise(DUR), 180, 900) * (.6 + .4 * np.sin(2 * np.pi * .4 * tt)) * curve([(0, .05), (WIPE, .08), (7.2, .22), (DUR, .22)])
amb = np.stack([sea + wind, np.roll(sea, 4001) + np.roll(wind, 7001)], 1) * .5
fx = bus()
for e in ev('brush'):   # brush on paper: band-passed noise with a light tremolo, sweeping across
    d = e['d']; t = t_(d); x = bp(noise(d), 1500, 6500) * (1 + .5 * np.sin(2 * np.pi * 11 * t)) * np.sin(np.pi * t / d) ** .7
    h = len(x) // 2; put(fx, x[:h], e['t'], .05, -.5); put(fx, x[h:], e['t'] + d / 2, .05, .4)
for e in ev('horn'):    # a distant steam horn, two reeds, softened by air
    d = 1.9; t = t_(d); x = sum(np.sin(2 * np.pi * f * k * t) / k for f in (146.8, 185) for k in (1, 2, 3, 4)); x *= np.minimum(1, t / .15) * np.minimum(1, (d - t) / .5)
    put(fx, verb(lp(x, 900), 2.2, .45, 4), e['t'], .035, .25)
for i, e in enumerate(ev('gull')):
    for k, t0 in enumerate((0, .28, .52)):
        d = .22; t = t_(d); f = 2600 - 900 * t / d + 120 * np.sin(2 * np.pi * 28 * t); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
        put(fx, verb(x, 1.5, .4, 5 + k), e['t'] + t0, .02, .5 - i * .5)
for e in ev('creak'):
    d = .5; t = t_(d); ph = np.cumsum(90 + 40 * np.sin(np.pi * t / d)) / SR * 2 * np.pi; x = np.sign(np.sin(ph)) * np.abs(np.sin(2 * np.pi * 17 * t)) ** 3 * np.sin(np.pi * t / d)
    put(fx, bp(x, 200, 1800), e['t'], .05, -.3)
# —— score: D drone on cellos, harp figure, a flute phrase that answers the narration ——
S.seed(21)
evs = [(0.2, 'cellos', 38, 9.6, .35, -.2), (0.2, 'cellos', 45, 9.6, .3, .2)]
for k, (t0, p) in enumerate([(0.3, 62), (0.9, 69), (1.5, 74), (2.4, 66), (3.0, 69), (3.6, 76), (4.5, 62), (5.1, 67), (5.7, 71), (6.6, 62), (7.2, 69), (7.8, 74), (8.4, 78), (9.0, 81)]): evs.append((t0, 'harp', p, 2.2, .5, -.3 + (k % 3) * .3))
for t0, p, d in [(7.3, 74, 1.0), (8.3, 78, .7), (9.0, 76, 1.0)]: evs.append((t0, 'flute', p, d, .45, .25))
mus = S.render(evs, dur=DUR); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = mus / (np.abs(mus).max() + 1e-9)
# —— narration ——
vo = bus(); env = np.zeros(N)
for e in ev('line'):
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav')); x = resample_poly(x if x.ndim == 1 else x.mean(1), SR, sr)
    x = compress(norm(hp(x, 70)) * .9, .28, 3); x = verb(x, .5, .08, 9)
    put(vo, x, e['t'], .8); s = int(e['t'] * SR); env[s:s + len(x)] = 1
k = int(.25 * SR); duck = 1 - .45 * np.convolve(env, np.ones(k) / k, 'same')     # music and sea dip under the voice
mix = vo + (mus * .2 + amb + fx) * duck[:, None]
f = int(.05 * SR); mix[:f] *= np.linspace(0, 1, f)[:, None]; g = int(.5 * SR); mix[-g:] *= np.linspace(1, 0, g)[:, None]
mix = np.stack([limit(mix[:, 0], .92), limit(mix[:, 1], .92)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', N / SR, 'peak', round(float(np.abs(mix).max()), 3))
