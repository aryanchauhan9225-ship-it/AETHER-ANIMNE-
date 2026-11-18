# THE LAST TRAIN — soundtrack: Hindi narration (Kokoro hm_omega; one English line) + an original suspense score (VSCO 2 CE strings/contrabass,
# Salamander piano, synth drone) + synthesized foley timed to the picture's events. → out/mix.wav
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
    x = x[:N - s]
    if x.ndim == 2: b[s:s + len(x)] += x * g; return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    b[s:s + len(x), 0] += x * g * l * 1.414; b[s:s + len(x), 1] += x * g * r * 1.414
def verb(x, rt=2.2, mix=.3, seed=1):
    n = int(rt * SR); ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR / (rt / 6.9))
    return x * (1 - mix) + np.convolve(x, ir)[:len(x)] / np.sqrt(n) * 2.5 * mix
def addl(*xs): n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)
def stereo(x, d=3001): return np.stack([x, np.roll(x, d)], 1)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
rng = np.random.default_rng(7)
# —— places ——
ST = curve([(0, 1), (22.3, 1), (22.6, 0), (56.4, 0), (56.7, 1), (DUR, 1)]); IN = 1 - ST
wind = bp(noise(DUR), 150, 900) * (.55 + .45 * np.sin(2 * np.pi * .08 * tt + 1)) + bp(noise(DUR), 1200, 3200) * .1 * (.5 + .5 * np.sin(2 * np.pi * .19 * tt))
hum = lp(brown(DUR), 120) * .4 + np.sin(2 * np.pi * 50 * tt) * .006
coach = lp(brown(DUR), 160) * .35 * curve([(0, 1), (34.0, 1), (34.05, .25), (56, .25)])
amb = stereo((wind * .08 + hum * .3) * ST + coach * IN, 4001) * curve([(0, 0), (.6, 1), (DUR - 1.4, 1), (DUR, 0)])[:, None]
fx = bus()
# —— the train ——
a0, stop = one('light_far'), one('stop'); d = stop - a0 + 1.0; t = t_(d); k = t / d
rb = brown(d); rumble = (lp(rb, 90) * (1 - k) + lp(rb, 360) * k) * np.minimum(1, k * 1.4) ** 2 * (1 - .5 * np.maximum(0, k - .85) / .15)
put(fx, stereo(rumble, 211), a0, .55)
t0 = 13.0
while t0 < stop:   # wheel joints: fast while passing, slowing into the stop
    u = (t0 - 13.0) / (stop - 13.0); gap = .22 + .9 * u ** 2
    for dd in (0, .085): put(fx, verb(lp(addl(click(.6, 1), thump(.6, 120) * .5), 2500), .6, .2, 3), t0 + dd, .09 * (1 - .4 * u), .2 * np.sin(t0))
    t0 += gap
def horn(dur, g):
    tt2 = t_(dur); x = sum(np.sin(2 * np.pi * f * h * tt2) / h for f in (233, 293) for h in (1, 2, 3)); x *= np.minimum(1, tt2 / .12) * np.minimum(1, (dur - tt2) / .4); return verb(lp(x, 1600), 3.0, .5, 5) * g
put(fx, horn(1.8, .25), one('horn_far'), .2, -.3); put(fx, horn(1.4, .6), one('horn'), .35, -.1)
br = one('brake'); d = stop - br + .3; tq = t_(d); sq = (np.sin(2 * np.pi * (2400 + 300 * np.sin(2 * np.pi * 3 * tq)) * tq) * .5 + bp(noise(d), 2500, 6000)) * np.sin(np.pi * np.minimum(1, tq / d)) ** .5
put(fx, sq, br, .05, .2); put(fx, verb(bp(noise(1.6), 800, 6000) * np.exp(-t_(1.6) / .5), 1.5, .3, 6), stop + .1, .1, 0)   # the air-brake hiss
put(fx, verb(addl(bp(noise(.9), 300, 2000) * np.sin(np.pi * t_(.9) / .9), lp(thump(.6, 70), 300) * .3), 1.2, .3, 7), one('door'), .1, .1)
# —— footsteps ——
for e in ev('step'):
    s = e['surf']
    x = addl(bp(noise(.14), 500, 4000) * env_exp(.14, .025), lp(thump(.55, 90), 600) * .5) if s == 'platform' else verb(addl(lp(thump(.6, 110), 900), bp(noise(.12), 300, 2500) * env_exp(.12, .03) * .4), .9, .3, 8)
    if s == 'metal': x = addl(x, np.sin(2 * np.pi * 620 * t_(.25)) * env_exp(.25, .05) * .2)
    put(fx, x, e['t'], .1, rng.uniform(-.15, .15))
# —— the clock: ticks, loud in the close-ups, quiet otherwise; inside the coach once it's in his hands ——
tick_k = curve([(0, .15), (3.9, .15), (4.0, .9), (7.6, .9), (7.7, .15), (22.5, .3), (28.3, .3), (28.4, 1.0), (32.6, .8), (34.0, .8), (36.4, 1.0), (56.0, .7), (56.6, .25), (62.7, .25), (62.8, 1.0), (65.2, 1.0), (65.4, .3), (DUR, .2)])
for s in np.arange(.5, DUR - .5, 1.0):
    x = hp(addl(click(1.8, .8), click(2.4, .4)), 1200); put(fx, x, s, .05 * tick_k[int(s * SR)], .1)
mn = one('minute'); put(fx, verb(addl(clack(.5), lp(thump(.7, 130), 900) * .6), 1.6, .35, 9), mn, .32, 0)
# —— light and electricity ——
put(fx, verb(addl(lp(thump(.9, 55), 300), clack(.4) * .5), 2.2, .35, 10), one('lights_off'), .4, 0)
fb = one('flicker_on'); for_ = None
for kk in range(7): put(fx, bp(noise(.06), 800, 4000) * env_exp(.06, .02) + np.sin(2 * np.pi * 100 * t_(.06)) * .3, fb + kk * .12 + rng.uniform(0, .04), .08, .2)
put(fx, stereo(np.sin(2 * np.pi * 100 * tt) * .02 * curve([(0, 0), (fb, 0), (fb + .9, 1), (55.8, 1), (56.0, 0), (DUR, 0)]), 0), 0, 1)
f0, f1 = ev('flicker_fast')[0]['t'], ev('flicker_fast')[0]['t'] + ev('flicker_fast')[0]['d']
for s in np.arange(f0, f1, .07): put(fx, bp(noise(.05), 1000, 6000) * env_exp(.05, .015), s + rng.uniform(0, .03), .06 * rng.uniform(.4, 1), rng.uniform(-.5, .5))
# —— the message written in the condensation: a fingertip squeak ——
w0 = ev('write')[0]['t']; wd = ev('write')[0]['d']; tq = t_(wd)
squeak = np.sin(2 * np.pi * (900 + 400 * np.sin(2 * np.pi * 1.7 * tq) + 160 * np.sin(2 * np.pi * 9 * tq)) * tq) * (np.sin(2 * np.pi * 2.6 * tq) > -.3) * .5
put(fx, verb(bp(squeak + bp(noise(wd), 1500, 5000) * .3, 700, 4000), 1.4, .3, 11), w0, .045, .2)
# —— impacts, stings, the vanishing, the end ——
def impact(d=3.0, f=40): t = t_(d); return lp(np.sin(2 * np.pi * f * t * (1 - .2 * t / d)) * np.exp(-t / .8) + lp(noise(d), 300) * np.exp(-t / .25) * .5, 240)
for k_, g_ in [('sting', .26), ('impact', .36), ('vanish', .42), ('title', .3)]: put(fx, verb(impact(3.4, 38), 2.8, .4, 12), one(k_), g_, 0)
v = one('vanish'); d = 3.6; tq = t_(d); put(fx, verb(bp(noise(d), 200, 3000) * (1 - tq / d) ** 2 * np.minimum(1, tq / .2), 3.5, .5, 13), v + .1, .16, 0)   # the train swallowed by the fog
put(fx, verb(horn(2.6, .35), 4.0, .7, 14), v + .6, .12, .4)                                                              # a last horn, far off
# —— score: a low drone and strings that tighten; piano notes in the coach; a deep swell at the twist; a quiet resolve under the title ——
def drone(nt, a, b, amp, br=1.):
    d = b - a; t = t_(d); x = sum(np.sin(2 * np.pi * hz(m + dt) * t + dt * 9) for m in nt for dt in (-.06, 0, .05)); return lp(x, 500 + 900 * br) * np.minimum(1, t / 2.5) * np.minimum(1, (d - t) / 2) * amp
P = np.zeros(N)
for a, b, nt, amp, br in [(0, 12, [33, 40, 45], .03, .4), (10, 22.5, [33, 40, 45, 48], .035, .6), (22, 34.2, [36, 43, 48, 51], .03, .5), (36, 46, [34, 41, 46, 49], .04, .8), (45, 56.2, [33, 40, 45, 46, 52], .05, 1.2), (56.5, 66, [33, 40, 45], .03, .5), (65, DUR, [33, 40, 45, 49, 52], .035, .7)]:
    x = drone(nt, a, b, amp, br); s = int(a * SR); x = x[:N - s]; P[s:s + len(x)] += x
P = stereo(verb(P, 3.2, .4, 15), 2203)
S.seed(31); sc = []
def n(t, inst, p, d, v, pan=0): sc.append((t, inst, p, d, v, pan))
n(.4, 'contrabass', 'A1', 11, .3); n(10.3, 'cellos', 'A2', 8.5, .24, -.2); n(10.3, 'contrabass', 'A1', 8.5, .32)
for t0, p in [(1.5, 'E5'), (4.2, 'C5'), (7.0, 'A4'), (23.2, 'E5'), (25.0, 'F5'), (26.8, 'E5'), (28.6, 'C6'), (30.4, 'B5'), (32.0, 'E5')]: n(t0, 'piano', p, 2.6, .24, -.1)
n(36.4, 'violins_trem', 'A4', 7.5, .14, .3); n(39.4, 'violins_trem', 'Bb4', 6.0, .16, -.3); n(44.0, 'cellos', 'Bb2', 12.0, .24, -.2); n(44.0, 'contrabass', 'Bb1', 12.0, .3)
n(46.0, 'violins_trem', 'E5', 6.0, .18, .3); n(48.5, 'violins_trem', 'F5', 3.8, .2, -.3); n(51.4, 'violins', 'Bb5', 4.5, .22, 0)
for t0, p in [(57.2, 'A4'), (59.6, 'C5'), (62.0, 'E5'), (63.8, 'A5'), (66.4, 'A3'), (66.43, 'C4'), (66.46, 'E4'), (66.5, 'A4'), (68.2, 'E5'), (69.4, 'C5')]: n(t0, 'piano', p, 3.0, .26, -.1)
n(66.4, 'cellos', 'A2', 5.2, .22, -.2); n(66.4, 'violins', 'E5', 5.2, .14, .3)
mus = S.render(sc, dur=DUR); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = np.stack([verb(mus[:, 0], 2.6, .3, 16), verb(mus[:, 1], 2.6, .3, 17)], 1)
mus = mus / (np.abs(mus).max() + 1e-9) + P / (np.abs(P).max() + 1e-9) * .55
mus += stereo(lp(np.sin(2 * np.pi * 27.5 * tt), 60) * curve([(0, .03), (34, .04), (44, .06), (55.8, .1), (56.1, .02), (DUR, .03)]), 0)
mus *= curve([(0, 0), (.8, .7), (34, .8), (34.05, .45), (36.4, .7), (46, .9), (55.8, 1.15), (56.05, .35), (58, .7), (66.4, .9), (DUR - 1.2, .8), (DUR, 0)])[:, None]
# —— narration ——
vo = bus(); env = np.zeros(N)
for e in ev('line'):
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav')); x = resample_poly(x if x.ndim == 1 else x.mean(1), SR, sr)
    x = verb(compress(norm(hp(x, 65)) * .9, .26, 3), 1.0, .1, 21); put(vo, x, e['t'], .86); s = int(e['t'] * SR); env[s:s + len(x)] = 1
k = int(.35 * SR); duck = 1 - .45 * np.convolve(env, np.ones(k) / k, 'same')
mix = vo + (mus * .22 + amb + fx) * duck[:, None]
f = int(.6 * SR); mix[:f] *= np.linspace(0, 1, f)[:, None]; gq = int(1.4 * SR); mix[-gq:] *= np.linspace(1, 0, gq)[:, None]
mix = np.stack([limit(mix[:, 0], .92), limit(mix[:, 1], .92)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
db = lambda a, b: round(20 * np.log10(np.sqrt((mix[int(a * SR):int(b * SR)].mean(1) ** 2).mean()) + 1e-9), 1)
print('mix.wav', round(N / SR, 2), 'peak', round(float(np.abs(mix).max()), 3), '| speech n7', db(38, 42.5), '| train arrival 15-18.5', db(15, 18.5), '| twist music 52-55.8', db(52.8, 55.8))
