#!/usr/bin/env python3
"""Generate AETHER Ep01 code-drawn storyboard LAYOUT panels (SVG).

  python3 scripts/animatic/gen_panels.py            # writes story/ep01/storyboard/<panel>.svg + index README

Panel ids and timing come from story/ep01/shotlist.yaml (`panels:`). Each id has a
composition function below. These are layout panels (composition, framing, colour,
character placement) for the animatic, not final art; drawn Krita panels with the
same ids replace them later (hybrid workflow, option C).
"""
import os
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgkit import (AE, EL, NEX, W, H, Svg, G, P, C, E, R, T, particles, spiral_particles, rain, frozen_rain, flare,  # noqa: E402
                    speed_lines, magic_circle, bg_cosmos, galaxy, island, arch, platform, bg_nexus, bg_city, umbrellas,
                    bg_room, aether_head, aether_bust, aether_figure, elaria_head, elaria_bust, elaria_figure, baby_head,
                    baby_hand, baby_body, light_overlay)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SHOTLIST = os.path.join(ROOT, 'story', 'ep01', 'shotlist.yaml')
OUT = os.path.join(ROOT, 'story', 'ep01', 'storyboard')

PANELS = {}


def panel(fn):
    PANELS[fn.__name__] = fn
    return fn


# ----------------------------------------------------------------------------- SC1 cold open
@panel
def sh010_p01(sv):
    bg_cosmos(sv, seed=1, stars=160, nebula=0.25)
    sv.add(C(960, 486, 2.5, '#FFFFFF', filt='url(#glow)'))


@panel
def sh010_p02(sv):
    bg_cosmos(sv, seed=1, stars=220, nebula=0.75)
    sv.add(C(960, 486, 300, sv.rg([(0, '#FFE3A3', 0.9), (0.3, '#FFB347', 0.35), (1, '#FFB347', 0)])))
    sv.add(C(960, 486, 420, 'none', op=0.25, stroke='#FF8A5B', stroke_width=30, filt='url(#b24)'))
    sv.add(flare(960, 486, 230))
    sv.add(particles(sv, 60, (300, 150, 1650, 900), 4, 1, 2.5, col='#FFE9C9', op=(0.2, 0.6), glow=False))


# ----------------------------------------------------------------------------- SC2 previous life
def _street(sv, ax, shift):
    bg_city(sv, seed=5, shift=shift)
    sv.add(umbrellas(21, 840, 9, 900 - shift, 1900 - shift, 1.15))
    sv.add(aether_figure(sv, ax, 880, 340, facing=1, pose='walk', lanyard=True, head_view='profile', eye=0.7, brow='sad'))
    sv.add(umbrellas(22, 940, 7, -100 - shift, 900 - shift, 1.5))
    sv.add(rain(7, 420, (0, -40, W + 120, H), 46, 12, 0.32))
    sv.add(R(0, 0, W, H, '#2C3A52', op=0.18))


@panel
def sh020_p01(sv):
    _street(sv, 640, 0)


@panel
def sh020_p02(sv):
    _street(sv, 900, 60)


def _phone(sv, lit=True):
    bg_city(sv, seed=9, defocus=True)
    items = []
    items.append(P('M760,1080 C720,900 760,760 820,700 L1150,700 C1210,820 1230,960 1200,1080 Z', fill=AE['skin_sh'], stroke=AE['skin_ln'], sw=3))
    phone = [R(-210, -420, 420, 840, '#16181E', rx=46, stroke='#3A3F4A', stroke_width=6),
             R(-190, -395, 380, 790, '#10141C' if lit else '#07080B', rx=34)]
    if lit:
        phone += [C(0, -210, 70, '#2A3550'), T(0, -185, 'माँ', 64, '#FFFFFF', weight='bold'),
                  T(0, -60, '3 मिस्ड कॉल', 44, '#FF6B6B'),
                  T(0, 10, 'मोबाइल', 28, '#8A93A8'),
                  C(-110, 260, 52, '#E04848'), C(110, 260, 52, '#2FBF71'),
                  P('M90,250 q20,-18 40,0 l-6,10 q-14,-8 -28,0 Z', fill='#FFFFFF')]
        phone.append(R(-190, -395, 380, 790, '#8FC7FF', op=0.06, rx=34))
    else:
        phone.append(G(aether_head(sv, 0, -40, 230, 1, 'front', eye=0.6, brow='sad', mouth='flat'), op=0.12))
    for i, (dx, dy, r) in enumerate([(-120, -300, 14), (60, -120, 10), (140, 120, 18), (-60, 180, 12), (20, 330, 9), (-150, 60, 8)]):
        phone.append(E(dx, dy, r * 0.8, r, '#BFD8FF', op=0.35, stroke='#FFFFFF', stroke_width=2))
    items.append(G(phone, transform='translate(970,560) rotate(-6)'))
    thumb = 'M1210,760 C1180,700 1130,660 1080,640 C1050,632 1040,660 1060,680 C1100,700 1140,740 1160,800 Z' if lit else \
            'M1240,640 C1220,600 1200,560 1190,520 C1185,500 1205,495 1215,510 C1230,540 1250,580 1260,620 Z'
    items.append(P(thumb, fill=AE['skin'], stroke=AE['skin_ln'], sw=3))
    items.append(P('M700,1080 C680,920 700,820 760,760 L790,780 C760,860 760,960 780,1080 Z', fill=AE['skin'], stroke=AE['skin_ln'], sw=3))
    if lit:
        items.append(C(1080, 680, 140, '#8FC7FF', op=0.18, filt='url(#b24)'))
    sv.add(*items)
    sv.add(rain(13, 120, (0, 0, W, H), 30, 10, 0.18))


@panel
def sh030_p01(sv):
    _phone(sv, True)


@panel
def sh030_p02(sv):
    _phone(sv, False)


@panel
def sh040_p01(sv):
    bg_city(sv, seed=9, defocus=True)
    sv.add(aether_bust(sv, 860, 470, 400, 1, '3q', lanyard=True, wet=True, eye=0.85, brow='neutral', mouth='part', look=(0.8, 0)))
    sv.add(light_overlay(sv, 1.0, 0.45, '#FFFFFF', 0.55, 0.6))
    sv.add(rain(17, 260, (0, -40, W, H), 50, 12, 0.3))


@panel
def sh040_p02(sv):
    bg_city(sv, seed=9, defocus=True)
    sv.add(aether_bust(sv, 860, 470, 410, 1, '3q', lanyard=True, wet=True, eye=1.2, brow='up', mouth='part', small_pupil=True, look=(1, 0)))
    sv.add(frozen_rain(19, 260, (0, 0, W, H)))
    sv.add(light_overlay(sv, 1.0, 0.45, '#FFFFFF', 0.95, 0.85))


# ----------------------------------------------------------------------------- SC3 awakening
def _eye_ecu(sv, open_, reflect):
    sv.add(R(0, 0, W, H, sv.lg([(0, '#1A1240'), (1, '#2A1E5E')])))
    s = 2600
    sv.add(aether_head(sv, 760 + 0.16 * s, 640 - 0.04 * s, s, 1, 'front', eye=open_, brow='neutral', mouth='flat', reflect=reflect))
    sv.add(light_overlay(sv, 0.25, 0.4, '#C9B8FF', 0.25, 0.6))


@panel
def sh050_p01(sv):
    _eye_ecu(sv, 0.0, False)


@panel
def sh050_p02(sv):
    _eye_ecu(sv, 1.0, True)


@panel
def sh060_p01(sv):
    bg_nexus(sv, seed=3, arches=((1500, 640, 360, 380, 16),))
    sv.add(platform(sv, 960, 830, 560, 140))
    sv.add(aether_figure(sv, 820, 860, 480, 1, 'sit', head_view='3q', eye=0.7, brow='neutral', mouth='part', look=(0, -0.3)))
    sv.add(particles(sv, 40, (0, 0, W, 700), 31, 1.5, 3, col='#DDE6FF', op=(0.3, 0.8)))


@panel
def sh060_p02(sv):
    bg_nexus(sv, seed=3, arches=((1500, 640, 360, 380, 16),))
    sv.add(platform(sv, 960, 830, 560, 140))
    sv.add(aether_figure(sv, 820, 860, 480, 1, 'sit', head_view='3q', head_facing=-1, hand_on_chest=True, eye=1.0, brow='up', mouth='open', look=(0.5, -0.2)))
    sv.add(particles(sv, 40, (0, 0, W, 700), 32, 1.5, 3, col='#DDE6FF', op=(0.3, 0.8)))


@panel
def sh060_p03(sv):
    bg_nexus(sv, seed=4, horizon=0.75,
             galaxies=((1400, 230, 300, -18), (380, 260, 200, 25), (980, 120, 120, 5)),
             islands=[(200, 520, 300, 1, 0.9), (1700, 560, 340, 2, 0.95), (700, 420, 160, 3, 0.7), (1240, 380, 130, 4, 0.6),
                      (1000, 300, 70, 5, 0.5), (470, 330, 80, 6, 0.5), (1500, 450, 120, 7, 0.7)],
             arches=((1080, 470, 260, 300, 12), (560, 520, 160, 190, 8)))
    sv.add(platform(sv, 960, 880, 240, 60))
    sv.add(aether_figure(sv, 930, 892, 150, 1, 'sit', head_view='3q', eye=0.7, mouth='flat'))
    sv.add(particles(sv, 70, (0, 0, W, H), 33, 1, 2.5, col='#DDE6FF', op=(0.3, 0.9)))


# ----------------------------------------------------------------------------- SC4 Elaria
@panel
def sh070_p01(sv):
    bg_nexus(sv, seed=3, blur=14)
    sv.add(light_overlay(sv, 0.9, 0.45, NEX['gold2'], 0.35, 0.6))
    sv.add(aether_bust(sv, 1000, 470, 380, -1, 'profile', eye=0.9, brow='up', mouth='flat'))
    sv.add(C(905, 545, 10, EL['glow'], filt='url(#glow)'))
    sv.add(G([C(260, 300, 40, EL['glow'], op=0.5), C(420, 820, 60, EL['glow'], op=0.4), C(1650, 250, 50, EL['glow'], op=0.45)], filt='url(#b14)'))
    sv.add(particles(sv, 30, (1250, 150, 1900, 900), 41, 2, 5))


@panel
def sh070_p02(sv):
    bg_nexus(sv, seed=3, blur=14, warm=0.6)
    sv.add(spiral_particles(1450, 520, 360, 2.2, 160, 43))
    sv.add(aether_bust(sv, 820, 470, 400, 1, '3q', back_shoulder=True, eye=1.05, brow='up', mouth='part', look=(1, 0)))
    sv.add(light_overlay(sv, 0.8, 0.45, NEX['gold2'], 0.3, 0.6))


def _arch_bg(sv, blur=0):
    bg_nexus(sv, seed=6, horizon=0.85, galaxies=((1550, 220, 200, -18), (330, 180, 160, 25)),
             islands=[(180, 700, 220, 1, 0.8), (1760, 720, 260, 2, 0.8)], blur=blur)
    sv.add(G(arch(960, 1080, 980, 1150, 46), filt=f'url(#b{blur})' if blur else None))


@panel
def sh080_p01(sv):
    _arch_bg(sv)
    sv.add(C(960, 600, 380, EL['glow'], op=0.3, filt='url(#b40)'))
    sv.add(spiral_particles(960, 700, 420, 3, 260, 51, squash=0.3))
    sv.add(G(elaria_figure(sv, 960, 1010, 900, 1, glow=0, eye=0.0), op=0.22))
    sv.add(platform(sv, 960, 1050, 700, 90))


@panel
def sh080_p02(sv):
    _arch_bg(sv)
    sv.add(platform(sv, 960, 1050, 700, 90))
    sv.add(elaria_figure(sv, 960, 1010, 900, 1, glow=1.2, sway=0.6, view='front', eye=0.85, mouth='soft'))
    sv.add(particles(sv, 80, (300, 100, 1620, 1000), 52, 2, 5))


@panel
def sh080_p03(sv):
    _arch_bg(sv, blur=8)
    sv.add(elaria_bust(sv, 960, 400, 300, 1, view='front', eye=0.75, mouth='smile', sway=0.4))
    sv.add(particles(sv, 50, (200, 80, 1720, 1000), 53, 2, 5))


# ----------------------------------------------------------------------------- SC5 the truth
@panel
def sh090_p01(sv):
    bg_nexus(sv, seed=3, blur=14, warm=0.5)
    sv.add(aether_bust(sv, 820, 470, 400, 1, '3q', eye=0.9, brow='up', mouth='smile', look=(1, 0)))
    sv.add(light_overlay(sv, 1.0, 0.4, NEX['gold2'], 0.3, 0.6))


@panel
def sh090_p02(sv):
    bg_nexus(sv, seed=3, blur=14, warm=0.3)
    sv.add(aether_bust(sv, 820, 470, 400, 1, '3q', eye=0.65, brow='sad', mouth='part', look=(0.3, 1)))
    sv.add(light_overlay(sv, 1.0, 0.4, NEX['gold2'], 0.18, 0.6))


@panel
def sh100_p01(sv):
    bg_nexus(sv, seed=6, blur=24)
    sv.add(elaria_bust(sv, 1060, 500, 520, -1, view='3q', eye=0.95, mouth='flat', runes=True, halo=1.0))


@panel
def sh100_p02(sv):
    bg_nexus(sv, seed=6, blur=24)
    sv.add(elaria_bust(sv, 1060, 500, 540, -1, view='3q', eye=0.68, brow='sad', mouth='open', halo=0.3))


def _grief(sv, tear, mouth, eye, grey):
    sv.add(R(0, 0, W, H, sv.lg([(0, '#2A2A44'), (1, '#4A4766')])))
    sv.add(aether_head(sv, 960, 400 - 0.04 * 1750, 1750, 1, 'front', eye=eye, brow='pinch', mouth=mouth, tear=tear, tremble=True, look=(0, 0.3)))
    sv.add(R(0, 0, W, H, '#6A6680', op=grey))


@panel
def sh110_p01(sv):
    _grief(sv, 0.1, 'tremble', 0.95, 0.08)


@panel
def sh110_p02(sv):
    _grief(sv, 0.55, 'part', 0.85, 0.14)


@panel
def sh110_p03(sv):
    _grief(sv, 1.0, 'A', 0.7, 0.2)


# ----------------------------------------------------------------------------- SC6 another chance
def _ots(sv, reach):
    bg_nexus(sv, seed=8, horizon=0.66, galaxies=((960, 640, 330, -8), (300, 200, 140, 25)),
             islands=[(150, 560, 240, 1, 0.8), (1780, 580, 260, 2, 0.8)])
    sv.add(platform(sv, 960, 980, 900, 170))
    if reach:
        sv.add(elaria_bust(sv, 1180, 360, 250, -1, arm='reach', view='3q', eye=0.75, brow='sad', mouth='open', glow=1.3))
    else:
        sv.add(elaria_figure(sv, 1200, 1060, 820, -1, view='3q', eye=0.75, mouth='soft', glow=1.1))
    sv.add(particles(sv, 60, (800, 100, 1700, 950), 61, 2, 6))
    sv.add(G(aether_bust(sv, 420, 760, 520, 1, 'back'), filt='url(#b8)'))


@panel
def sh120_p01(sv):
    _ots(sv, False)


@panel
def sh120_p02(sv):
    _ots(sv, True)


# ----------------------------------------------------------------------------- SC7 acceptance
@panel
def sh130_p01(sv):
    bg_nexus(sv, seed=3, blur=14, grey=0.4)
    sv.add(aether_bust(sv, 860, 470, 400, 1, '3q', eye=0.25, brow='sad', mouth='flat', tear=0.6))
    sv.add(P('M300,1080 C420,900 560,700 720,560', stroke=AE['shirt'], sw=120))
    sv.add(P('M300,1080 C420,900 560,700 720,560', stroke=AE['shirt_ln'], sw=3, op=0.6))
    sv.add(P('M640,620 C690,580 740,540 790,520', stroke=AE['skin'], sw=80))
    sv.add(P('M640,620 C690,580 740,540 790,520', stroke=AE['skin_ln'], sw=3, op=0.4))


@panel
def sh130_p02(sv):
    bg_nexus(sv, seed=3, blur=14, warm=0.5)
    sv.add(aether_bust(sv, 860, 470, 410, 1, '3q', eye=0.85, brow='level', mouth='grin', look=(1, 0)))
    sv.add(light_overlay(sv, 0.95, 0.4, NEX['gold2'], 0.35, 0.65))
    sv.add(particles(sv, 30, (0, 0, W, H), 71, 2, 4, op=(0.3, 0.8)))


@panel
def sh130_p03(sv):
    bg_nexus(sv, seed=3, blur=14, warm=0.7)
    sv.add(P('M960,800 C1150,720 1320,660 1500,640', stroke=AE['shirt'], sw=90))
    sv.add(C(1520, 640, 40, AE['skin'], stroke=AE['skin_ln'], stroke_width=3))
    sv.add(aether_bust(sv, 760, 430, 300, 1, '3q', eye=0.85, brow='level', mouth='smile', look=(1, 0)))
    sv.add(P('M1920,600 C1780,610 1660,625 1580,640', stroke=EL['gown'], sw=90))
    sv.add(R(1600, 590, 30, 100, EL['gold'], transform='rotate(-8 1615 640)'))
    sv.add(E(1555, 640, 45, 30, EL['skin'], stroke=EL['skin_ln'], stroke_width=3))
    sv.add(C(1540, 640, 120, EL['glow'], op=0.35, filt='url(#b24)'))
    sv.add(light_overlay(sv, 0.85, 0.55, NEX['gold2'], 0.35, 0.6))


# ----------------------------------------------------------------------------- SC8 the sending
def _two_shot(sv, circle, columns, dissolve):
    bg_nexus(sv, seed=9, horizon=0.66, galaxies=((960, 640, 300, -8), (300, 180, 130, 25), (1650, 160, 110, -30)),
             islands=[(140, 560, 220, 1, 0.8), (1800, 580, 240, 2, 0.8)])
    sv.add(platform(sv, 960, 900, 820, 150))
    if circle:
        sv.add(magic_circle(720, 900, 260 * circle, op=min(1, circle)))
    if columns:
        for i, dx in enumerate((-200, -120, -40, 40, 120, 200)):
            sv.add(R(720 + dx - 18, 300, 36, 600, sv.lg([(0, NEX['gold2'], 0), (1, NEX['gold2'], 0.6 * columns)]), filt='url(#b8)'))
    fig = aether_figure(sv, 720, 905, 540, 1, 'stand', head_view='3q', eye=0.85, mouth='smile', look=(1, -0.2))
    if dissolve:
        cp = sv.clip(R(0, 0, W, 905 - 540 * dissolve, '#fff'))
        sv.add(G(fig, clip=cp))
        sv.add(spiral_particles(720, 905 - 540 * dissolve * 0.5, 220, 2, 220, 81, col='#FFF2C0', squash=1.1))
    else:
        sv.add(fig)
    sv.add(elaria_figure(sv, 1200, 890, 600, -1, arm='bless', view='3q', eye=0.6, mouth='smile', glow=1.2))
    sv.add(P('M800,560 C880,575 960,575 1040,565', stroke=AE['shirt'], sw=26) if not dissolve or dissolve < 0.6 else '')
    if dissolve:
        sv.add(light_overlay(sv, 0.38, 0.6, '#FFF6DE', 0.85 * dissolve, 0.7))


@panel
def sh140_p01(sv):
    _two_shot(sv, 0.8, 0, 0)


@panel
def sh140_p02(sv):
    _two_shot(sv, 1.0, 1.0, 0)


@panel
def sh140_p03(sv):
    _two_shot(sv, 1.0, 1.2, 0.75)


@panel
def sh150_p01(sv):
    bg_cosmos(sv, seed=12, stars=0, nebula=0.9)
    sv.add(speed_lines(960, 540, 91, 160, 180, '#DDE6FF'))
    sv.add(speed_lines(960, 540, 92, 70, 120, NEX['gold2']))
    sv.add(C(960, 540, 260, sv.rg([(0, '#FFFFFF', 1), (0.35, '#FFF2C0', 0.7), (1, '#FFD36B', 0)])))


# ----------------------------------------------------------------------------- SC9 born again
@panel
def sh160_p01(sv):
    bg_room(sv, bloom=0.55)
    sv.add(E(1350, 260, 380, 320, '#C9A98A', op=0.55, filt='url(#b40)'))
    sv.add(E(1250, 520, 260, 360, '#E7CDB2', op=0.5, filt='url(#b40)'))


@panel
def sh160_p02(sv):
    bg_room(sv)
    sv.add(baby_head(sv, 1250, 520, 420, eye=0.0, mouth='soft', blur=8))
    sv.add(baby_hand(640, 760, 640, grasp=0.55))


@panel
def sh160_p03(sv):
    bg_room(sv)
    sv.add(baby_head(sv, 960, 520, 720, eye=1.15, mouth='o', small_pupil=True))
    sv.add(baby_hand(300, 980, 380, grasp=0.25, blur=4))


def _title(sv, reveal, sub):
    cp = sv.clip(R(960 - 520, 60, 1040 * reveal, 260, '#fff'))
    t = [T(960, 210, 'एक नई शुरुआत', 118, '#5E3A12', family='FreeSerif', op=0.35, transform='translate(4,5)'),
         T(960, 210, 'एक नई शुरुआत', 118, '#FFF4DA', family='FreeSerif', stroke='#B07A2A', stroke_width=3)]
    sv.add(G([C(960, 170, 420, '#FFE3A3', op=0.35, filt='url(#b40)')]))
    sv.add(G(t, clip=cp))
    if sub:
        sv.add(T(960, 285, 'Ek Nayi Shuruaat', 40, '#7A5326', family='FreeSans', letter_spacing=6))
        sv.add(flare(1430, 120, 60, '#FFFFFF'))


@panel
def sh170_p01(sv):
    bg_room(sv)
    sv.add(baby_head(sv, 960, 560, 760, eye=0.3, mouth='soft'))


@panel
def sh170_p02(sv):
    bg_room(sv)
    sv.add(baby_body(sv, 960, 640, 300))
    _title(sv, 0.6, False)


@panel
def sh170_p03(sv):
    bg_room(sv)
    sv.add(G(baby_body(sv, 960, 700, 240)))
    sv.add(baby_head(sv, 960, 700, 240, squeeze=True, mouth='squeeze'))
    _title(sv, 1.0, True)


# ----------------------------------------------------------------------------- main
def main():
    data = yaml.safe_load(open(SHOTLIST, encoding='utf-8'))
    panels = data['panels']
    os.makedirs(OUT, exist_ok=True)
    missing = [p['id'] for p in panels if p['id'] not in PANELS]
    if missing:
        sys.exit(f'no composition for: {missing}')
    rows = []
    for p in panels:
        sv = Svg()
        PANELS[p['id']](sv)
        path = os.path.join(OUT, p['id'] + '.svg')
        svg = sv.render(f"AETHER Ep01 {p['id']} — layout panel v0")
        if not os.path.exists(path) or open(path, encoding='utf-8').read() != svg:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(svg)
        rows.append(f"| `{p['id']}` | {p['start']}–{p['end']} | {p['start'] / 24:.2f}–{p['end'] / 24:.2f} s | {p['desc']} |")
    with open(os.path.join(OUT, 'README.md'), 'w', encoding='utf-8') as fh:
        fh.write('# Ep01 storyboard panels\n\n'
                 '**Layout panels v0: code-drawn** (`scripts/animatic/gen_panels.py`). They show composition, framing, colour\n'
                 'and character placement only. They are not final art and show no real acting. Hybrid workflow (option C):\n'
                 'artists replace each panel with a drawn Krita panel **of the same id** (export `<id>.png` next to the SVG;\n'
                 'the animatic build prefers a PNG over the SVG when both exist).\n\n'
                 'Timing source: `story/ep01/shotlist.yaml` → `panels:`. Regenerate with\n'
                 '`python3 scripts/animatic/gen_panels.py`; do not hand-edit the SVGs.\n\n'
                 '| Panel | Frames | Time | Content |\n|---|---|---|---|\n' + '\n'.join(rows) + '\n')
    print(f'wrote {len(panels)} panels to {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    main()
