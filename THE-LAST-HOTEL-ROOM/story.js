// Timeline: the single source of truth for picture, events, captions and mix.
// Coordinates are local to each set (world.js SET offsets); yaw 0 = facing −z, +yaw = turning left.
import { track, monotone } from '/core/lib.js';
import { SET } from './world.js';

export const DUR = 44.0;
export const T = {
  rollIn: .4, flash: .9, winOn: 2.6, g1: 3.25, zoom1: [3.7, 4.7],
  tear1: [6.95, 7.5], tick1: 7.5, pan: [9.6, 11.9], zoom2: [12.0, 12.8],
  tear2: [13.35, 13.9], flick: [16.9, 17.25, 17.55], stop: 21.0, push: [21.2, 25.2], g2: 22.6,
  door: [25.4, 26.8], waltz: 25.7, ring: 27.0, turnPhone: [30.9, 32.0], zoom3: [32.0, 33.0], ringStop: 33.72,
  hush: [33.75, 35.1], v1: 35.25, turnBack: [38.55, 39.4], recOff: 39.4, title: [40.0, 44.0],
};
export const LINES = [{ id: 'g1', t: T.g1, who: 'ME' }, { id: 'g2', t: T.g2, who: 'ME' }, { id: 'v1', t: T.v1, who: 'V' }];
export const setAt = t => t < 7.2 ? 'ext' : t < 13.6 ? 'lobby' : 'hall';

// —— camera (set-local) ——
const E = SET.ext, L = SET.lobby, Hh = SET.hall;
const P = (o, x, z) => [o.x + x, o.z + z];
export const POS = track([
  [0, P(E, .2, 5.2)], [.8, P(E, .2, 5.1)], [2.3, P(E, .1, 2.6)], [7.2, P(E, .1, 2.4)],
  [7.21, P(L, .3, -2.6)], [13.6, P(L, .25, -3.1)],
  [13.61, P(Hh, 0, 1.2)], [14.4, P(Hh, 0, .9)], [21.0, P(Hh, .05, -8.3)], [25.2, P(Hh, .04, -9.45)],
  [26.6, P(Hh, .04, -9.6)], [28.6, P(Hh, .1, -11.55)], [44, P(Hh, .1, -11.55)],
]);
const PI = Math.PI;
export const YAW = monotone([
  [0, 0], [1.6, 0], [2.4, -.42], [3.6, -.48], [7.2, -.49],
  [7.21, .27], [9.6, .26], [11.9, -.22], [13.6, -.23],
  [13.61, 0], [21.0, 0], [28.6, 0], [30.9, .02], [32.0, -1.02], [38.55, -1.02], [39.4, -.55], [44, -.55],
]);
export const PITCH = monotone([
  [0, .05], [1.0, .12], [1.6, .2], [2.4, .6], [3.6, .7], [7.2, .7],
  [7.21, .02], [9.6, .03], [11.9, .02], [13.6, .02],
  [13.61, -.03], [21.0, -.04], [25.2, -.02], [28.6, -.08], [30.9, -.1], [32.0, -.33], [38.55, -.33], [39.4, -.18], [44, -.18],
]);
export const CAMH = t => 0;
// vertical field of view (degrees) of the 9:16 frame
export const FOV = monotone([[0, 64], [T.zoom1[0], 64], [T.zoom1[1], 26], [7.2, 26], [7.21, 60], [T.zoom2[0], 60], [T.zoom2[1], 44], [13.6, 44],
  [13.61, 62], [28.6, 62], [T.zoom3[0], 62], [T.zoom3[1], 36], [44, 36]]);
// autofocus distance (m): hunting = racking with overshoot
export const FOCUS = monotone([
  [0, .4], [.5, 2], [.9, 1.2], [2.6, 2.2], [3.7, 3], [4.1, 40], [4.35, 6], [4.6, 22], [7.2, 22],
  [7.21, 1], [7.7, 9], [8.0, 6.8], [12.0, 6.8], [12.3, 3], [12.6, 8.5], [12.8, 6.9], [13.6, 6.9],
  [13.61, 6], [21, 3.2], [22.0, 1.6], [25.2, 1.4], [26.8, 2.5], [28.6, 2.2], [32.0, 2.4], [32.3, .6], [32.55, 3.6], [32.8, 2.25], [44, 2.25],
]);
export const APER = monotone([[0, 3], [T.zoom1[0], 3], [T.zoom1[1], 12], [7.2, 12], [7.21, 3], [T.zoom2[1], 6], [13.6, 6], [13.61, 3], [T.zoom3[0], 3], [T.zoom3[1], 9], [44, 9]]);
export const FEAR = monotone([[0, .15], [2.6, .25], [5, .4], [7.2, .3], [13.6, .35], [17, .55], [21, .6], [25.4, .75], [28, .6], [31, .8], [33.7, .9], [35.2, .95], [38.5, 1], [44, 1]]);
export const SPEED_HINT = 1;   // walking speeds come from POS
// OSD: the tape's date is 1985 (the year the hotel closed) — evidence, not dialogue
export const clock = t => t < T.tear1[0] + .3 ? 'AM  2:13' : t < T.tear2[0] + .3 ? 'AM  2:21' : 'AM  3:09';
export const DATE = 'NOV.12.1985';
export const battery = t => t < T.tear2[0] + .3 ? 3 : 2;
// telephone: British-style double ring (0.4 on, 0.2 off, 0.4 on, 2.0 off), cut mid-ring
export const ringing = t => { if (t < T.ring || t >= T.ringStop) return false; const p = (t - T.ring) % 3.0; return p < .4 || (p > .6 && p < 1.0); };
