# THE LAST HOTEL ROOM — asset references

No image generator, stock footage or photographs were used. Every visual is real-time 3D drawn in code (three.js)
through Lemo-Opuscar's Liminal Found Footage camcorder pipeline.

## Character
**The night guard** — never seen, by design: he holds the camera (first-person found footage). His identity is carried
by one consistent voice (`hm_omega`, whispered and close-mic), his breathing (rate follows a fear curve), his torch
(a warm 5300 K spot, below-right of the lens, lagging the camera slightly) and his walking gait (0.7 m stride).
This is also how the brief's "consistent face" requirement is met honestly: a primitive-built 3D figure would read as a
toy (style pitfall) and would not stay consistent.

## Environment (all procedural, `world.js` + `tex.js`)
| Set | Built from |
|---|---|
| Exterior | Four-storey ashlar façade (procedural stone with soot streaks), 33 windows (dark glass, one emissive: 309), cornice and bands, entrance doors + canopy, two lamps (one dead, one flickering), wet paving with puddle mask and rain-ripple normals, 5,200 rain streaks wrapping around the camera, lightning |
| Lobby | Black-and-cream marble, mahogany wainscot, dark-gold damask wallpaper, reception desk with marble top and brass bell, grandfather clock (dial at 3:09, swinging pendulum, ticking seconds hand), key rack 301–312 with 309 missing, dust-sheeted chairs, dead chandelier, three rain-lit windows |
| Corridor | Maroon runner carpet, damask + wainscot + dado rail, six doors with brass plates 301–306, eight brass sconces (six dead, one flickering, one alive), end wall with the 309 door (hinged, brass plate, knob), light blade on the carpet |
| Room 309 | Round table with linen, two chairs, place settings and wine glasses, two candles with flickering flames and haze, red rotary telephone (handset rattles), wooden radio with glowing dial, wall clock at 3:09, curtained window with rain light |

Palette: dark gold damask `#8a6c32`, mahogany `#3a2216`, maroon carpet `#4a2a26`, candle `#ffd890`; the single
saturated signal colour is the telephone `#d0101a`.

## Sound sources
All synthesized in numpy (rain, thunder, steps, clocks, hum, drone, door, telephone bells, camcorder mechanics) except
the waltz, which is an original composition played on sampled instruments: VS Chamber Orchestra 2 CE strings and VCSL
harp (both CC0, Versilian Studios), through a radio filter.

## Fonts
IBM Plex Mono (SIL OFL 1.1) for captions; the camcorder OSD/title font is Lemo's hand-made 5×7 dot-matrix font.
