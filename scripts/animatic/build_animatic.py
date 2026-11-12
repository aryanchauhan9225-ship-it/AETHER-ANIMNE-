#!/usr/bin/env python3
"""Build the AETHER Ep01 animatic (v0) with the system FFmpeg. No other installs needed.

  python3 scripts/animatic/build_animatic.py                # full build
  python3 scripts/animatic/build_animatic.py --skip-panels  # don't regenerate SVG panels first
  python3 scripts/animatic/build_animatic.py --jobs 2       # fewer parallel ffmpeg processes

Pipeline (all timing from story/ep01/shotlist.yaml):
  1. panels    regenerate code-drawn SVG layout panels (gen_panels.py)
  2. raster    panel -> 3840x2160 PNG. A drawn panel story/ep01/storyboard/<id>.png wins over <id>.svg
  3. segments  one clip per panel: camera move (zoompan, eased), fades, exact frame count
  4. audio     TEMPORARY placeholder audio (synth tones for each line, drone bed, SFX blips)
  5. subs      Hindi subtitles + panel labels (ASS, rendered by libass with correct Devanagari shaping)
  6. master    concat + subtitles + timecode -> renders/ep01_animatic_v0.mp4
  7. verify    frame count / duration / streams, contact sheet

Work files go to renders/ep01_animatic_v0/ (git-ignored). Nothing here is final art or final audio.
"""
import argparse
import array
import json
import math
import os
import random
import shutil
import subprocess
import sys
import wave
from concurrent.futures import ThreadPoolExecutor

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SHOTLIST = os.path.join(ROOT, 'story', 'ep01', 'shotlist.yaml')
BOARDS = os.path.join(ROOT, 'story', 'ep01', 'storyboard')
WORK = os.path.join(ROOT, 'renders', 'ep01_animatic_v0')
OUT = os.path.join(ROOT, 'renders', 'ep01_animatic_v0.mp4')
FPS, TOTAL, SR = 24, 1200, 48000
RW, RH = 3840, 2160


def run(cmd, cwd=None):
    r = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if r.returncode:
        sys.exit(f'command failed ({r.returncode}): {" ".join(cmd)}\n{r.stderr[-2000:]}')
    return r.stdout


def ffmpeg(*args, cwd=None):
    return run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error', '-y', *args], cwd=cwd)


def load():
    d = yaml.safe_load(open(SHOTLIST, encoding='utf-8'))
    panels = d['panels']
    prev = 0
    for p in panels:
        if p['start'] != prev or p['end'] <= p['start']:
            sys.exit(f"panel timing broken at {p['id']}")
        prev = p['end']
    if prev != TOTAL:
        sys.exit(f'panels cover {prev} frames, expected {TOTAL}')
    return d, panels


# ------------------------------------------------------------------------------------------ 2 raster
def raster(panels, jobs):
    os.makedirs(os.path.join(WORK, 'png'), exist_ok=True)

    def one(p):
        src_png = os.path.join(BOARDS, p['id'] + '.png')
        src = src_png if os.path.exists(src_png) else os.path.join(BOARDS, p['id'] + '.svg')
        dst = os.path.join(WORK, 'png', p['id'] + '.png')
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
            return 'cached'
        ffmpeg('-i', src, '-vf', f'scale={RW}:{RH}:force_original_aspect_ratio=decrease,pad={RW}:{RH}:(ow-iw)/2:(oh-ih)/2:color=black',
               '-frames:v', '1', dst)
        return 'drawn' if src == src_png else 'layout'

    with ThreadPoolExecutor(jobs) as ex:
        res = list(ex.map(one, panels))
    print(f"  raster: {res.count('layout')} layout, {res.count('drawn')} drawn, {res.count('cached')} cached")


# ------------------------------------------------------------------------------------------ 3 segments
def zoompan_expr(p):
    n = p['end'] - p['start']
    cam = p.get('cam') or {}
    z0, z1 = cam.get('z', [1.0, 1.0])
    (cx0, cy0), (cx1, cy1) = cam.get('c', [[0, 0], [0, 0]])
    shake = float(cam.get('shake', 0)) * 2  # input pixels are 2x output pixels
    t = f'min(on/{max(n - 1, 1)},1)'
    ease = f'(3*pow({t},2)-2*pow({t},3))'
    z = f'{z0}+({z1}-({z0}))*{ease}'
    x = f'iw*(0.5+({cx0})+(({cx1})-({cx0}))*{ease})-iw/zoom/2+{shake}*sin(on*1.9)'
    y = f'ih*(0.5+({cy0})+(({cy1})-({cy0}))*{ease})-ih/zoom/2+{shake}*cos(on*2.3)'
    return f"zoompan=z='{z}':x='{x}':y='{y}':d={n}:s=1920x1080:fps={FPS}"


def segments(panels, jobs):
    os.makedirs(os.path.join(WORK, 'seg'), exist_ok=True)

    def one(p):
        n = p['end'] - p['start']
        vf = [zoompan_expr(p)]
        fade = p.get('fade') or {}
        k = int(fade.get('f', 0))
        if 'in' in fade:
            vf.append(f"fade=t=in:s=0:n={k}:c={fade['in']}")
        if 'out' in fade:
            vf.append(f"fade=t=out:s={n - k}:n={k}:c={fade['out']}")
        vf.append('format=yuv420p')
        ffmpeg('-i', os.path.join(WORK, 'png', p['id'] + '.png'), '-vf', ','.join(vf), '-frames:v', str(n),
               '-r', str(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-g', str(FPS),
               os.path.join(WORK, 'seg', p['id'] + '.mp4'))

    with ThreadPoolExecutor(jobs) as ex:
        list(ex.map(one, panels))
    with open(os.path.join(WORK, 'segments.txt'), 'w') as fh:
        fh.writelines(f"file 'seg/{p['id']}.mp4'\n" for p in panels)
    print(f'  segments: {len(panels)}')


# ------------------------------------------------------------------------------------------ 4 placeholder audio
def placeholder_audio(data):
    """TEMP audio only: tones that mark who speaks and for how long, a drone that follows the
    colour script, and short blips at key SFX moments (story/ep01/sound-timeline.md)."""
    n = int(TOTAL / FPS * SR)
    buf = array.array('f', [0.0]) * n
    tau = 2 * math.pi

    def span(f0, f1):
        return int(f0 / FPS * SR), min(n, int(f1 / FPS * SR))

    def env(i, a, b, fade):
        return min(1.0, (i - a) / fade, (b - i) / fade) if fade else 1.0

    def add(f0, f1, fn, fade_s=0.05):
        a, b = span(f0, f1)
        fd = int(fade_s * SR)
        for i in range(a, b):
            buf[i] += fn((i - a) / SR, i / SR) * env(i, a, b, fd)

    # drone bed per scene (frequencies in Hz), quiet
    beds = [(0, 96, (55, 82.4, 110), 0.05), (96, 248, (73.4, 87.3, 110), 0.04), (264, 552, (82.4, 123.5, 207.7, 233.1), 0.045),
            (552, 744, (65.4, 98, 155.6), 0.04), (744, 876, (82.4, 123.5, 207.7), 0.045), (876, 1032, (130.8, 164.8, 196, 261.6), 0.05),
            (1072, 1200, (196, 246.9, 293.7), 0.035)]
    for f0, f1, freqs, amp in beds:
        add(f0, f1, lambda t, T, fr=freqs, a=amp: a * sum(math.sin(tau * f * T) for f in fr) / len(fr) * (0.8 + 0.2 * math.sin(tau * 0.2 * T)), 0.4)
    # rain noise (SC2)
    rnd = random.Random(1)
    a, b = span(96, 248)
    y = 0.0
    for i in range(a, b):
        y += 0.15 * (rnd.uniform(-1, 1) - y)
        buf[i] += 0.12 * y * env(i, a, b, 2400)
    # dialogue placeholders: buzzy tone with a ~4 syllables/s envelope; pitch marks the speaker
    voice = {'aether': 130.0, 'aether_vo': 120.0, 'aether_inner': 150.0, 'elaria': 220.0}
    for s in data['shots']:
        for ln in s['dialogue']:
            f0 = voice.get(ln['speaker'], 160.0)
            add(ln['start'], ln['end'], lambda t, T, f=f0: 0.16 * (0.5 - 0.5 * math.cos(tau * 4.2 * t)) *
                sum(math.sin(tau * f * k * (1 + 0.03 * math.sin(tau * 0.7 * t)) * t) / k for k in (1, 2, 3, 4)) / 1.6)
    # SFX blips
    bell = lambda fr, amp, dec: (lambda t, T: amp * math.exp(-t / dec) * (math.sin(tau * fr * t) + 0.4 * math.sin(tau * 2 * fr * t)))  # noqa: E731
    add(24, 96, bell(1320, 0.14, 0.9), 0.005)                                                           # star ignition
    add(236, 248, lambda t, T: 0.1 * (t / 0.5) * math.sin(tau * (500 + 2000 * t / 0.5) * t), 0.01)  # white light riser
    add(414, 430, bell(2600, 0.07, 0.25), 0.005)                                                        # particle touch
    add(420, 484, lambda t, T: 0.025 * sum(math.sin(tau * f * t) for f in (3000, 3700, 4400)) * (0.5 + 0.5 * math.sin(tau * 9 * t)), 0.3)
    add(600, 630, lambda t, T: 0.06 * math.sin(tau * 70 * t), 0.2)                                     # Divine Knowledge hum
    add(972, 1032, lambda t, T: 0.06 * (t / 2.5) * math.sin(tau * (300 + 400 * t) * t), 0.1)          # magic circle rise
    rnd2 = random.Random(2)
    add(1032, 1056, lambda t, T: 0.14 * rnd2.uniform(-1, 1) * math.sin(math.pi * t / 1.0), 0.02)      # whoosh
    add(1084, 1100, lambda t, T: 0.07 * math.sin(tau * (420 + 30 * math.sin(tau * 6 * t)) * t) * (0.5 - 0.5 * math.cos(tau * 1.5 * t)), 0.05)  # cry
    for k, fr in enumerate((784, 988, 1175)):                                                           # title chime
        add(1152 + k * 3, 1200, bell(fr, 0.08, 1.0), 0.005)
    rnd3 = random.Random(3)
    add(1168, 1170, lambda t, T: 0.1 * rnd3.uniform(-1, 1), 0.005)                                       # sneeze
    # absolute silences (sound-timeline.md cues 9 and 25)
    for f0, f1 in ((248, 264), (1068, 1072)):
        a, b = span(f0, f1)
        for i in range(a, b):
            buf[i] = 0.0
    peak = max(abs(v) for v in buf) or 1.0
    g = 0.7 / peak
    pcm = array.array('h', (int(max(-1, min(1, v * g)) * 32767) for v in buf))
    path = os.path.join(WORK, 'temp_audio.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print('  audio: placeholder tones written')
    return path


# ------------------------------------------------------------------------------------------ 5 subtitles
def ts(frame):
    cs = round(frame / FPS * 100)
    return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'


def subtitles(data, panels):
    head = ('[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nWrapStyle: 0\n\n'
            '[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, '
            'Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'
            'Style: Sub,FreeSans,56,&H00DCF4FF,&H000000FF,&H00141414,&H64000000,0,0,0,0,100,100,0,0,1,3.2,1.5,2,80,80,58,1\n'
            'Style: SubVO,FreeSans,56,&H00DCF4FF,&H000000FF,&H00141414,&H64000000,0,1,0,0,100,100,0,0,1,3.2,1.5,2,80,80,58,1\n'
            'Style: Label,FreeSans,26,&H00FFFFFF,&H000000FF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,3,6,0,7,26,26,22,1\n'
            'Style: Mark,FreeSans,24,&H00FFFFFF,&H000000FF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,3,6,0,9,26,26,22,1\n\n'
            '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')
    ev = [f'Dialogue: 1,{ts(0)},{ts(TOTAL)},Mark,,0,0,0,,AETHER Ep01 · ANIMATIC v0 · layout panels · TEMP AUDIO']
    shots = {s['id']: s for s in data['shots']}
    for p in panels:
        lvl = shots[p['shot']]['level']
        ev.append(f"Dialogue: 1,{ts(p['start'])},{ts(p['end'])},Label,,0,0,0,,{p['id']}  ·  {lvl}  ·  {p['desc']}")
    for s in data['shots']:
        for ln in s['dialogue']:
            style = 'Sub' if ln['on_screen'] else 'SubVO'
            ev.append(f"Dialogue: 0,{ts(ln['start'])},{ts(ln['end'] + 6)},{style},,0,0,0,,{ln['hi']}")
    path = os.path.join(WORK, 'subs.ass')
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(head + '\n'.join(ev) + '\n')
    print(f'  subs: {sum(len(s["dialogue"]) for s in data["shots"])} Hindi lines, {len(panels)} labels')


# ------------------------------------------------------------------------------------------ 6 master
def master():
    font = run(['fc-match', '-f', '%{file}', 'FreeMono']).strip()
    tc = (f"drawtext=fontfile={font}:timecode='00\\:00\\:00\\:00':rate={FPS}:x=w-tw-26:y=64:fontsize=26:"
          "fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=6")
    ffmpeg('-f', 'concat', '-safe', '0', '-i', 'segments.txt', '-i', 'temp_audio.wav',
           '-filter_complex', f'[0:v]ass=subs.ass,{tc},format=yuv420p[v]', '-map', '[v]', '-map', '1:a',
           '-frames:v', str(TOTAL), '-r', str(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
           '-c:a', 'aac', '-b:a', '192k', '-ar', str(SR), '-t', str(TOTAL / FPS), '-movflags', '+faststart', OUT, cwd=WORK)


# ------------------------------------------------------------------------------------------ 7 verify
def verify(panels):
    info = json.loads(run(['ffprobe', '-v', 'error', '-count_frames', '-show_entries',
                           'stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,duration:format=duration',
                           '-of', 'json', OUT]))
    v = next(s for s in info['streams'] if s['codec_type'] == 'video')
    a = next((s for s in info['streams'] if s['codec_type'] == 'audio'), None)
    frames = int(v['nb_read_frames'])
    ok = frames == TOTAL and v['width'] == 1920 and v['height'] == 1080 and v['r_frame_rate'] == '24/1' and a is not None
    sel = '+'.join(f"eq(n\\,{(p['start'] + p['end']) // 2})" for p in panels)
    sheet = os.path.join(ROOT, 'renders', 'ep01_animatic_v0_contact.png')
    ffmpeg('-i', OUT, '-vf', f"select='{sel}',scale=384:216,tile=5x8:padding=4:color=white", '-frames:v', '1', '-vsync', 'vfr', sheet)
    report = {'file': os.path.relpath(OUT, ROOT), 'video': f"{v['codec_name']} {v['width']}x{v['height']} @ {v['r_frame_rate']}",
              'frames': frames, 'duration_s': float(info['format']['duration']),
              'audio': f"{a['codec_name']} {float(a['duration']):.3f}s" if a else None,
              'size_mb': round(os.path.getsize(OUT) / 1e6, 2), 'contact_sheet': os.path.relpath(sheet, ROOT), 'ok': ok}
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if not ok:
        sys.exit('verification FAILED')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--skip-panels', action='store_true', help='do not regenerate the SVG layout panels')
    ap.add_argument('--jobs', type=int, default=4)
    a = ap.parse_args()
    for tool in ('ffmpeg', 'ffprobe', 'fc-match'):
        if not shutil.which(tool):
            sys.exit(f'{tool} not found')
    data, panels = load()
    os.makedirs(WORK, exist_ok=True)
    if not a.skip_panels:
        print('1/7 panels')
        sys.path.insert(0, HERE)
        import gen_panels
        gen_panels.main()
    print('2/7 raster');  raster(panels, a.jobs)
    print('3/7 segments'); segments(panels, a.jobs)
    print('4/7 audio');   placeholder_audio(data)
    print('5/7 subs');    subtitles(data, panels)
    print('6/7 master');  master()
    print('7/7 verify');  verify(panels)


if __name__ == '__main__':
    main()
