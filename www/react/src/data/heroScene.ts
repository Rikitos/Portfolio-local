/**
 * Measured positions for the animated hero (components/HeroScene.tsx).
 *
 * Every coordinate is in the hero illustrations' own pixel space: both the day
 * and night images are 1672 x 941 and share one composition, so one set of
 * numbers serves both. The animated SVG uses the same viewBox, so these stay
 * glued to the picture however it is scaled or cropped.
 *
 * How they were found (so they can be redone if the artwork changes):
 *  - STARS: local brightness maxima in the night sky with a strong contrast
 *    against a ring 9px around them, then checked by eye (none sit on clouds).
 *  - LAMP: centre of the bright underside of the lamp shade.
 *  - CAT_TORSO: traced by hand over a gridded zoom of the cat, covering the back
 *    and haunches but NOT the head (so the face stays still). It is then pushed
 *    outward so it includes the bright rim light on the fur (orange by day, blue
 *    at night); otherwise that rim stays behind while the body moves under it.
 *    The push varies by edge: 5px down the right side, where only plain sky or
 *    desk lies behind the cat; 3px across the middle of the back; and none at the
 *    left end of the top edge, because the window sill's lit strip sits right
 *    above the fur there and a larger push would carry a piece of it upward at
 *    the peak of the breath. The seam on the head side and the bottom edge are
 *    left as traced. Checked with a 5-6x canvas simulation of the peak of the
 *    breath: the rim rises with the body and no background ghost shows beyond the
 *    fur. To pull a point away from the sill, make its y larger.
 */
export const SCENE_W = 1672
export const SCENE_H = 941

/** Lamp bulb / shade glow: centre and glow radius, in scene px. */
export const LAMP = { x: 487, y: 345, r: 260 }

/**
 * Outline of the cat's torso (back, haunches, front paws), in scene px. The
 * breathing animation scales a clipped copy of the picture inside this shape.
 */
export const CAT_TORSO: readonly (readonly [number, number])[] = [
  [1182, 558], [1200, 547], [1230, 539], [1269, 531], [1303, 535],
  [1336, 544], [1368, 562], [1392, 589], [1409, 619], [1412, 641],
  [1405, 664], [1386, 680], [1348, 685], [1302, 688], [1256, 689],
  [1217, 687], [1197, 672], [1207, 631], [1210, 592], [1198, 569],
]

/**
 * The fixed point the torso grows from: its bottom-left corner, next to the
 * shoulder seam, so the seam barely moves while the back rises.
 */
export const CAT_ORIGIN = { x: 1212, y: 687 }

/** Twinkling stars: [x, y, isBright]. Bright ones also get a small cross sparkle. */
export const STARS: readonly (readonly [number, number, boolean])[] = [
  [1106, 14, true], [823, 18, true], [1163, 31, true], [936, 78, false], [1543, 33, false],
  [1592, 54, true], [961, 113, false], [1339, 75, true], [1533, 126, false], [1011, 63, false],
  [1032, 137, true], [1112, 201, false], [1268, 52, false], [1264, 89, false], [1299, 14, false],
  [1107, 129, false], [1626, 86, false], [1025, 188, false], [1173, 106, false], [852, 64, false],
  [1080, 161, false], [987, 155, false], [954, 23, false], [1637, 149, false], [1560, 75, false],
  [798, 39, false], [1031, 32, false], [1592, 13, false], [1101, 85, false], [1003, 103, false],
  [1532, 180, false], [1156, 144, false], [1334, 160, false], [1577, 132, false], [1367, 112, false],
  [1261, 26, false],
]
