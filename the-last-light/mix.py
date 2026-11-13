# आखिरी रोशनी 10 s test — mix: Kokoro Hindi narration + night sea + wind + restrained suspense bed → out/mix.wav
# (sampled cellos / tremolo violins / harp, CC0; everything else synthesized). Timed from events.json.
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
def verb(x, rt=1.6, mix=.3, seed=1):
    n = int(rt * SR); ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR / (rt / 6.9))
    return x * (1 - mix) + np.convolve(x, ir)[:len(x)] / np.sqrt(n) * 2.5 * mix
# —— sea: slow swell, waves washing onto rock every ~3.4 s (in step with the surf in the picture), night wind ——
swell = lp(brown(DUR), 180) * (.6 + .4 * np.sin(2 * np.pi * .2 * tt))
surf = bp(noise(DUR), 500, 4500) * np.clip(.5 + .5 * np.sin(1.05 * tt - 1.2), 0, 1) ** 3
wind = bp(noise(DUR), 150, 700) * (.55 + .45 * np.sin(2 * np.pi * .13 * tt + 1)) + bp(noise(DUR), 700, 1500) * .15 * (.5 + .5 * np.sin(2 * np.pi * .31 * tt))
amb = swell * curve([(0, 0), (.4, .55), (DUR, .7)]) + surf * curve([(0, 0), (1.0, .1), (DUR, .16)]) + wind * curve([(0, 0), (1.5, .16), (DUR, .2)])
amb = np.stack([amb, np.roll(amb, 5003)], 1) * .5
# —— suspense bed: low cellos on D with a minor second above entering late; tremolo violins rise once the lamp wakes ——
S.seed(9); LAMP = ev('lamp')[0]['t']
evs = [(0.6, 'cellos', 38, 9.3, .32, -.2), (2.5, 'cellos', 45, 7.4, .22, .2), (LAMP - .2, 'cellos', 39, 4.6, .2, 0),
       (LAMP + .5, 'violins_trem', 74, 4.3, .22, -.3), (LAMP + 2.0, 'violins_trem', 75, 2.8, .2, .3), (ev('title')[0]['t'], 'harp', 38, 1.8, .6, 0), (ev('title')[0]['t'], 'harp', 62, 1.8, .4, .2)]
mus = S.render(evs, dur=DUR); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0))); mus = mus / (np.abs(mus).max() + 1e-9)
fx = bus()
# the lamp: a relay clunk, a faint electrical hum that stays, and a soft air-swish each time a beam swings through us
put(fx, lp(thump(.7, 60), 500), LAMP, .16); put(fx, click(.5, 1), LAMP + .02, .05)
hum = (np.sin(2 * np.pi * 100 * tt) + .4 * np.sin(2 * np.pi * 200 * tt)) * curve([(0, 0), (LAMP, 0), (LAMP + .7, .012), (DUR, .012)]); fx += np.stack([hum, hum], 1)
for e in ev('sweep'):
    d = 1.1; t = t_(d); x = bp(noise(d), 300, 1800) * np.sin(np.pi * t / d) ** 3; put(fx, x, e['t'] - d / 2, .05, 0)
# —— narration ——
vo = bus(); env = np.zeros(N)
for e in ev('line'):
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav')); x = resample_poly(x if x.ndim == 1 else x.mean(1), SR, sr)
    x = verb(compress(norm(hp(x, 70)) * .9, .28, 3), .6, .1, 9); put(vo, x, e['t'], .8); s = int(e['t'] * SR); env[s:s + len(x)] = 1
k = int(.3 * SR); duck = 1 - .4 * np.convolve(env, np.ones(k) / k, 'same')
mix = vo + (mus * .2 + amb + fx) * duck[:, None]
f = int(1.2 * SR); mix[:f] *= (np.linspace(0, 1, f) ** 1.5)[:, None]; g = int(.45 * SR); mix[-g:] *= np.linspace(1, 0, g)[:, None]
mix = np.stack([limit(mix[:, 0], .92), limit(mix[:, 1], .92)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', N / SR, 'peak', round(float(np.abs(mix).max()), 3))
