# आखिरी रोशनी — 60 s mix: Kokoro Hindi narration (11 lines) + night sea + wind + a restrained suspense score
# (sampled cellos / tremolo violins / harp, CC0) + synthesized foley (steps, door, lamp, camera) → out/mix.wav. Timed from events.json.
import sys, os, json, numpy as np, soundfile as sf
from scipy.signal import resample_poly
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ['LIB']
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import *
import sampler as S
E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR); tt = np.arange(N) / SR
ev = lambda k: [e for e in E['ev'] if e['type'] == k]
one = lambda k: ev(k)[0]['t']
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
def add(*xs):
    n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)
def stereo(x, d=5003): return np.stack([x, np.roll(x, d)], 1)
# —— where we are: outdoors (sea + wind full), at the door (closer, wind), indoors (muffled through stone), black ——
OUT = curve([(0, 1), (38.6, 1), (39.4, 0), (DUR, 0)]); IN = 1 - OUT
BLK = curve([(0, 1), (56.6, 1), (57.0, 0), (DUR, 0)])
swell = lp(brown(DUR), 180) * (.6 + .4 * np.sin(2 * np.pi * .2 * tt))
surf = bp(noise(DUR), 500, 4500) * np.clip(.5 + .5 * np.sin(1.05 * tt - 1.2), 0, 1) ** 3
wind = bp(noise(DUR), 150, 700) * (.55 + .45 * np.sin(2 * np.pi * .13 * tt + 1)) + bp(noise(DUR), 700, 1500) * .15 * (.5 + .5 * np.sin(2 * np.pi * .31 * tt))
gust = bp(noise(DUR), 300, 2400) * np.clip(np.sin(2 * np.pi * .07 * tt), 0, 1) ** 4    # storm gusts, strongest in S1/S4
sea_out = swell * .7 + surf * curve([(0, .16), (12, .16), (18, .1), (25, .13), (32, .08), (DUR, .08)]) + wind * .2 + gust * curve([(0, .12), (12, .05), (18, .1), (25, .05), (DUR, .03)])
sea_in = lp(swell * .5 + wind * .25, 260) * .9 + bp(noise(DUR), 900, 3000) * .012 * (.5 + .5 * np.sin(2 * np.pi * .21 * tt))   # through stone; a draught whistle
amb = stereo((sea_out * OUT + sea_in * IN) * BLK) * .5
amb *= curve([(0, 0), (.3, .7), (1.5, 1), (DUR, 1)])[:, None]
# —— score: low D drone that never stops (but swells), a minor-second rub as the mystery deepens, tremolo at each light, harp at the title ——
S.seed(9)
L1, L5, FL = one('flash'), one('lamp'), one('flood'); T = one('title')
evs = [(0.4, 'cellos', 38, 12.0, .28, -.2), (11.8, 'cellos', 38, 13.0, .24, -.2), (12.5, 'cellos', 45, 12.0, .18, .2), (24.6, 'cellos', 38, 14.5, .3, -.2),
       (L5 - .3, 'cellos', 39, 7.0, .2, .1), (38.6, 'cellos', 38, 9.0, .22, 0), (39.5, 'cellos', 41, 8.0, .14, .25), (46.0, 'cellos', 38, 10.5, .3, -.1), (49.0, 'cellos', 39, 7.5, .24, .2),
       (L1 - .3, 'violins_trem', 74, 2.4, .16, -.3), (L5 + .4, 'violins_trem', 74, 5.0, .2, -.3), (L5 + 2.2, 'violins_trem', 75, 3.4, .2, .3),
       (one('sil'), 'harp', 75, 2.5, .3, .3), (one('msg'), 'violins_trem', 74, 3.5, .2, -.2), (one('msg') + .4, 'violins_trem', 75, 3.0, .2, .2),
       (FL - .1, 'violins_trem', 74, 2.4, .24, -.3), (FL - .1, 'violins_trem', 81, 2.2, .14, .3),
       (T, 'harp', 38, 3.5, .6, 0), (T, 'harp', 62, 3.5, .4, .2), (T + .35, 'harp', 69, 3.0, .32, -.2), (T + .7, 'harp', 74, 2.6, .28, .2), (one('title') + 1.0, 'cellos', 38, 2.6, .25, 0)]
mus = S.render(evs, dur=DUR); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0))); mus = mus / (np.abs(mus).max() + 1e-9)
mus *= curve([(0, .8), (24, .9), (31, 1.1), (39, .9), (49, 1.1), (56.8, 1.25), (57.0, .9), (DUR, .9)])[:, None]
fx = bus()
# lamp: the far flash in S1 is a soft thud on the wind; the close wake in S5 is a relay clunk + hum that stays while we are outside
put(fx, verb(lp(thump(.7, 55), 300), 2.0, .5, 3), L1, .1)
put(fx, lp(thump(.7, 60), 500), L5, .16); put(fx, click(.5, 1), L5 + .02, .05)
hum = (np.sin(2 * np.pi * 100 * tt) + .4 * np.sin(2 * np.pi * 200 * tt)) * curve([(0, 0), (L5, 0), (L5 + .7, .012), (32, .008), (39, 0), (FL, 0), (FL + .4, .01), (56.9, .01), (56.95, 0), (DUR, 0)]); fx += stereo(hum, 0)
for k in range(8):   # the beam swishing past every 5.2 s once it is on
    t0 = L5 + 1.2 + k * 5.2
    if t0 > 38.5: break
    d = 1.1; tl = t_(d); x = bp(noise(d), 300, 1800) * np.sin(np.pi * tl / d) ** 3; put(fx, x, t0, .05, -.3 + .2 * (k % 4))
# footsteps: grass/gravel on the path (S4), wood boards inside (S7)
rng = np.random.default_rng(4)
for i, e in enumerate(ev('step')):
    if e['surf'] == 'grass': d = .22; tl = t_(d); x = add(bp(noise(d), 600, 4000) * np.exp(-tl / .05), lp(thump(d, 70), 300) * .5); g, pan = .12 * (.85 + .3 * rng.random()), .1 * (-1) ** i
    else: d = .4; tl = t_(d); x = verb(add(lp(thump(d, 90), 900), bp(noise(d), 400, 2500) * np.exp(-tl / .02) * .4), 1.4, .35, 7 + i); g, pan = .14, -.2 + i * .07
    put(fx, x, e['t'], g, pan)
# the door: iron ring, then a long rusty creak while it swings, a soft knock when it stops, and the room's air
H0 = one('handle'); put(fx, clack(.8), H0, .06, .2)
e = ev('creak')[0]; d = e['d']; tl = t_(d)
f = 70 + 55 * np.sin(np.pi * tl / d) + 12 * np.sin(2 * np.pi * 3.1 * tl); ph = np.cumsum(f) / SR * 2 * np.pi
x = np.sign(np.sin(ph)) * (np.abs(np.sin(2 * np.pi * 9 * tl)) ** 2 + .3) * np.sin(np.pi * tl / d) ** .6
put(fx, verb(bp(x, 220, 2600), 1.6, .4, 11), e['t'], .07, -.1); put(fx, verb(lp(thump(.5, 70), 400), 1.5, .4, 12), e['t'] + d, .1)
put(fx, lp(noise(3.0), 400) * np.sin(np.pi * t_(3.0) / 3.0) ** 2, e['t'] + .4, .1)
# camera: a small electronic chirp when the photo comes up; a low shiver of noise as the message types
d = .12; tl = t_(d); put(fx, np.sin(2 * np.pi * 2400 * tl) * np.sin(np.pi * tl / d), one('beep'), .025, .1)
d = 1.0; put(fx, hp(noise(d), 3000) * (np.abs(np.sin(2 * np.pi * 13 * t_(d))) ** 4) * np.sin(np.pi * t_(d) / d), one('msg'), .02, 0)
# the flood of light: a swelling air-rush; then the cut to black is silence (score and room cut together, a short tail)
d = 1.4; tl = t_(d); put(fx, bp(noise(d), 200, 3000) * (tl / d) ** 2 * np.exp(-np.maximum(0, tl - 1.0) / .1), FL - .9, .12)
# brush-wipes: a dry brush stroke on paper under each transition
for e in ev('wipe'):
    d = e['d']; tl = t_(d); x = bp(noise(d), 1500, 6500) * (1 + .5 * np.sin(2 * np.pi * 11 * tl)) * np.sin(np.pi * tl / d) ** .7; put(fx, x, e['t'], .02, 0)
# —— narration ——
vo = bus(); env = np.zeros(N)
for e in ev('line'):
    x, sr = sf.read(os.path.join(HERE, 'voices60', e['id'] + '.wav')); x = resample_poly(x if x.ndim == 1 else x.mean(1), SR, sr)
    if e['id'] == 'm8': x = verb(compress(norm(hp(x, 120)) * .8, .28, 3), 2.4, .45, 21)   # the message: a woman's whisper in a large empty space
    else: x = verb(compress(norm(hp(x, 70)) * .9, .28, 3), .6, .1, 9)
    put(vo, x, e['t'], .8 if e['id'] != 'm8' else .7, 0 if e['id'] != 'm8' else .1); s = int(e['t'] * SR); env[s:s + len(x)] = 1
k = int(.3 * SR); duck = 1 - .45 * np.convolve(env, np.ones(k) / k, 'same')
mix = vo + (mus * .2 + amb + fx) * duck[:, None]
f = int(1.0 * SR); mix[:f] *= (np.linspace(0, 1, f) ** 1.5)[:, None]; g = int(.45 * SR); mix[-g:] *= np.linspace(1, 0, g)[:, None]
mix = np.stack([limit(mix[:, 0], .92), limit(mix[:, 1], .92)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', N / SR, 'peak', round(float(np.abs(mix).max()), 3))
