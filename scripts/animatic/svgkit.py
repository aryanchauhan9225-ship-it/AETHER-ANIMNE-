"""AETHER storyboard layout kit: tiny SVG helpers, palettes, characters, environments, FX.

Code-drawn *layout* panels for the animatic (hybrid workflow, option C). They show
composition, framing, colour and character placement. They are NOT final art; artists
replace them with drawn Krita panels of the same id.

Colours follow art/characters/*/design-spec.md and art/backgrounds/ep01-environments.md.
Pure standard library (no installs).
"""
import math
import random

W, H = 1920, 1080

# ---------------------------------------------------------------- palettes (from design specs)
AE = dict(skin='#F4D9C4', skin_sh='#DDB29A', skin_ln='#7A4E3A',
          hair='#6B4A33', hair_sh='#4A3122', hair_hl='#9A7254', hair_ln='#2E1C14',
          iris='#2A86C4', iris_sh='#155A8C', iris_hl='#8FD3F5', pupil='#0E2E4A',
          white='#FBFBFF', shirt='#F2F2EE', shirt_sh='#C9CCD6', shirt_ln='#5A5E6E',
          tie='#2E3A5A', tie_sh='#1D2640', trousers='#3A3E48', trousers_sh='#262930',
          lanyard='#2F6FD0', shoes='#1A1A1F', mouth='#8A3A3A')
EL = dict(skin='#FBEDE4', skin_sh='#E8CBBE', skin_ln='#9C6E62',
          hair='#EEF0F7', hair_sh='#B9C0D8', hair_hl='#FFFFFF', hair_ln='#7E86A6',
          iris='#E8B13A', iris_sh='#A8741C', iris_hl='#FFF0B0', pupil='#5A3608',
          gown='#FAFAF7', gown_sh='#D5D8E6', gown_ln='#8A8FA8',
          gold='#D4A93C', gold_sh='#9C7322', gold_hl='#F7DE8A', glow='#FFD36B',
          brow='#C8CDE0', mouth='#B8706A')
BABY = dict(wrap='#F3E9D8', wrap_sh='#D9C7AA', wrap_ln='#A08B6C')
NEX = dict(space='#0B0B2A', violet='#3B2A6E', violet2='#6A4BB3', blue='#2F5FB3', blue2='#5C8FE0',
           silver='#C9D3E8', silver_sh='#7E8AB0', gold='#F2C14E', gold2='#FFD36B', fall='#BFE6FF')

_uid = [0]


def uid(prefix='i'):
    _uid[0] += 1
    return f'{prefix}{_uid[0]}'


def f(v):
    return (f'{v:.4f}'.rstrip('0').rstrip('.') or '0') if isinstance(v, float) else str(v)


def attrs(**kw):
    out = []
    for k, v in kw.items():
        if v is None:
            continue
        k = k.rstrip('_').replace('_', '-')
        out.append(f'{k}="{f(v) if isinstance(v, (int, float)) else v}"')
    return ' '.join(out)


def P(d, fill='none', stroke=None, sw=None, op=None, filt=None, **kw):
    return f'<path d="{d}" {attrs(fill=fill, stroke=stroke, stroke_width=sw, opacity=op, filter=filt, stroke_linejoin="round", stroke_linecap="round", **kw)}/>'


def C(cx, cy, r, fill, op=None, filt=None, **kw):
    return f'<circle {attrs(cx=cx, cy=cy, r=r, fill=fill, opacity=op, filter=filt, **kw)}/>'


def E(cx, cy, rx, ry, fill, op=None, filt=None, **kw):
    return f'<ellipse {attrs(cx=cx, cy=cy, rx=rx, ry=ry, fill=fill, opacity=op, filter=filt, **kw)}/>'


def R(x, y, w, h, fill, op=None, filt=None, **kw):
    return f'<rect {attrs(x=x, y=y, width=w, height=h, fill=fill, opacity=op, filter=filt, **kw)}/>'


def G(items, transform=None, op=None, filt=None, clip=None):
    body = ''.join(items) if isinstance(items, (list, tuple)) else items
    return f'<g {attrs(transform=transform, opacity=op, filter=filt, clip_path=clip)}>{body}</g>'


def T(x, y, text, size, fill, family='FreeSans', anchor='middle', weight=None, op=None, filt=None, **kw):
    return (f'<text {attrs(x=x, y=y, font_family=family, font_size=size, fill=fill, text_anchor=anchor, font_weight=weight, opacity=op, filter=filt, **kw)}>'
            f'{text}</text>')


def poly(pts):
    return 'M' + ' L'.join(f'{f(float(x))},{f(float(y))}' for x, y in pts) + ' Z'


class Svg:
    """One storyboard panel. Collect <defs> and body, then render."""

    def __init__(self):
        self.defs = []
        self.body = []

    def add(self, *items):
        self.body.extend(items)

    def lg(self, stops, x1=0, y1=0, x2=0, y2=1):
        i = uid('lg')
        st = ''.join(f'<stop offset="{s[0]}" stop-color="{s[1]}" stop-opacity="{s[2] if len(s) > 2 else 1}"/>' for s in stops)
        self.defs.append(f'<linearGradient id="{i}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{st}</linearGradient>')
        return f'url(#{i})'

    def rg(self, stops, cx=0.5, cy=0.5, r=0.5):
        i = uid('rg')
        st = ''.join(f'<stop offset="{s[0]}" stop-color="{s[1]}" stop-opacity="{s[2] if len(s) > 2 else 1}"/>' for s in stops)
        self.defs.append(f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r="{r}">{st}</radialGradient>')
        return f'url(#{i})'

    def clip(self, inner):
        i = uid('cp')
        self.defs.append(f'<clipPath id="{i}">{inner}</clipPath>')
        return f'url(#{i})'

    def render(self, title=''):
        filters = ''.join(
            f'<filter id="b{s}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="{s}"/></filter>'
            for s in (2, 4, 8, 14, 24, 40, 70))
        glow = ('<filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" result="g"/>'
                '<feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>')
        return ('<?xml version="1.0" encoding="UTF-8"?>\n'
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * 2}" height="{H * 2}" viewBox="0 0 {W} {H}">\n'
                f'<title>{title}</title>\n<defs>{filters}{glow}{"".join(self.defs)}</defs>\n'
                f'<rect width="{W}" height="{H}" fill="#000"/>\n' + '\n'.join(self.body) + '\n</svg>\n')


# =============================================================== FX helpers

def particles(sv, n, box, seed, rmin=2, rmax=6, col=None, op=(0.5, 1.0), glow=True):
    rnd = random.Random(seed)
    col = col or EL['glow']
    x0, y0, x1, y1 = box
    items = [C(rnd.uniform(x0, x1), rnd.uniform(y0, y1), rnd.uniform(rmin, rmax), col, op=round(rnd.uniform(*op), 2)) for _ in range(n)]
    return G(items, filt='url(#glow)' if glow else None)


def spiral_particles(cx, cy, r, turns, n, seed, col=None, squash=0.45, rot=0):
    rnd = random.Random(seed)
    col = col or EL['glow']
    items = []
    for i in range(n):
        t = i / n
        a = t * turns * 2 * math.pi + rnd.uniform(-0.2, 0.2)
        rr = r * (0.15 + 0.85 * t) + rnd.uniform(-12, 12)
        items.append(C(cx + rr * math.cos(a), cy + rr * math.sin(a) * squash, rnd.uniform(1.5, 5.5), col, op=round(rnd.uniform(0.4, 1), 2)))
    return G(items, transform=f'rotate({rot} {cx} {cy})', filt='url(#glow)')


def rain(seed, n, box, length=40, angle=12, op=0.3, sw=1.4, col='#DCE6FF'):
    rnd = random.Random(seed)
    x0, y0, x1, y1 = box
    dx = math.sin(math.radians(angle)) * length
    dy = math.cos(math.radians(angle)) * length
    d = ''.join(f'M{rnd.uniform(x0, x1):.0f},{rnd.uniform(y0, y1):.0f} l{-dx:.1f},{dy:.1f} ' for _ in range(n))
    return P(d, stroke=col, sw=sw, op=op)


def frozen_rain(seed, n, box, op=0.7):
    rnd = random.Random(seed)
    x0, y0, x1, y1 = box
    return G([E(rnd.uniform(x0, x1), rnd.uniform(y0, y1), 1.6, 5, '#FFFFFF', op=round(rnd.uniform(0.4, op), 2)) for _ in range(n)])


def flare(cx, cy, r, col='#FFE3A3'):
    rays = []
    for i, (ln, w) in enumerate([(1.0, 3), (0.55, 2)] * 4):
        a = math.radians(i * 45)
        rays.append(P(f'M{cx - math.cos(a) * r * ln:.0f},{cy - math.sin(a) * r * ln:.0f} L{cx + math.cos(a) * r * ln:.0f},{cy + math.sin(a) * r * ln:.0f}',
                      stroke=col, sw=w, op=0.8))
    return G(rays + [C(cx, cy, r * 0.07, '#FFFFFF')], filt='url(#glow)')


def speed_lines(cx, cy, seed, n=90, r0=260, col='#FFFFFF'):
    rnd = random.Random(seed)
    d = ''
    for _ in range(n):
        a = rnd.uniform(0, 2 * math.pi)
        r1 = r0 + rnd.uniform(0, 200)
        r2 = r1 + rnd.uniform(250, 900)
        d += f'M{cx + math.cos(a) * r1:.0f},{cy + math.sin(a) * r1:.0f} L{cx + math.cos(a) * r2:.0f},{cy + math.sin(a) * r2:.0f} '
    return P(d, stroke=col, sw=3, op=0.55)


def magic_circle(cx, cy, rx, squash=0.28, col=None, op=1.0):
    col = col or NEX['gold2']
    ry = rx * squash
    items = [E(cx, cy, rx * k, ry * k, 'none', op=op, stroke=col, stroke_width=sw) for k, sw in ((1.0, 4), (0.86, 2), (0.62, 3), (0.3, 2))]
    tick = ''
    for i in range(36):
        a = 2 * math.pi * i / 36
        tick += f'M{cx + math.cos(a) * rx * 0.88:.0f},{cy + math.sin(a) * ry * 0.88:.0f} L{cx + math.cos(a) * rx * 0.98:.0f},{cy + math.sin(a) * ry * 0.98:.0f} '
    items.append(P(tick, stroke=col, sw=2, op=op))
    for rot in (0, 60):
        pts = [(cx + math.cos(math.radians(rot + 90 + k * 120)) * rx * 0.6, cy + math.sin(math.radians(rot + 90 + k * 120)) * ry * 0.6) for k in range(3)]
        items.append(P(poly(pts), stroke=col, sw=2, op=op))
    return G(items, filt='url(#glow)')


# =============================================================== environments

def bg_cosmos(sv, seed=1, stars=260, nebula=0.6, centre_dark=False):
    sv.add(R(0, 0, W, H, sv.lg([(0, '#05050F'), (1, '#0B0B2A')])))
    if nebula:
        sv.add(G([E(960, 540, 900, 170, NEX['violet'], op=0.7 * nebula),
                  E(760, 600, 520, 120, NEX['blue'], op=0.5 * nebula),
                  E(1250, 470, 420, 90, NEX['violet2'], op=0.35 * nebula)],
                 transform='rotate(-24 960 540)', filt='url(#b70)'))
    rnd = random.Random(seed)
    items = []
    for _ in range(stars):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        if centre_dark and abs(x - 960) < 160 and abs(y - 500) < 120:
            continue
        r = rnd.choice([0.7, 0.9, 1.1, 1.4, 1.8, 2.4])
        items.append(C(x, y, r, rnd.choice(['#FFFFFF', '#DDE6FF', '#FFE9C9']), op=round(rnd.uniform(0.35, 1), 2)))
    sv.add(G(items))


def galaxy(cx, cy, r, rot=0, col='#9FB8FF', core='#FFF2D6', op=1.0, blur=True):
    arms = []
    for k in range(2):
        pts = []
        for i in range(40):
            t = i / 39
            a = k * math.pi + t * 3.4
            rr = r * (0.12 + 0.88 * t)
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a) * 0.42))
        arms.append(P('M' + ' L'.join(f'{x:.0f},{y:.0f}' for x, y in pts), stroke=col, sw=r * 0.16, op=0.45))
    return G([E(cx, cy, r, r * 0.42, col, op=0.25)] + arms + [E(cx, cy, r * 0.22, r * 0.12, core, op=0.9)],
             transform=f'rotate({rot} {cx} {cy})', op=op, filt='url(#b8)' if blur else None)


def island(sv, x, y, w, seed=0, fall=True, op=1.0):
    rnd = random.Random(seed)
    h = w * rnd.uniform(0.7, 1.0)
    body = P(f'M{x - w / 2:.0f},{y:.0f} Q{x - w * 0.3:.0f},{y + h * 0.5:.0f} {x + rnd.uniform(-0.1, 0.1) * w:.0f},{y + h:.0f} '
             f'Q{x + w * 0.32:.0f},{y + h * 0.45:.0f} {x + w / 2:.0f},{y:.0f} Z', fill=sv.lg([(0, '#4B4F7E'), (1, '#1C1D3E')]))
    veins = P(f'M{x - w * 0.2:.0f},{y + h * 0.1:.0f} L{x - w * 0.05:.0f},{y + h * 0.55:.0f} M{x + w * 0.18:.0f},{y + h * 0.15:.0f} '
              f'L{x + w * 0.05:.0f},{y + h * 0.6:.0f}', stroke=NEX['silver'], sw=max(1.5, w * 0.012), op=0.7)
    top = E(x, y, w / 2, w * 0.09, sv.lg([(0, '#7FA6E8'), (1, '#4D6FBF')]))
    items = [body, veins, top]
    if fall:
        fx = x + w * rnd.uniform(0.15, 0.35)
        items.insert(0, R(fx - w * 0.04, y, w * 0.08, h * 1.6, sv.lg([(0, NEX['fall'], 0.9), (1, NEX['fall'], 0)]), filt='url(#b4)'))
    return G(items, op=op)


def arch(cx, base_y, w, h, sw=None, op=1.0):
    sw = sw or w * 0.05
    d = f'M{cx - w / 2:.0f},{base_y:.0f} L{cx - w / 2:.0f},{base_y - h * 0.55:.0f} A{w / 2:.0f},{h * 0.45:.0f} 0 0 1 {cx + w / 2:.0f},{base_y - h * 0.55:.0f} L{cx + w / 2:.0f},{base_y:.0f}'
    return G([P(d, stroke=NEX['silver_sh'], sw=sw * 1.25, op=0.6),
              P(d, stroke=NEX['silver'], sw=sw),
              P(d, stroke=NEX['gold'], sw=max(1.5, sw * 0.12))], op=op)


def platform(sv, cx, cy, rx, ry):
    pts = [(cx + rx * math.cos(math.radians(a)), cy + ry * math.sin(math.radians(a))) for a in range(0, 360, 60)]
    side = [(x, y + ry * 0.35) for x, y in pts]
    return G([E(cx, cy + ry * 0.6, rx * 1.1, ry * 1.1, NEX['blue2'], op=0.35, filt='url(#b24)'),
              P(poly([pts[0], pts[1], pts[2], pts[3], side[3], side[2], side[1], side[0]]), fill='#6F7FB8', op=0.85),
              P(poly(pts), fill=sv.lg([(0, '#E4ECFF'), (1, '#8FA3D9')]), stroke=NEX['silver'], sw=3, op=0.95),
              P(poly([(cx + (x - cx) * 0.62, cy + (y - cy) * 0.62) for x, y in pts]), stroke='#FFFFFF', sw=2, op=0.6),
              P(f'M{pts[0][0]:.0f},{pts[0][1]:.0f} L{pts[3][0]:.0f},{pts[3][1]:.0f} M{pts[1][0]:.0f},{pts[1][1]:.0f} L{pts[4][0]:.0f},{pts[4][1]:.0f} '
                f'M{pts[2][0]:.0f},{pts[2][1]:.0f} L{pts[5][0]:.0f},{pts[5][1]:.0f}', stroke='#FFFFFF', sw=1.5, op=0.35)])


def bg_nexus(sv, seed=3, horizon=0.62, galaxies=((1450, 260, 230, -18), (420, 330, 150, 25)), islands=None, arches=(), blur=0, warm=0.0, grey=0.0):
    items = []
    tmp = Svg()
    tmp.defs = sv.defs
    items.append(R(0, 0, W, H, sv.lg([(0, '#0B0B2A'), (0.45, '#2A1E5E'), (0.8, '#3A4FA0'), (1, '#6A7FD0')])))
    items.append(G([E(600, 300, 700, 190, NEX['violet2'], op=0.5), E(1400, 520, 600, 170, NEX['blue'], op=0.5),
                    E(960, H * horizon, 1200, 140, '#9FB2F0', op=0.35)], filt='url(#b70)'))
    rnd = random.Random(seed)
    items.append(G([C(rnd.uniform(0, W), rnd.uniform(0, H * horizon), rnd.choice([0.8, 1.1, 1.5, 2.2]), '#FFFFFF', op=round(rnd.uniform(0.3, 1), 2)) for _ in range(220)]))
    for g in galaxies:
        items.append(galaxy(*g))
    for a in arches:
        items.append(arch(*a))
    isl = islands if islands is not None else [(240, 560, 260, 1, 0.8), (1650, 600, 300, 2, 0.85), (820, 470, 140, 3, 0.6), (1260, 430, 110, 4, 0.5)]
    for x, y, w, s, op in isl:
        items.append(island(sv, x, y, w, s, op=op))
    if warm:
        items.append(R(0, 0, W, H, sv.rg([(0, NEX['gold2'], 0.55 * warm), (1, NEX['gold2'], 0)], cx=0.8, cy=0.4, r=0.7)))
    if grey:
        items.append(R(0, 0, W, H, '#5E5A78', op=0.45 * grey))
    sv.add(G(items, filt=f'url(#b{blur})' if blur else None))


def bg_city(sv, seed=5, defocus=False, shift=0):
    rnd = random.Random(seed)
    items = [R(0, 0, W, H, sv.lg([(0, '#0A0F1C'), (1, '#1C2433')]))]
    x = -40 - shift
    while x < W + 40:
        bw = rnd.uniform(90, 200)
        bh = rnd.uniform(160, 420)
        items.append(R(x, 430 - bh, bw, bh + 40, rnd.choice(['#141B2B', '#18213A', '#1E2840'])))
        for wy in range(int(430 - bh + 18), 440, 26):
            for wx in range(int(x + 12), int(x + bw - 12), 22):
                if rnd.random() < 0.35:
                    items.append(R(wx, wy, 10, 12, '#F2C46B', op=round(rnd.uniform(0.3, 0.9), 2)))
        x += bw + rnd.uniform(4, 20)
    items.append(R(0, 400, W, 34, '#0D111C'))
    items.append(G([C(80 + i * 140 - shift % 140, 417, 4, '#F2C46B', op=0.8) for i in range(15)], filt='url(#glow)'))
    items.append(P(poly([(0, 470), (W, 470), (W, H), (0, H)]), fill=sv.lg([(0, '#1A2130'), (1, '#0E121A')])))
    for i in range(14):
        sx = 300 + i * 95 - shift * 1.2
        items.append(P(poly([(sx, 700), (sx + 50, 700), (sx + 85, 860), (sx + 20, 860)]), fill='#C9D0DD', op=0.25))
    for sx, sy, col, txt in ((260 - shift, 300, '#FF3FA4', 'चाय'), (1380 - shift, 250, '#3FE0FF', 'OPEN'), (1700 - shift, 330, '#FF3FA4', 'CAFÉ')):
        items.append(G([R(sx - 85, sy - 42, 170, 70, 'none', stroke=col, stroke_width=5, rx=10),
                        T(sx, sy + 12, txt, 40, col, weight='bold')], filt='url(#glow)'))
        items.append(R(sx - 70, 500, 140, 330, sv.lg([(0, col, 0.45), (1, col, 0)]), filt='url(#b14)'))
    sv.add(G(items, filt='url(#b14)' if defocus else None))
    if defocus:
        sv.add(G([C(rnd.uniform(0, W), rnd.uniform(0, H), rnd.uniform(30, 90), rnd.choice(['#FF3FA4', '#3FE0FF', '#F2C46B', '#8FA0C0']),
                    op=round(rnd.uniform(0.15, 0.4), 2)) for _ in range(26)], filt='url(#b8)'))


def umbrellas(seed, y, n, x0, x1, scale=1.0):
    rnd = random.Random(seed)
    items = []
    for _ in range(n):
        x = rnd.uniform(x0, x1)
        yy = y + rnd.uniform(-30, 60)
        r = rnd.uniform(55, 80) * scale
        col = rnd.choice(['#2A2F3D', '#3A2F45', '#23303A', '#30343F', '#4A2E3A'])
        items.append(R(x - r * 0.35, yy, r * 0.7, r * 1.8, '#11141B'))
        items.append(P(f'M{x - r:.0f},{yy:.0f} Q{x:.0f},{yy - r * 1.1:.0f} {x + r:.0f},{yy:.0f} Z', fill=col, stroke='#0A0C12', sw=2))
        items.append(P(f'M{x:.0f},{yy - r * 0.55:.0f} L{x:.0f},{yy + r * 0.5:.0f}', stroke='#0A0C12', sw=3))
    return G(items)


def bg_room(sv, bloom=0.0):
    items = [R(0, 0, W, H, sv.lg([(0, '#E9D6B8'), (1, '#F3E9D8')])),
             R(0, 0, W, 120, '#6E4526', op=0.7), R(0, 150, W, 40, '#6E4526', op=0.5),
             R(120, 160, 460, 520, '#FFF6DE'), R(120, 160, 460, 520, 'none', stroke='#6E4526', stroke_width=26),
             R(338, 160, 24, 520, '#6E4526'), R(120, 408, 460, 24, '#6E4526'),
             P(poly([(160, 200), (560, 200), (1500, H), (420, H)]), fill=sv.lg([(0, '#FFE3A3', 0.7), (1, '#FFE3A3', 0)], 0, 0, 1, 1)),
             E(1100, 980, 1100, 260, '#F7EEDD'), E(1300, 900, 500, 120, '#E8D9BE', op=0.8)]
    sv.add(G(items, filt='url(#b24)'))
    sv.add(particles(sv, 40, (300, 250, 1300, 900), 7, 1.5, 3.5, col='#FFF3D0', op=(0.3, 0.8)))
    if bloom:
        sv.add(R(0, 0, W, H, sv.rg([(0, '#FFFFFF', bloom), (1, '#FFF6DE', bloom * 0.6)], r=0.8)))


# =============================================================== character parts (unit head space)
# Unit head: centre (0,0); hair top ~ -0.62, chin 0.5, face half-width ~0.36. facing +1 = right.

def _eye(sv, x, y, w, pal, open_=1.0, look=(0.0, 0.0), lash=None, small_pupil=False, reflect=False, runes=False, lw=0.012, far=False):
    lash = lash or pal['hair_ln']
    items = []
    if open_ < 0.12:
        items.append(P(f'M{x - w / 2:.3f},{y:.3f} Q{x:.3f},{y + 0.035:.3f} {x + w / 2:.3f},{y - 0.004:.3f}', stroke=lash, sw=lw * 1.6))
        items.append(P(f'M{x + w / 2:.3f},{y - 0.004:.3f} l{w * 0.12:.3f},{-0.02:.3f}', stroke=lash, sw=lw * 1.2))
        return ''.join(items)
    h = 0.062 * open_
    almond = (f'M{x - w / 2:.3f},{y:.3f} Q{x - w * 0.1:.3f},{y - h * 1.35:.3f} {x + w / 2:.3f},{y - h * 0.15:.3f} '
              f'Q{x + w * 0.05:.3f},{y + h * 0.95:.3f} {x - w / 2:.3f},{y:.3f} Z')
    cp = sv.clip(P(almond, fill='#fff'))
    ix, iy = x + look[0] * w * 0.22, y - h * 0.15 + look[1] * 0.02
    irx, iry = w * 0.27, 0.058
    inner = [P(almond, fill=pal.get('white', '#FBFBFF')),
             E(ix, iy, irx, iry, pal['iris']),
             E(ix, iy - iry * 0.45, irx, iry * 0.55, pal['iris_sh'], op=0.75),
             E(ix, iy + iry * 0.35, irx * 0.7, iry * 0.4, pal['iris_hl'], op=0.55)]
    if reflect:
        inner.append(galaxy(ix, iy, irx * 0.8, -20, col='#C9B8FF', core='#FFFFFF', op=0.8, blur=False))
        rnd = random.Random(11)
        inner += [C(ix + rnd.uniform(-irx, irx), iy + rnd.uniform(-iry, iry), 0.0025, '#FFFFFF') for _ in range(18)]
    inner.append(E(ix, iy, irx * (0.22 if small_pupil else 0.42), iry * (0.25 if small_pupil else 0.45), pal['pupil']))
    if runes:
        rr = ''
        for i in range(14):
            a = 2 * math.pi * i / 14
            px, py = ix + math.cos(a) * irx * 0.78, iy + math.sin(a) * iry * 0.78
            rr += f'M{px:.4f},{py:.4f} l{math.cos(a + 1.2) * 0.006:.4f},{math.sin(a + 1.2) * 0.006:.4f} '
        inner.append(E(ix, iy, irx, iry, pal['iris_hl'], op=0.55))
        inner.append(P(rr, stroke='#FFF6C8', sw=0.004))
        inner.append(E(ix, iy, irx * 0.8, iry * 0.8, 'none', stroke='#FFF6C8', stroke_width=0.0025))
    inner.append(C(ix - irx * 0.35, iy - iry * 0.45, irx * 0.28, '#FFFFFF'))
    inner.append(C(ix + irx * 0.3, iy + iry * 0.35, irx * 0.12, '#FFFFFF'))
    items.append(G(inner, clip=cp))
    items.append(P(f'M{x - w / 2:.3f},{y:.3f} Q{x - w * 0.1:.3f},{y - h * 1.35:.3f} {x + w / 2:.3f},{y - h * 0.15:.3f}', stroke=lash, sw=lw * 2.2))
    items.append(P(f'M{x + w / 2:.3f},{y - h * 0.15:.3f} l{w * 0.16:.3f},{-0.03:.3f}', stroke=lash, sw=lw * 1.6))
    items.append(P(f'M{x - w * 0.35:.3f},{y + h * 0.55:.3f} Q{x:.3f},{y + h * 0.95:.3f} {x + w * 0.4:.3f},{y + h * 0.4:.3f}', stroke=lash, sw=lw * 0.6, op=0.6))
    return ''.join(items)


def _brow(x, y, w, kind, col, lw, inner_side):
    # inner_side: -1 if the inner end (towards nose) is at smaller x
    dy = {'neutral': 0, 'up': -0.04, 'sad': 0, 'level': 0.015, 'pinch': 0.01}.get(kind, 0)
    xi, xo = x + inner_side * w / 2, x - inner_side * w / 2
    yi = y + dy + (-0.035 if kind in ('sad', 'pinch') else 0.0)
    yo = y + dy + (0.012 if kind in ('sad', 'pinch') else 0.0)
    arch_ = -0.022 if kind not in ('level',) else -0.006
    return P(f'M{xi:.3f},{yi:.3f} Q{x:.3f},{min(yi, yo) + arch_:.3f} {xo:.3f},{yo:.3f}', stroke=col, sw=lw * 2.4)


def _mouth(x, y, kind, pal, lw, scale=1.0):
    ln = pal['skin_ln']
    w = 0.07 * scale
    if kind == 'flat':
        return P(f'M{x - w:.3f},{y:.3f} Q{x:.3f},{y + 0.006:.3f} {x + w:.3f},{y:.3f}', stroke=ln, sw=lw * 1.4)
    if kind == 'smile':
        return P(f'M{x - w:.3f},{y + 0.004:.3f} Q{x:.3f},{y + 0.03:.3f} {x + w * 1.1:.3f},{y - 0.022:.3f}', stroke=ln, sw=lw * 1.5)
    if kind == 'soft':
        return P(f'M{x - w * 0.8:.3f},{y:.3f} Q{x:.3f},{y + 0.018:.3f} {x + w * 0.8:.3f},{y - 0.006:.3f}', stroke=ln, sw=lw * 1.2)
    if kind == 'part':
        return E(x, y, w * 0.55, 0.012 * scale, pal['mouth'], stroke=ln, stroke_width=lw)
    if kind == 'open':
        return E(x, y + 0.01, w * 0.6, 0.026 * scale, pal['mouth'], stroke=ln, stroke_width=lw)
    if kind == 'A':
        return G([E(x, y + 0.016, w * 0.75, 0.045 * scale, pal['mouth'], stroke=ln, stroke_width=lw),
                  E(x, y + 0.04, w * 0.45, 0.014 * scale, '#D07070')])
    if kind == 'o':
        return E(x, y + 0.01, w * 0.35, 0.03 * scale, pal['mouth'], stroke=ln, stroke_width=lw)
    if kind == 'grin':
        d = f'M{x - w * 1.2:.3f},{y - 0.004:.3f} Q{x:.3f},{y + 0.06:.3f} {x + w * 1.3:.3f},{y - 0.03:.3f} Q{x:.3f},{y + 0.012:.3f} {x - w * 1.2:.3f},{y - 0.004:.3f} Z'
        return G([P(d, fill='#FFFFFF', stroke=ln, sw=lw * 1.3)])
    if kind == 'tremble':
        return P(f'M{x - w:.3f},{y:.3f} q{w * 0.25:.3f},-0.01 {w * 0.5:.3f},0 t{w * 0.5:.3f},0 t{w * 0.5:.3f},0 t{w * 0.5:.3f},0', stroke=ln, sw=lw * 1.3)
    if kind == 'squeeze':
        return P(f'M{x - w * 0.5:.3f},{y:.3f} L{x + w * 0.5:.3f},{y:.3f}', stroke=ln, sw=lw * 1.8)
    return ''


def _tear(x, y, t, lw):
    ty = y + 0.06 + 0.32 * t
    return G([P(f'M{x:.3f},{y + 0.05:.3f} Q{x - 0.01:.3f},{(y + ty) / 2:.3f} {x + 0.004:.3f},{ty:.3f}', stroke='#BFE6FF', sw=lw * 1.6, op=0.8) if t > 0.15 else '',
              P(f'M{x:.3f},{ty - 0.03:.3f} q-0.016,0.024 0,0.036 q0.016,-0.012 0,-0.036 Z', fill='#D8F1FF', stroke='#7FB8E0', sw=lw * 0.7)])


def aether_head(sv, cx, cy, s, facing=1, view='3q', eye=1.0, brow='neutral', mouth='flat', tear=0.0, look=(0, 0),
                small_pupil=False, reflect=False, tremble=False, eyes_closed=None):
    """Aether's head. view: front | 3q | profile | back. s = head height in px (chin to brow ~ 1 unit)."""
    pal = AE
    lw = 2.4 / s
    it = []
    if view == 'back':
        it.append(P('M-0.06,0.3 L-0.06,0.62 L0.12,0.62 L0.12,0.3 Z', fill=pal['skin_sh']))
        it.append(E(-0.38, 0.05, 0.05, 0.09, pal['skin_sh']))
        it.append(E(0.4, 0.05, 0.05, 0.09, pal['skin_sh']))
        it.append(P('M-0.42,0.2 C-0.5,-0.4 -0.2,-0.66 0.02,-0.64 C0.3,-0.64 0.52,-0.4 0.43,0.2 L0.36,0.36 L0.28,0.24 L0.2,0.4 L0.1,0.26 '
                    'L0.0,0.42 L-0.1,0.27 L-0.2,0.4 L-0.28,0.24 L-0.36,0.34 Z', fill=pal['hair'], stroke=pal['hair_ln'], sw=lw))
        it.append(P('M-0.25,-0.3 C-0.1,-0.45 0.15,-0.45 0.3,-0.28', stroke=pal['hair_hl'], sw=lw * 6, op=0.5))
        it.append(P('M0.02,-0.62 L0.14,-0.8 L0.12,-0.6 Z', fill=pal['hair'], stroke=pal['hair_ln'], sw=lw))
        return G(it, transform=f'translate({cx:.1f},{cy:.1f}) scale({facing * s:.2f},{s:.2f})')
    if view == 'profile':
        it.append(P('M-0.42,0.15 C-0.55,-0.35 -0.2,-0.66 0.08,-0.62 C0.38,-0.58 0.5,-0.3 0.42,0.18 L0.3,0.1 Z', fill=pal['hair_sh'], stroke=pal['hair_ln'], sw=lw))
        face = ('M-0.02,-0.35 C0.18,-0.42 0.33,-0.33 0.34,-0.18 L0.36,-0.02 L0.45,0.12 L0.37,0.16 L0.37,0.24 L0.34,0.3 L0.36,0.36 '
                'C0.33,0.45 0.22,0.52 0.1,0.5 C-0.05,0.48 -0.2,0.4 -0.24,0.2 Z')
        it.append(P(face, fill=pal['skin'], stroke=pal['skin_ln'], sw=lw))
        it.append(P('M0.02,0.38 C0.1,0.47 0.2,0.48 0.3,0.44', stroke=pal['skin_sh'], sw=lw * 4, op=0.7))
        it.append(E(-0.15, 0.07, 0.05, 0.085, pal['skin_sh'], stroke=pal['skin_ln'], stroke_width=lw))
        it.append(_eye(sv, 0.235, 0.04, 0.11, pal, eye if eyes_closed is None else 0, look=(0.6, look[1]), lw=lw, small_pupil=small_pupil))
        it.append(_brow(0.23, -0.085, 0.13, brow, pal['hair_ln'], lw, -1))
        it.append(_mouth(0.31, 0.32, 'flat' if mouth not in ('part', 'open', 'smile') else mouth, pal, lw, 0.6))
        it.append(P('M-0.46,0.2 C-0.56,-0.3 -0.25,-0.68 0.1,-0.64 C0.33,-0.62 0.45,-0.45 0.4,-0.26 L0.36,-0.05 L0.3,-0.2 L0.26,0.0 '
                    'L0.2,-0.22 L0.14,-0.08 L0.06,-0.28 L-0.12,-0.2 L-0.2,0.05 L-0.28,-0.06 L-0.34,0.28 L-0.4,0.1 Z',
                    fill=pal['hair'], stroke=pal['hair_ln'], sw=lw))
        it.append(P('M-0.25,-0.48 C-0.05,-0.6 0.15,-0.58 0.28,-0.44', stroke=pal['hair_hl'], sw=lw * 6, op=0.55))
        it.append(P('M-0.3,-0.56 L-0.42,-0.74 L-0.22,-0.6 Z', fill=pal['hair'], stroke=pal['hair_ln'], sw=lw))
        return G(it, transform=f'translate({cx:.1f},{cy:.1f}) scale({facing * s:.2f},{s:.2f})')

    q = 1 if view == '3q' else 0
    sh = 0.07 * q
    it.append(P('M-0.47,0.22 C-0.56,-0.35 -0.26,-0.68 0.02,-0.66 C0.32,-0.66 0.58,-0.36 0.47,0.2 L0.4,0.34 L0.34,0.2 L-0.34,0.2 L-0.4,0.34 Z',
                fill=pal['hair_sh'], stroke=pal['hair_ln'], sw=lw))
    if q:
        face = 'M-0.36,-0.15 C-0.38,0.2 -0.22,0.42 0.05,0.5 C0.22,0.44 0.33,0.24 0.36,-0.06 C0.36,-0.46 -0.36,-0.5 -0.36,-0.15 Z'
        it.append(E(-0.36, 0.07, 0.055, 0.1, pal['skin'], stroke=pal['skin_ln'], stroke_width=lw))
    else:
        face = 'M-0.36,-0.12 C-0.37,0.15 -0.24,0.38 0,0.5 C0.24,0.38 0.37,0.15 0.36,-0.12 C0.36,-0.47 -0.36,-0.47 -0.36,-0.12 Z'
        it.append(E(-0.37, 0.07, 0.05, 0.1, pal['skin'], stroke=pal['skin_ln'], stroke_width=lw))
        it.append(E(0.37, 0.07, 0.05, 0.1, pal['skin'], stroke=pal['skin_ln'], stroke_width=lw))
    it.append(P(face, fill=pal['skin'], stroke=pal['skin_ln'], sw=lw))
    it.append(P('M-0.3,0.18 C-0.22,0.38 -0.08,0.47 0.05,0.5' if q else 'M-0.28,0.2 C-0.2,0.36 -0.1,0.44 0,0.47',
                stroke=pal['skin_sh'], sw=lw * 5, op=0.55))
    ex = [(-0.16 + sh, 0.04, 0.155), (0.16 + sh * 1.15, 0.04, 0.155 * (0.8 if q else 1))]
    for i, (x, y, w) in enumerate(ex):
        o = 0 if eyes_closed else eye
        if tremble:
            it.append(G(_eye(sv, x + 0.008, y, w, pal, o, look, lw=lw, small_pupil=small_pupil), op=0.35))
        it.append(_eye(sv, x, y, w, pal, o, look, lw=lw, small_pupil=small_pupil, reflect=reflect))
        it.append(_brow(x, y - 0.115 - 0.02 * (eye - 1), w * 1.05, brow, pal['hair_ln'], lw, 1 if i == 0 else -1))
    it.append(P(f'M{0.02 + sh * 1.6:.3f},0.15 L{0.035 + sh * 1.8:.3f},0.22 L{0.0 + sh * 1.6:.3f},0.235', stroke=pal['skin_ln'], sw=lw * 1.1, op=0.8))
    it.append(_mouth(0.0 + sh * 1.3, 0.335, mouth, pal, lw))
    if tear:
        it.append(_tear(ex[0][0] + 0.03, ex[0][1], tear, lw))
    fr = ('M-0.44,0.06 C-0.5,-0.38 -0.24,-0.66 0.04,-0.65 C0.34,-0.64 0.5,-0.4 0.44,0.02 '
          f'L{0.31 + sh:.3f},-0.07 L{0.23 + sh:.3f},-0.24 L{0.13 + sh:.3f},-0.03 L{0.05 + sh:.3f},-0.22 L{-0.05 + sh:.3f},0.07 '
          f'L{-0.12 + sh:.3f},-0.22 L{-0.19 + sh:.3f},-0.03 L{-0.26 + sh:.3f},-0.22 L{-0.34 + sh:.3f},-0.05 Z')
    it.append(P(fr, fill=pal['hair'], stroke=pal['hair_ln'], sw=lw))
    it.append(P('M-0.44,0.0 L-0.47,0.2 L-0.38,0.06 Z M0.44,-0.02 L0.47,0.18 L0.39,0.04 Z', fill=pal['hair'], stroke=pal['hair_ln'], sw=lw))
    it.append(P('M-0.26,-0.42 L-0.18,-0.5 L-0.08,-0.42 L0.02,-0.52 L0.12,-0.43 L0.22,-0.5 L0.3,-0.4', stroke=pal['hair_hl'], sw=lw * 5, op=0.6))
    it.append(P('M0.1,-0.62 L0.22,-0.78 L0.2,-0.6 Z', fill=pal['hair'], stroke=pal['hair_ln'], sw=lw))
    return G(it, transform=f'translate({cx:.1f},{cy:.1f}) scale({facing * s:.2f},{s:.2f})')


def aether_bust(sv, cx, cy, s, facing=1, view='3q', back_shoulder=False, lanyard=False, wet=False, **head):
    """Head + shoulders/torso to below frame. cy = head centre."""
    pal = AE
    lw = 2.4 / s
    it = []
    if back_shoulder or view == 'back':
        it.append(P('M-0.12,0.3 L-0.12,0.7 L0.2,0.7 L0.2,0.3 Z', fill=pal['skin_sh']))
        it.append(P('M-1.8,2.6 L-1.75,1.3 C-1.65,0.95 -1.0,0.72 -0.1,0.66 C0.8,0.72 1.45,0.95 1.55,1.3 L1.6,2.6 Z', fill=pal['shirt'], stroke=pal['shirt_ln'], sw=lw))
        it.append(P('M-0.3,0.7 Q-0.05,0.8 0.25,0.7', stroke=pal['shirt_ln'], sw=lw * 1.5))
        it.append(P('M-0.9,1.2 C-0.6,1.0 -0.3,1.05 0.0,1.3', stroke=pal['shirt_sh'], sw=lw * 6, op=0.7))
    else:
        it.append(P('M-0.12,0.32 L-0.14,0.7 L0.2,0.7 L0.18,0.32 Z', fill=pal['skin_sh']))
        it.append(P('M-1.75,2.6 L-1.7,1.25 C-1.6,0.92 -1.1,0.76 -0.25,0.64 L0.03,0.9 L0.3,0.64 C1.1,0.76 1.6,0.92 1.7,1.25 L1.75,2.6 Z',
                    fill=pal['shirt_sh'] if wet else pal['shirt'], stroke=pal['shirt_ln'], sw=lw))
        it.append(P('M-0.25,0.62 L-0.05,0.95 L0.03,0.9 Z M0.3,0.62 L0.12,0.95 L0.03,0.9 Z', fill='#FFFFFF', stroke=pal['shirt_ln'], sw=lw))
        it.append(P('M-0.03,0.98 L0.1,0.98 L0.16,1.9 L0.04,2.05 L-0.08,1.9 Z', fill=pal['tie'], stroke=pal['tie_sh'], sw=lw))
        it.append(P('M-0.06,0.88 L0.12,0.88 L0.1,1.0 L-0.04,1.0 Z', fill=pal['tie_sh']))
        it.append(P('M-1.0,1.4 C-0.85,1.2 -0.7,1.1 -0.5,1.08 M1.0,1.35 C0.85,1.18 0.7,1.1 0.55,1.08', stroke=pal['shirt_sh'], sw=lw * 5, op=0.8))
        if lanyard:
            it.append(P('M-0.32,0.66 L-0.28,1.5 M0.36,0.66 L0.3,1.5', stroke=pal['lanyard'], sw=lw * 5))
            it.append(R(-0.42, 1.48, 0.84, 0.5, '#FFFFFF', stroke=pal['shirt_ln'], stroke_width=lw))
    return G([G(it, transform=f'translate({cx:.1f},{cy:.1f}) scale({facing * s:.2f},{s:.2f})'),
              aether_head(sv, cx, cy, s, facing, view, **head)])


def aether_figure(sv, x, y_feet, height, facing=1, pose='stand', lanyard=False, head_view='3q', head_facing=None, hand_on_chest=False, **head):
    """Full figure. pose: stand | walk | sit. height = standing height (7 heads)."""
    pal = AE
    s = height / 7.0
    lw = 2.2 / s
    hf = head_facing if head_facing is not None else facing
    it = []
    if pose == 'sit':
        hip = (0, -1.4)
        it.append(P('M-0.35,-1.6 L2.9,-1.5 L3.0,-0.95 L-0.3,-0.95 Z', fill=pal['trousers'], stroke=pal['trousers_sh'], sw=lw))
        it.append(P('M2.75,-1.55 L3.25,-1.6 L3.35,-0.95 L2.85,-0.95 Z', fill=pal['shoes']))
        it.append(P('M-0.65,-1.5 C-0.75,-2.6 -0.55,-3.6 -0.3,-4.0 L0.55,-4.0 C0.75,-3.4 0.7,-2.4 0.55,-1.45 Z', fill=pal['shirt'], stroke=pal['shirt_ln'], sw=lw))
        it.append(P('M0.03,-3.85 L0.12,-3.85 L0.16,-2.9 L0.06,-2.75 L-0.04,-2.9 Z', fill=pal['tie']))
        if hand_on_chest:
            it.append(P('M0.45,-3.7 C0.75,-3.2 0.6,-2.8 0.2,-3.0', stroke=pal['shirt'], sw=lw * 18))
            it.append(C(0.15, -3.05, 0.14, pal['skin'], stroke=pal['skin_ln'], stroke_width=lw))
        else:
            it.append(P('M0.4,-3.8 C0.75,-3.0 0.9,-2.2 1.2,-1.55', stroke=pal['shirt'], sw=lw * 18))
            it.append(C(1.25, -1.5, 0.13, pal['skin'], stroke=pal['skin_ln'], stroke_width=lw))
        it.append(P('M-0.55,-3.8 C-0.95,-3.0 -1.0,-2.2 -0.9,-1.4', stroke=pal['shirt_sh'], sw=lw * 18))
        it.append(C(-0.9, -1.35, 0.13, pal['skin_sh']))
        head_c = (0.05, -4.55)
    else:
        if pose == 'walk':
            legs = 'M-0.15,-3.4 L-0.65,-0.12 L-0.35,-0.05 L0.05,-2.8 L0.5,-0.1 L0.8,-0.15 L0.25,-3.4 Z'
            arms_b = 'M-0.1,-5.6 C-0.45,-4.9 -0.7,-4.4 -0.8,-3.9'
            arms_f = 'M0.15,-5.6 C0.45,-4.9 0.7,-4.4 0.85,-3.95'
        else:
            legs = 'M-0.42,-3.4 L-0.38,-0.1 L-0.05,-0.1 L0.0,-2.9 L0.08,-0.1 L0.42,-0.1 L0.42,-3.4 Z'
            arms_b = 'M-0.62,-5.7 C-0.72,-5.0 -0.75,-4.4 -0.72,-3.8'
            arms_f = 'M0.62,-5.7 C0.72,-5.0 0.78,-4.4 0.74,-3.8'
        it.append(P(legs, fill=pal['trousers'], stroke=pal['trousers_sh'], sw=lw))
        it.append(E(-0.3 if pose == 'stand' else -0.55, -0.06, 0.28, 0.1, pal['shoes']))
        it.append(E(0.3 if pose == 'stand' else 0.7, -0.08, 0.28, 0.1, pal['shoes']))
        it.append(P(arms_b, stroke=pal['shirt_sh'], sw=lw * 18))
        it.append(P('M-0.68,-3.3 C-0.75,-4.6 -0.72,-5.6 -0.4,-5.95 L0.45,-5.95 C0.75,-5.6 0.78,-4.6 0.7,-3.3 Z', fill=pal['shirt'], stroke=pal['shirt_ln'], sw=lw))
        it.append(P('M0.03,-5.85 L0.12,-5.85 L0.17,-4.6 L0.07,-4.45 L-0.03,-4.6 Z', fill=pal['tie']))
        if lanyard:
            it.append(P('M-0.25,-5.9 L-0.12,-4.9 M0.3,-5.9 L0.18,-4.9', stroke=pal['lanyard'], sw=lw * 4))
            it.append(R(-0.18, -4.95, 0.38, 0.26, '#FFFFFF'))
        it.append(P(arms_f, stroke=pal['shirt'], sw=lw * 18))
        it.append(C(-0.78 if pose == 'stand' else -0.82, -3.75, 0.13, pal['skin']))
        it.append(C(0.75 if pose == 'stand' else 0.87, -3.75, 0.13, pal['skin']))
        head_c = (0.05, -6.55)
    body = G(it, transform=f'translate({x:.1f},{y_feet:.1f}) scale({facing * s:.2f},{s:.2f})')
    hx = x + facing * head_c[0] * s
    hy = y_feet + head_c[1] * s
    return G([body, aether_head(sv, hx, hy, s, hf, head_view, **head)])


def elaria_head(sv, cx, cy, s, facing=1, view='3q', eye=0.75, brow='neutral', mouth='soft', look=(0, 0), runes=False, halo=0.0):
    pal = EL
    lw = 2.4 / s
    it = []
    q = 1 if view == '3q' else 0
    sh = 0.07 * q
    it.append(P('M-0.46,0.0 C-0.58,-0.5 -0.25,-0.7 0.0,-0.68 C0.25,-0.7 0.58,-0.5 0.46,0.0 L0.55,1.2 L-0.55,1.2 Z', fill=pal['hair_sh'], stroke=pal['hair_ln'], sw=lw))
    face = ('M-0.34,-0.15 C-0.36,0.22 -0.2,0.45 0.06,0.54 C0.22,0.46 0.33,0.26 0.35,-0.08 C0.35,-0.48 -0.34,-0.5 -0.34,-0.15 Z' if q else
            'M-0.34,-0.12 C-0.35,0.18 -0.22,0.42 0,0.54 C0.22,0.42 0.35,0.18 0.34,-0.12 C0.34,-0.48 -0.34,-0.48 -0.34,-0.12 Z')
    it.append(P(face, fill=pal['skin'], stroke=pal['skin_ln'], sw=lw))
    it.append(P('M-0.28,0.2 C-0.2,0.4 -0.06,0.5 0.06,0.54', stroke=pal['skin_sh'], sw=lw * 4, op=0.45))
    ex = [(-0.15 + sh, 0.05, 0.15), (0.15 + sh * 1.15, 0.05, 0.15 * (0.8 if q else 1))]
    for i, (x, y, w) in enumerate(ex):
        it.append(_eye(sv, x, y, w, pal, eye, look, lash='#6E7590', lw=lw, runes=runes))
        it.append(_brow(x, y - 0.12, w * 1.1, brow, pal['brow'], lw * 0.8, 1 if i == 0 else -1))
    it.append(P(f'M{0.02 + sh * 1.6:.3f},0.17 L{0.03 + sh * 1.8:.3f},0.23', stroke=pal['skin_ln'], sw=lw, op=0.7))
    it.append(_mouth(sh * 1.3, 0.35, mouth, pal, lw, 0.8))
    it.append(P('M-0.4,-0.05 C-0.46,-0.45 -0.2,-0.66 0.0,-0.62 L0.0,-0.4 C-0.12,-0.35 -0.25,-0.2 -0.3,0.1 Z M0.4,-0.05 C0.46,-0.45 0.2,-0.66 0.0,-0.62 '
                'L0.0,-0.4 C0.12,-0.35 0.25,-0.2 0.3,0.1 Z', fill=pal['hair'], stroke=pal['hair_ln'], sw=lw))
    it.append(P('M-0.38,-0.1 C-0.48,0.4 -0.42,1.0 -0.46,1.8 L-0.3,1.8 C-0.3,1.0 -0.32,0.4 -0.3,0.0 Z M0.38,-0.1 C0.48,0.4 0.42,1.0 0.46,1.8 '
                'L0.3,1.8 C0.3,1.0 0.32,0.4 0.3,0.0 Z', fill=pal['hair'], stroke=pal['hair_ln'], sw=lw))
    it.append(P('M-0.3,-0.36 C-0.1,-0.5 0.1,-0.5 0.3,-0.36', stroke='#D8E2FF', sw=lw * 5, op=0.8))
    it.append(P('M-0.33,-0.22 Q0,-0.3 0.33,-0.22', stroke=pal['gold'], sw=lw * 3))
    it.append(P('M0,-0.31 L0.035,-0.25 L0,-0.19 L-0.035,-0.25 Z', fill='#FFF6DE', stroke=pal['gold_sh'], sw=lw))
    it.append(P('M0.2,-0.6 C0.45,-0.85 0.7,-0.7 0.85,-0.95 M-0.25,-0.58 C-0.5,-0.85 -0.75,-0.7 -0.9,-0.9 M0.4,-0.4 C0.7,-0.45 0.85,-0.3 1.0,-0.45',
                stroke=pal['hair'], sw=lw * 1.4, op=0.9))
    out = G(it, transform=f'translate({cx:.1f},{cy:.1f}) scale({facing * s:.2f},{s:.2f})')
    if halo:
        out = G([C(cx, cy - 0.1 * s, 0.95 * s, pal['glow'], op=0.35 * halo, filt='url(#b24)'),
                 C(cx, cy - 0.1 * s, 0.8 * s, 'none', op=0.7 * halo, stroke=pal['glow'], stroke_width=4, filt='url(#glow)'), out])
    if runes:
        out = G([C(cx + facing * (-0.15 + 0.07) * s, cy + 0.05 * s, 0.16 * s, pal['glow'], op=0.45, filt='url(#b14)'),
                 C(cx + facing * (0.15 + 0.08) * s, cy + 0.05 * s, 0.13 * s, pal['glow'], op=0.45, filt='url(#b14)'), out])
    return out


def elaria_hair_back(cx, top_y, s, length, spread=1.0, sway=0.0):
    pal = EL
    w = 0.6 * spread
    d = (f'M{-0.45:.2f},0 C{-0.9 * spread:.2f},{length * 0.3:.2f} {-w - 0.5 + sway:.2f},{length * 0.7:.2f} {-w - 0.3 + sway * 1.5:.2f},{length:.2f} '
         f'Q{-0.2 + sway:.2f},{length * 0.94:.2f} {0.1 + sway:.2f},{length * 1.02:.2f} Q{0.4 + sway:.2f},{length * 0.95:.2f} {w + 0.4 + sway * 1.5:.2f},{length:.2f} '
         f'C{w + 0.6 + sway:.2f},{length * 0.7:.2f} {0.9 * spread:.2f},{length * 0.3:.2f} {0.45:.2f},0 Z')
    return G([P(d, fill=pal['hair_sh'], stroke=pal['hair_ln'], sw=2.4 / s),
              P(f'M-0.2,0.2 C{-0.3 + sway:.2f},{length * 0.5:.2f} {-0.2 + sway:.2f},{length * 0.8:.2f} {-0.1 + sway:.2f},{length * 0.95:.2f}', stroke='#FFFFFF', sw=0.03, op=0.5),
              P(f'M0.25,0.2 C{0.35 + sway:.2f},{length * 0.5:.2f} {0.3 + sway:.2f},{length * 0.8:.2f} {0.35 + sway:.2f},{length * 0.95:.2f}', stroke='#FFFFFF', sw=0.03, op=0.5)],
             transform=f'translate({cx:.1f},{top_y:.1f}) scale({s:.2f},{s:.2f})')


def elaria_figure(sv, x, y_feet, height, facing=1, arm=None, glow=1.0, sway=0.3, **head):
    """Full Elaria (8 heads), hovering. arm: None | 'reach' | 'bless' | 'hold' (hand toward facing side)."""
    pal = EL
    s = height / 8.0
    lw = 2.2 / s
    head_c = (0.0, -7.5)
    items = []
    if glow:
        items.append(E(x, y_feet - height * 0.45, height * 0.42, height * 0.6, pal['glow'], op=0.28 * glow, filt='url(#b40)'))
        items.append(E(x, y_feet + 6, s * 0.9, s * 0.18, pal['glow'], op=0.8 * glow, filt='url(#b8)'))
    items.append(elaria_hair_back(x, y_feet + head_c[1] * s - 0.1 * s, s, 7.2, 1.3, sway * facing))
    it = []
    it.append(P('M-0.55,-6.6 C-0.9,-5.0 -1.2,-2.0 -1.5,-0.2 Q0,0.1 1.5,-0.2 C1.2,-2.0 0.9,-5.0 0.55,-6.6 Z', fill=pal['gown'], stroke=pal['gown_ln'], sw=lw))
    it.append(P('M-0.2,-6.3 C-0.4,-4 -0.6,-2 -0.8,-0.2 M0.25,-6.3 C0.45,-4 0.6,-2 0.75,-0.2', stroke=pal['gown_sh'], sw=lw * 6, op=0.8))
    it.append(P('M-0.6,-6.7 C-1.1,-5.6 -1.15,-4.6 -0.95,-3.6 L-0.55,-3.9 C-0.6,-4.9 -0.5,-5.8 -0.2,-6.6 Z M0.6,-6.7 C1.1,-5.6 1.15,-4.6 0.95,-3.6 '
                'L0.55,-3.9 C0.6,-4.9 0.5,-5.8 0.2,-6.6 Z', fill=pal['gown'], stroke=pal['gold'], sw=lw * 3))
    it.append(P('M-0.42,-4.55 Q0,-4.4 0.42,-4.55 M0.0,-4.45 L-0.08,-3.3 M0.04,-4.45 L0.12,-3.2', stroke=pal['gold'], sw=lw * 3))
    it.append(P('M-1.5,-0.2 Q0,0.1 1.5,-0.2', stroke=pal['gold'], sw=lw * 4))
    if arm in (None, 'hold'):
        it.append(P('M-0.62,-6.4 C-0.9,-5.4 -1.0,-4.6 -1.15,-3.7 L-0.75,-3.6 Z', fill=pal['gown_sh'], stroke=pal['gown_ln'], sw=lw))
    if arm is None:
        it.append(P('M0.62,-6.4 C0.9,-5.4 1.0,-4.6 1.15,-3.7 L0.75,-3.6 Z', fill=pal['gown_sh'], stroke=pal['gown_ln'], sw=lw))
    elif arm == 'reach':
        it.append(P('M0.55,-6.3 C1.0,-5.6 1.4,-5.0 2.0,-4.9', stroke=pal['gown'], sw=lw * 22))
        it.append(P('M1.95,-5.1 L2.35,-5.05 L2.3,-4.85 L1.95,-4.8 Z', fill=pal['gold']))
        it.append(E(2.55, -4.95, 0.28, 0.1, pal['skin'], stroke=pal['skin_ln'], stroke_width=lw))
    elif arm == 'bless':
        it.append(P('M-0.55,-6.3 C-1.0,-6.4 -1.3,-6.9 -1.45,-7.5', stroke=pal['gown'], sw=lw * 22))
        it.append(E(-1.5, -7.85, 0.13, 0.25, pal['skin'], stroke=pal['skin_ln'], stroke_width=lw))
        items.append(C(x - facing * 1.5 * s, y_feet - 7.9 * s, 0.5 * s, pal['glow'], op=0.7, filt='url(#b14)'))
    if arm == 'hold':
        it.append(P('M0.55,-6.3 C0.9,-5.4 1.2,-4.8 1.7,-4.5', stroke=pal['gown'], sw=lw * 22))
        it.append(C(1.85, -4.45, 0.15, pal['skin'], stroke=pal['skin_ln'], stroke_width=lw))
    items.append(G(it, transform=f'translate({x:.1f},{y_feet:.1f}) scale({facing * s:.2f},{s:.2f})'))
    items.append(elaria_head(sv, x + facing * head_c[0] * s, y_feet + head_c[1] * s, s, facing, **head))
    return G(items)


def elaria_bust(sv, cx, cy, s, facing=1, arm=None, glow=1.0, sway=0.2, **head):
    pal = EL
    lw = 2.4 / s
    items = []
    if glow:
        items.append(C(cx, cy + s * 0.8, s * 2.4, pal['glow'], op=0.25 * glow, filt='url(#b40)'))
    items.append(elaria_hair_back(cx, cy - 0.1 * s, s, 4.5, 1.6, sway * facing))
    it = [P('M-1.5,3.2 C-1.4,1.4 -0.9,0.75 -0.3,0.62 L0.3,0.62 C0.9,0.75 1.4,1.4 1.5,3.2 Z', fill=pal['gown'], stroke=pal['gown_ln'], sw=lw),
          P('M-0.12,0.3 L-0.14,0.68 L0.18,0.68 L0.16,0.3 Z', fill=pal['skin_sh']),
          P('M-0.4,0.66 Q0,0.95 0.42,0.66', stroke=pal['gold'], sw=lw * 3, fill='none'),
          P('M-1.3,1.4 C-0.9,0.9 -0.5,0.75 -0.3,0.7 L-0.55,3.2 M1.3,1.4 C0.9,0.9 0.5,0.75 0.3,0.7 L0.55,3.2', stroke=pal['gold'], sw=lw * 3)]
    if arm == 'reach':
        it.append(P('M0.9,1.2 C1.4,1.5 1.7,1.6 2.2,1.55', stroke=pal['gown'], sw=lw * 60))
        it.append(P('M2.1,1.38 L2.4,1.38 L2.4,1.72 L2.1,1.72 Z', fill=pal['gold']))
        it.append(P('M2.4,1.5 C2.7,1.35 3.0,1.4 3.15,1.55 C3.0,1.75 2.65,1.8 2.4,1.7 Z', fill=pal['skin'], stroke=pal['skin_ln'], sw=lw))
    items.append(G(it, transform=f'translate({cx:.1f},{cy:.1f}) scale({facing * s:.2f},{s:.2f})'))
    items.append(elaria_head(sv, cx, cy, s, facing, **head))
    return G(items)


def baby_head(sv, cx, cy, s, eye=1.0, mouth='soft', small_pupil=False, squeeze=False, blur=0):
    pal = dict(AE)
    lw = 2.4 / s
    it = [E(0, 0.05, 0.62, 0.58, pal['skin'], stroke=pal['skin_ln'], stroke_width=lw),
          E(-0.36, 0.25, 0.1, 0.06, '#F2B8A8', op=0.6), E(0.36, 0.25, 0.1, 0.06, '#F2B8A8', op=0.6),
          P('M-0.3,-0.45 C-0.15,-0.56 0.15,-0.56 0.3,-0.45', stroke=pal['hair'], sw=lw * 7, op=0.75),
          P('M0.02,-0.52 C-0.06,-0.7 0.12,-0.76 0.12,-0.64 C0.12,-0.58 0.05,-0.6 0.06,-0.65', stroke=pal['hair'], sw=lw * 3)]
    for i, x in enumerate((-0.22, 0.22)):
        if squeeze:
            it.append(P(f'M{x - 0.08:.2f},0.08 L{x + 0.02 * (1 if i == 0 else -1):.2f},0.11 L{x + 0.08:.2f},0.08', stroke=pal['hair_ln'], sw=lw * 2.4))
        else:
            it.append(_eye(sv, x, 0.1, 0.2, pal, eye, (0, 0), lw=lw, small_pupil=small_pupil))
    it.append(P('M0,0.26 L0.02,0.3', stroke=pal['skin_ln'], sw=lw, op=0.7))
    it.append(_mouth(0, 0.42, mouth, pal, lw, 0.6))
    return G(G(it, transform=f'translate({cx:.1f},{cy:.1f}) scale({s:.2f},{s:.2f})'), filt=f'url(#b{blur})' if blur else None)


def baby_hand(cx, cy, s, grasp=0.5, blur=0):
    """Tiny newborn hand reaching up out of the wrap sleeve. grasp 0 = open, 1 = closed."""
    pal = AE
    lw = 2.4 / s
    it = [P('M-0.32,1.0 L-0.26,0.25 Q0,0.12 0.26,0.25 L0.32,1.0 Z', fill=BABY['wrap'], stroke=BABY['wrap_ln'], sw=lw),
          P('M-0.27,0.28 Q0,0.4 0.27,0.28', stroke=BABY['wrap_sh'], sw=lw * 3),
          P('M-0.2,0.3 C-0.24,0.05 -0.22,-0.12 -0.1,-0.2 L0.14,-0.2 C0.24,-0.1 0.24,0.1 0.2,0.3 Z', fill=pal['skin'], stroke=pal['skin_ln'], sw=lw)]
    for i, x in enumerate((-0.12, -0.04, 0.04, 0.12)):
        ln = (0.2 + 0.04 * (1 - abs(i - 1.5) / 1.5)) * (1 - 0.6 * grasp)
        it.append(P(f'M{x:.2f},-0.16 l{x * 0.3:.3f},{-ln:.3f}', stroke=pal['skin'], sw=0.075))
        it.append(P(f'M{x:.2f},-0.16 l{x * 0.3:.3f},{-ln:.3f}', stroke=pal['skin_ln'], sw=lw * 0.6, op=0.35))
    it.append(P('M-0.2,0.0 l-0.12,-0.12', stroke=pal['skin'], sw=0.08))
    return G(G(it, transform=f'translate({cx:.1f},{cy:.1f}) scale({s:.2f},{s:.2f})'), filt=f'url(#b{blur})' if blur else None)


def baby_body(sv, cx, cy, s):
    """Swaddled baby lying, head at (cx,cy)."""
    return G([E(cx + s * 0.1, cy + s * 1.2, s * 0.9, s * 1.05, BABY['wrap'], stroke=BABY['wrap_ln'], stroke_width=2),
              P(f'M{cx - s * 0.7:.0f},{cy + s * 0.7:.0f} Q{cx:.0f},{cy + s * 1.1:.0f} {cx + s * 0.8:.0f},{cy + s * 0.6:.0f}', stroke=BABY['wrap_sh'], sw=s * 0.12),
              baby_head(sv, cx, cy, s)])


def light_overlay(sv, cx, cy, col, op, r=0.7):
    return R(0, 0, W, H, sv.rg([(0, col, op), (1, col, 0)], cx=cx, cy=cy, r=r))
