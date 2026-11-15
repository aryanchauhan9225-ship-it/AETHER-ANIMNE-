# आखिरी चिट्ठी — the mix: Kokoro Hindi voices (narrator, the father's letter, Amma) + an original score from the toolkit's sampled
# instruments (Salamander piano, VSCO flute / strings / harp; a tanpura-like drone from the shamisen physical model's jawari buzz)
# + synthesized foley (steps, the wooden box, paper, knocks, birds, wind, the room's clock). Timed from events.json → out/mix.wav
import sys, os, json, numpy as np, soundfile as sf
from scipy.signal import resample_poly
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ['LIB']
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import *
import sampler as S, pluck as P
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
def addl(*xs): n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)
def stereo(x, d=4003): return np.stack([x, np.roll(x, d)], 1)
rng = np.random.default_rng(5)

# —— places: outdoors (village, lane), close-ups outdoors, the room, the memory, the final world ——
OUT = curve([(0, 1), (16.6, 1), (23.2, 1), (23.6, 0), (68.8, 0), (69.6, 1), (DUR, 1)])
ROOMK = 1 - OUT
MEM = curve([(0, 0), (39.4, 0), (40.4, 1), (49.8, 1), (50.8, 0), (DUR, 0)])
wind = bp(noise(DUR), 180, 900) * (.55 + .45 * np.sin(2 * np.pi * .11 * tt + 1))
village = wind * .07 + lp(brown(DUR), 300) * .25
room = lp(brown(DUR), 200) * .12 + bp(noise(DUR), 2000, 4000) * .004
amb = stereo(village * OUT * (1 - MEM * .7) + room * ROOMK * (1 - MEM)) * curve([(0, 0), (.6, 1), (DUR - 1, 1), (DUR, 0)])[:, None]
fx = bus()
# birds: small chirps in the village, the lane, at the house, in the final world
def chirp(seed):
    r = np.random.default_rng(seed); out = []
    for k in range(r.integers(2, 5)):
        d = r.uniform(.05, .12); t = t_(d); f0 = r.uniform(2600, 4200); f = f0 + r.uniform(-900, 900) * t / d + 300 * np.sin(2 * np.pi * r.uniform(20, 40) * t)
        out.append(np.pad(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2, (0, int(r.uniform(.04, .12) * SR))))
    return np.concatenate(out)
for k, t0 in enumerate(list(np.arange(.6, 16, 1.9)) + list(np.arange(16.8, 23, 1.6)) + list(np.arange(69.4, 74.5, 1.3))):
    put(fx, verb(chirp(k + 1), 1.2, .35, k), t0 + rng.uniform(-.3, .3), .022 * rng.uniform(.6, 1.2), rng.uniform(-.7, .7))
# the room's wall clock: a soft tick each second while we are inside
for s in range(24, 69):
    if MEM[int(s * SR)] < .5: put(fx, hp(click(1.6, .5), 1500), s + .02, .012, .25)
for e in ev('step'):
    if e['surf'] == 'dust': x = addl(bp(noise(.18), 300, 3000) * env_exp(.18, .03), lp(thump(.5, 80), 400) * .4); put(fx, x, e['t'], .09 * e.get('g', 1), rng.uniform(-.2, .2))
    else: x = verb(addl(lp(thump(.6, 90), 700), bp(noise(.12), 500, 2500) * env_exp(.12, .02) * .5), .8, .3, 3); put(fx, x, e['t'], .11 * e.get('g', 1), .3)
put(fx, verb(creak(.9), 1.0, .3, 4), one('box_open'), .1, .2); put(fx, lp(thump(.7, 110), 900), one('box_bump'), .12, .2)
def rustle(d, sharp=1.):
    t = t_(d); x = bp(noise(d), 1200, 7000) * (np.abs(np.sin(2 * np.pi * 7 * t)) ** 2 + .3) * np.sin(np.pi * t / d) ** .6
    crack = (rng.random(len(t)) < .0016 * sharp) * rng.standard_normal(len(t)) * 2.5; return x + hp(crack, 2000)
for k, d in [('paper_pull', .7), ('paper_turn', .5), ('paper_take', .45), ('paper_flap', .5), ('paper_slide', .9)]:
    put(fx, rustle(d), one(k), .05, rng.uniform(-.3, .3))
for e in ev('paper_unfold'): put(fx, rustle(.55, 2), e['t'], .06, .1)
d = 1.6; put(fx, hp(noise(d), 4000) * np.exp(-t_(d) / .5) * .4, one('dust_fall'), .025, .2)
for e in ev('knock'): put(fx, verb(lp(addl(thump(.8, 140), clack(.6) * .3), 1500), .9, .35, 6), e['t'], .13, .35)
put(fx, verb(lp(thump(.4, 160), 1200), .6, .3, 7), one('tap'), .07, -.2)
for e in ev('mist'): d = 1.4; t = t_(d); put(fx, verb(bp(noise(d), 500, 3000) * np.sin(np.pi * t / d) ** 2, 2.0, .5, 8), e['t'], .035, 0)
for e in ev('wipe'): d = e['d'] + .2; t = t_(d); put(fx, bp(noise(d), 1500, 6500) * (1 + .5 * np.sin(2 * np.pi * 11 * t)) * np.sin(np.pi * t / d) ** .7, e['t'], .018, 0)

# —— score: Bhupali colour (D E F# A B) over a soft tanpura-like drone; piano, flute (the bansuri's place), strings, harp ——
S.seed(14)
sc = []
def N_(t, inst, p, d, v, pan=0, g=None): sc.append((t, inst, p, d, v, pan) if g is None else (t, inst, p, d, v, pan, g))
# drone: Pa–Sa–Sa–Sa' cycle every 1.6 s through the outdoor scenes and the ending; softer inside
drone = np.zeros(N)
for k, t0 in enumerate(np.arange(0.3, DUR - 1, 1.6)):
    for j, (p, dt) in enumerate([('A2', 0), ('D3', .4), ('D3', .8), ('D2', 1.2)]):
        x = P.pluck('shamisen', p, 2.6, vel=.45, buzz=.5); s = int((t0 + dt) * SR); x = x[:max(0, N - s)]; drone[s:s + len(x)] += x
drone = lp(drone, 2500) * curve([(0, .0), (.8, .5), (16.6, .45), (23.4, .25), (33.8, .12), (51, .05), (57, .12), (68, .35), (72.2, .5), (DUR - .6, .4), (DUR, 0)])
# village (0–8): a flute phrase answering the narration; piano drops
for t0, p, d in [(1.2, 'F#5', .9), (2.1, 'A5', .6), (2.7, 'B5', 1.2), (4.2, 'A5', .5), (4.7, 'F#5', .6), (5.3, 'E5', 1.4), (6.9, 'D5', 1.2)]: N_(t0, 'flute', p, d, .5, .25)
for t0, p in [(0.4, 'D4'), (2.0, 'A4'), (3.6, 'F#4'), (5.2, 'E4'), (6.8, 'D4')]: N_(t0, 'piano', p, 1.6, .38, -.2)
N_(0.3, 'cellos', 'D3', 7.8, .26, -.1)
# discovery (8–16.6): piano question, low strings, a held violin as the envelope comes out
for t0, p in [(8.4, 'B3'), (9.2, 'E4'), (10.0, 'F#4'), (10.8, 'E4'), (11.9, 'B4'), (13.6, 'A4'), (14.4, 'E4'), (15.2, 'F#4')]: N_(t0, 'piano', p, 1.4, .34, -.2)
N_(8.2, 'cellos', 'B2', 8.2, .24, -.1); N_(11.9, 'violins', 'F#5', 4.4, .16, .3)
# journey (16.6–23.4): a walking piano figure and the flute theme; strings rise toward the house
for k in range(16):
    t0 = 16.8 + k * .42; p = ['D4', 'A4', 'F#4', 'A4', 'E4', 'A4', 'F#4', 'B4'][k % 8]; N_(t0, 'piano', p, .8, .26 + .02 * (k % 2), -.2)
for t0, p, d in [(17.4, 'A5', .7), (18.2, 'B5', .5), (18.8, 'D6', 1.0), (20.2, 'B5', .5), (20.8, 'A5', .5), (21.4, 'F#5', 1.4)]: N_(t0, 'flute', p, d, .46, .25)
N_(16.8, 'violas', 'A3', 6.6, .2, .1); N_(19.6, 'violins', 'D5', 3.8, .16, .3)
# the woman (23.4–33.8): quiet piano chords; a violin line swells at the recognition
for t0, ch in [(23.6, ['D3', 'A3', 'F#4']), (26.0, ['B2', 'F#3', 'D4']), (28.4, ['G2', 'D3', 'B3']), (30.6, ['A2', 'E3', 'C#4'])]:
    for j, p in enumerate(ch): N_(t0 + j * .08, 'piano', p, 2.2, .26, -.2)
N_(23.6, 'cellos', 'D3', 4.6, .2, -.1); N_(28.4, 'cellos', 'G2', 5.4, .22, -.1)
for t0, p, d in [(30.6, 'E5', 1.4), (32.0, 'F#5', 1.0), (32.9, 'A5', 1.6)]: N_(t0, 'violins', p, d, .22, .3)
# the letter (33.8–39.4): harp and piano under the father's voice; the memory (39.4–50.8): the theme on flute over warm strings
for k in range(10): N_(34.0 + k * .55, 'harp', ['D4', 'F#4', 'A4', 'D5', 'A4'][k % 5], 1.6, .32, -.3)
N_(33.8, 'violas', 'F#3', 5.6, .2, .1); N_(36.6, 'cellos', 'D3', 3.0, .2, -.1)
for t0, ch in [(39.4, ['D3', 'A3']), (42.2, ['B2', 'F#3']), (45.0, ['G2', 'D3']), (47.8, ['A2', 'E3'])]:
    for p in ch: N_(t0, 'cellos', p, 3.0, .26, -.1)
    N_(t0, 'violins', {39.4: 'F#4', 42.2: 'D4', 45.0: 'B4', 47.8: 'C#5'}[t0], 3.0, .2, .3)
for t0, p, d in [(40.6, 'A5', .8), (41.5, 'B5', .5), (42.1, 'A5', .5), (42.7, 'F#5', 1.2), (44.2, 'E5', .6), (44.9, 'F#5', .5), (45.5, 'A5', .6), (46.2, 'B5', .5), (46.8, 'D6', 1.8), (48.8, 'B5', .6), (49.5, 'A5', 1.4)]:
    N_(t0, 'flute', p, d, .44, .25)
for k in range(8): N_(40.4 + k * 1.2, 'harp', ['D5', 'A4', 'F#5', 'A4'][k % 4], 1.8, .24, -.3)
# the emotional moment (51–57.2): almost nothing — one held string, two piano notes after her words
N_(51.0, 'violas', 'D4', 6.0, .14, .1); N_(56.2, 'piano', 'F#4', 2.0, .3, -.1); N_(56.6, 'piano', 'D4', 2.4, .26, -.1)
# the final memory (57.2–75): the theme returns on piano, strings swell; harp as the photograph comes alive; the last chord on the title
theme = [('A4', .5), ('B4', .5), ('D5', 1.0), ('B4', .5), ('A4', .5), ('F#4', 1.0), ('E4', .5), ('F#4', .5), ('A4', 1.5), ('F#4', .5), ('E4', .5), ('D4', 2.0)]
tcur = 58.0
for p, d in theme: N_(tcur, 'piano', p, d * 1.5, .36, -.2); tcur += d * 1.1
for t0, ch in [(57.4, ['D3', 'A3']), (60.4, ['B2', 'F#3']), (63.4, ['G2', 'D3']), (66.4, ['A2', 'E3']), (68.8, ['D3', 'A3'])]:
    for p in ch: N_(t0, 'cellos', p, 3.2, .24, -.1)
for t0, p, d in [(60.4, 'D5', 3.0), (63.4, 'B4', 3.0), (66.4, 'C#5', 2.4), (67.4, 'E5', 1.6), (68.8, 'F#5', 3.6)]: N_(t0, 'violins', p, d, .22, .3)
for k in range(14): N_(67.4 + k * .07, 'harp', ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5'][k % 7] if k < 7 else ['F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6'][k - 7], 2.0, .3, -.3)
for p in ['D2', 'D3', 'A3', 'D4', 'F#4', 'A4']: N_(72.2, 'piano', p, 2.6, .3, -.1)
for p in ['D3', 'A3']: N_(72.2, 'cellos', p, 2.6, .24, -.1)
N_(72.2, 'violins', 'F#5', 2.6, .2, .3); N_(72.6, 'flute', 'A5', 1.8, .32, .25)
mus = S.render(sc, dur=DUR); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = mus / (np.abs(mus).max() + 1e-9) + stereo(drone / (np.abs(drone).max() + 1e-9) * .5, 1501)
mus *= curve([(0, .9), (16.6, .9), (23.4, .85), (33.8, .9), (39.4, 1.0), (50.8, .95), (51.2, .55), (56.0, .55), (57.2, .9), (67, 1.05), (72.2, 1.1), (DUR - .8, 1.0), (DUR, 0)])[:, None]

# —— voices ——
vo = bus(); env = np.zeros(N)
for e in ev('line'):
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav')); x = resample_poly(x if x.ndim == 1 else x.mean(1), SR, sr)
    x = compress(norm(hp(x, 70)) * .9, .28, 3)
    if e['id'][0] == 'l': x = verb(lp(x, 6500), 1.6, .22, 21); g, pan = .78, -.05   # the father's letter: a little further, a little more room
    elif e['id'] == 'w1': x = verb(x, .6, .12, 22); g, pan = .8, .1
    else: x = verb(x, .5, .08, 9); g, pan = .82, 0
    put(vo, x, e['t'], g, pan); s = int(e['t'] * SR); env[s:s + len(x)] = 1
k = int(.3 * SR); duck = 1 - .4 * np.convolve(env, np.ones(k) / k, 'same')   # music ~4 dB under the voice, smoothed
mix = vo + (mus * .23 + amb + fx) * duck[:, None]
f = int(.9 * SR); mix[:f] *= (np.linspace(0, 1, f) ** 1.5)[:, None]; g = int(.8 * SR); mix[-g:] *= np.linspace(1, 0, g)[:, None]
mix = np.stack([limit(mix[:, 0], .92), limit(mix[:, 1], .92)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', round(N / SR, 3), 'peak', round(float(np.abs(mix).max()), 3), 'voice rms dB', round(20 * np.log10(np.sqrt((vo ** 2).mean()) + 1e-9), 1), 'music rms dB', round(20 * np.log10(np.sqrt(((mus * .23) ** 2).mean()) + 1e-9), 1))
