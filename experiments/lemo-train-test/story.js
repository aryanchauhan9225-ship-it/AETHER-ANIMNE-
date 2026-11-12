// Timeline: single source of truth for picture, events and mix.
export const DUR = 10.0, FPS = 24, BPM = 90, BEAT = 60 / BPM;
export const SHOTS = [[0, 3, 'wide'], [3, 6, 'pass'], [6, 8, 'close'], [8, 10, 'door']];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
export const q12 = t => Math.floor(t * 12 + 1e-6) / 12;   // characters on twos
export const q8 = t => Math.floor(t * 8 + 1e-6) / 8;      // acting on threes
export const T = { light: 1.2, turn: 2.4, horn: 3.0, brake: 5.6, stop: 7.6, doorOpen: 8.4, doorFull: 9.2, chin: 9.2 };
// Train kinematics (shared by shots 2-4): nose position along the track in px at shot-2 scale, decelerating to a stop at T.stop
const V0 = 2800, TS = T.stop - T.horn;
export function trainX(t) { const lt = Math.min(Math.max(t - T.horn, 0), TS); return V0 * TS / 2.6 * (1 - Math.pow(1 - lt / TS, 2.6)); }
export function trainV(t) { const lt = t - T.horn; if (lt < 0 || lt >= TS) return 0; return V0 * Math.pow(1 - lt / TS, 1.6); }
