# Mix for "The Unscheduled Train": synthesized score (FM e-piano, synth brass, FM bells) + ambience + event foley → out/mix.wav
# Usage: "$LIB/.venv/bin/python" mix.py   (reads events.json written by core/render/events.mjs)
import sys, os, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ['LIB'], 'core', 'audio'))
from sfx import *

E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR); tt = np.arange(N) / SR
rng = np.random.default_rng(11)
curve = lambda keys: np.interp(tt, *np.array(keys, float).T)
def stereo(x, pan=0.0): l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l * 1.414, x * r * 1.414], 1)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
BEAT = 60 / 90

# —— score ——
def fm_ep(f, d, v=1.0):   # FM electric piano: bell transient + warm body
    t = t_(d); mi = 2.2 * np.exp(-t / .25) + .4
    x = np.sin(2 * np.pi * f * t + mi * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.6) + .25 * np.sin(2 * np.pi * 14 * f * t) * np.exp(-t / .05)
    return x * v
def brass(f, d, v=1.0):   # synth brass: detuned saws through an opening low-pass
    t = t_(d); x = sum(((f * k * t) % 1 * 2 - 1) for k in (1, 1.004, .996))
    y = (lp(x, 700) * (1 - np.minimum(1, t / (d * .6))) + lp(x, 2800) * np.minimum(1, t / (d * .6))) * np.minimum(1, t / .35) * np.minimum(1, (d - t) / .4)
    return y * v / 3
mus = np.zeros((N, 2))
chords = [(0, [50, 57, 61, 64, 69]), (BEAT * 4, [47, 54, 57, 62, 66])]            # Dmaj9 → Bm11, dusk colour
for t0, ns in chords:
    for i, m in enumerate(ns): add(mus, fm_ep(mtof(m), 3.2, .16), t0 + i * .03, 1, -.3 + i * .15)
add(mus, fm_ep(mtof(76), 1.6, .1), BEAT * 6, 1, .4)
for i, m in enumerate([54, 57, 62, 66]): add(mus, fm_ep(mtof(m), 2.0, .07), 6.0 + i * .05, 1, -.2 + i * .12)   # thin pad under the close-up
for i, m in enumerate([50, 57, 62, 66, 69]): add(mus, brass(mtof(m), 10 - 8.35, .22), 8.35, 1, -.4 + i * .2)    # door: brass swell (D major add9)
for k, m in enumerate([81, 85, 88, 93]): add(mus, fm_ep(mtof(m), 1.2, .09), 8.85 + k * .11, 1, .5 - k * .2)      # bell sparkle on the light spill
mus *= curve([(0, 1), (2.6, 1), (3.0, .0), (5.8, .0), (6.0, .8), (7.55, .8), (7.62, .05), (8.3, .05), (8.35, 1), (10, 1)])[:, None]

# —— ambience ——
wind = bp(noise(DUR), 200, 1200) * (.6 + .4 * np.sin(2 * np.pi * .3 * tt)) * .25 * curve([(0, 1), (3, .8), (6, .5), (7.6, .2), (8, .4), (10, .4)])
shimmer = sum(np.sin(2 * np.pi * f * tt) * (np.sin(2 * np.pi * r * tt) > .6) for f, r in [(4200, 11), (4700, 13.3), (5100, 9.7)]) * .012 * curve([(0, 1), (2.8, 1), (3, 0), (10, 0)])
amb = stereo(wind, -.4) + stereo(np.roll(wind, 7001), .4) + stereo(shimmer, .2)
fol = np.zeros((N, 2))
def tone(fs, d, v, harm=4):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * k * t) / k for f in fs for k in range(1, harm + 1)); return norm(x) * v
for ev in E['ev']:
    t0, ty = ev['t'], ev['type']
    if ty == 'bell':   # distant level-crossing bell: alternating two pitches
        k = 0
        while k * .42 < ev['d']: add(fol, norm(tone([980 if k % 2 else 830], .4, 1, 3) * env_exp(.4, .12)) * .05, t0 + k * .42, 1, -.6); k += 1
    elif ty == 'light': add(fol, ding(.05), t0, 1, -.7)
    elif ty == 'hum':
        d = ev['d']; h = lp(brown(d), 160) * .7 + bp(noise(d), 300, 900) * .2
        h *= np.interp(t_(d), [0, .6, 1.8, 3.4, 5.2, 6.6], [0, .25, 1, .8, .45, .3])[:len(h)]
        add(fol, h * .5, t0, 1, 0)
    elif ty == 'horn':
        d = .85; x = tone([311, 370], d, 1, 6) * np.minimum(1, t_(d) / .03) * np.minimum(1, (d - t_(d)) / .15); add(fol, lp(x, 2200) * .55, t0, 1, -.2)
    elif ty == 'gust': add(fol, whoosh(1.2, .5), t0, 1, .3)
    elif ty == 'clack': pn = (rng.random() - .5) * .4; add(fol, clack(.55, 1) * .32 * ev.get('v', 1), t0, 1, pn); add(fol, thump(.5, 90) * .25 * ev.get('v', 1), t0, 1, pn)
    elif ty == 'brake':
        d = ev['d']; t = t_(d); sq = np.sin(2 * np.pi * (2900 + 120 * np.sin(2 * np.pi * 7 * t)) * t) * .5 + bp(noise(d), 2000, 5000) * .4
        sq *= np.interp(t, [0, .2, d - .5, d], [0, 1, .6, 0]); add(fol, sq * .09, t0, 1, .1)
    elif ty == 'hiss': d = .7; add(fol, hp(noise(d), 2500) * env_exp(d, .25) * .2, t0, 1, .2)
    elif ty == 'slide': d = ev['d']; add(fol, bp(noise(d), 400, 2000) * np.sin(np.pi * t_(d) / d) * .12, t0, 1, .1); add(fol, thump(.3, 70), t0 + d, 1, .1)
    elif ty == 'chime': add(fol, ding(.1), t0, 1, .2)

# near-silence before the door (7.6–8.0): everything drops away
gate = curve([(0, 1), (7.55, 1), (7.62, .12), (8.3, .12), (8.38, 1), (10, 1)])
mix_ = (mus + amb + fol * 1.0) * gate[:, None]
mix_[:int(.04 * SR)] *= np.linspace(0, 1, int(.04 * SR))[:, None]
mix_ = np.stack([limit(mix_[:, 0], .9), limit(mix_[:, 1], .9)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix_.astype(np.float32), SR)
print('mix.wav', mix_.shape[0] / SR, 's peak', np.abs(mix_).max())
