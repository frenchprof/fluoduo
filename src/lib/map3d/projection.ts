/**
 * The 3D course map's camera — pure maths, no React (ported from Dan's Figma
 * Make "3D Scroll Map Interface", 19 Aug 2026; the numbers are his).
 *
 * World space: z runs along the road (stop N sits at z = N − 1), x is lateral
 * (−1 left … +1 right, the road's `WX` snake repeats every ten stops). The
 * camera sits ON the road at `camZ`, looks ~1.5 stops ahead so its heading
 * follows the bends, and `project()` turns a world point into box pixels: a
 * standard pinhole with the horizon at HORIZON_Y and the eye line at CAMERA_Y,
 * depth-scaled size, and a ground-plane squish (scaleY) so discs flatten
 * towards the horizon. Things slightly BEHIND the camera project below the
 * eye line and slide off the bottom.
 */

// Dan, 2026-08-20, with the Candy Crush map as the reference: the view is a
// HIGH OBLIQUE — a camera well above the road looking down-forward, so the
// ground fills the frame, only a handful of big stops are on screen with fat
// gaps between them, and size barely shrinks with distance. That is not a
// pinhole eye-on-the-road (the Make's model, however tuned) — position and
// size are DECOUPLED here: the row position saturates with depth (FOCAL),
// while the disc size falls off on its own, much gentler curve
// (SIZE_FALLOFF, floored at MIN_SCALE).
// Round 9 (Dan): the road owns the frame — the plateau fills two thirds of
// the screen, the vista band and sky squeeze above it; the current station
// sits fully visible near the bottom edge, never cut.
export const HORIZON_Y = 0.34; // the road's CREST — stops vanish behind this rounded shoulder
export const SKYLINE_Y = 0.29; // the true sky line, far above the crest — the distant vista lives between

/**
 * MORE SKY, ON THE LANDING PAGE ONLY (Dan, 8 Sep, over his own mocks: *"i
 * actually extended the sky to show more sky"*, *"so it lands now roughly 1/3
 * sky, and 2/3 land"*).
 *
 * The two constants above are FRACTIONS OF THE BOX, not of the window, so the
 * horizon can be moved for one surface without moving it for any other: render
 * the scene into a box this many times the visible height and let the bottom
 * hang past the fold. At 1.12 the skyline lands at 0.29 × 1.12 ≈ 33% of the
 * window and the crest at 0.34 × 1.12 ≈ 38% — a third of sky, which is what
 * Dan asked for in words. 1.3 was tried first, off the mock's measured 37%
 * skyline, and it cropped goal 1 off the bottom: the lift scales the whole
 * scene, so sky bought at the top is ground sold at the bottom.
 *
 * WHY NOT JUST RAISE HORIZON_Y. It is shared: /map, Home's postcard and the
 * embed all read it, verify25c pins it, and verify124 and verify127 are
 * measured against it. A landing page wanting a taller sky is not a reason to
 * move the horizon under fifty stops on the map a learner uses every day.
 *
 * WHAT IT COSTS, and it is a real cost: the bottom 12% of the scene is
 * cropped, which is the nearest stretch of the ground that was dressed on
 * 8 Sep. What reaches the bottom of the window is the scene's ~89% line, which
 * is still planted — verify151 keeps counting sprites there so this cannot
 * quietly empty the foreground out again.
 */
export const WELCOME_SKY_LIFT = 1.12;
export const CAMERA_Y = 0.97; // the eye line sits just above the box's bottom
export const FOCAL = 6.2; // view depth, in stop units — rows spread linearly across it
// Dan's capture, round 5: the path is FULL of stations — five or six in the
// chain at once, nearly touching, each farther ball tucked behind the nearer
// one, sizes falling to about half by the far end. The rise over the curve
// is only the chain's very tail.
export const FULL_AHEAD = 6; // fully risen this close — nearer than this, a thing stands whole on the ground
export const MAX_AHEAD = 7.5; // beyond this, still wholly below the planet's shoulder
// Round 11 (Dan): a passed thing must "only disappear if it goes off the
// frame rather than in the middle of nowhere" — deep behind-range, and the
// behind rows dive well below the box so even a giant tree's crown has left
// the frame before the cull.
// Round 13 (Dan, 2026-08-22: "just as those numbered stops appear on screen
// until they have past the bottom edge, so must everything else"): 4 was
// enough for a stop disc but not for a giant tree — the behind curve
// saturates (t = d/(d+2.48)), so a ~300px crown only clears the bottom edge
// around d ≈ 5.5–7. Eight puts every sprite's top past the frame before the
// cull, on both box heights.
export const MAX_BEHIND = 8; // draw distance behind (stops)
export const SIZE_FALLOFF = 0.24; // per-stop size decay — steeper since 7 Sep, so near reads much nearer
export const MIN_SCALE = 0.30; // a far stop is small, but never so small its number cannot be read
export const LOOK_AHEAD = 1.5; // heading = the road this far ahead

/** Road snake: world X per stop, repeating every ten stops (one unit).
 *  Round 9 (Dan): a GENTLE S up the middle of the frame — the old amplitude
 *  swung the road hard across the screen; the capture's path barely leaves
 *  the centre. Same shape, a bit over half the swing. */
export const WX = [-0.02, 0.26, 0.44, 0.3, 0.03, -0.3, -0.44, -0.26, -0.02, 0.2];
export const N_STOPS = 50;

export const getWorldX = (id: number) => WX[(id - 1) % WX.length];

/** Interpolated road X at any continuous z (clamped to the 50 stops). */
export function pathXAt(z: number): number {
  const zC = Math.max(0, Math.min(N_STOPS - 0.01, z));
  const lo = Math.floor(zC);
  const hi = Math.min(N_STOPS - 1, lo + 1);
  const t = zC - lo;
  const xLo = getWorldX(lo + 1);
  const xHi = getWorldX(hi + 1);
  return xLo + (xHi - xLo) * t;
}

/** Camera forward vector (fx, fz), normalised. */
export function cameraForward(camZ: number): { fx: number; fz: number } {
  const dx = pathXAt(camZ + LOOK_AHEAD) - pathXAt(camZ);
  const len = Math.sqrt(dx * dx + LOOK_AHEAD * LOOK_AHEAD);
  return { fx: dx / len, fz: LOOK_AHEAD / len };
}

export type Projected = {
  px: number;
  py: number;
  /** Depth scale, 1 at the camera. */
  scale: number;
  /** Ground-plane squish, 1 at the camera → ~0.12 at the horizon. */
  scaleY: number;
  /** A stop disc's pixel size at this depth. */
  size: number;
  /** 0 at the camera → 1 at the horizon (or the bottom edge, behind). */
  t: number;
  /** MINI-PLANET rise: how much of the thing has come up over the horizon.
   *  1 = standing whole on the ground (csz ≤ FULL_AHEAD); 0 = still wholly
   *  behind the curve (csz = MAX_AHEAD). The renderer shows the TOP
   *  `reveal` fraction, its foot pinned to the horizon line. */
  reveal: number;
  behind: boolean;
};

/**
 * World (worldX, relZ) → box pixels, with relZ the signed depth from the
 * camera (+ ahead). null = outside the draw range.
 */
export function project(worldX: number, relZ: number, camZ: number, vw: number, vh: number): Projected | null {
  if (relZ > MAX_AHEAD || relZ < -MAX_BEHIND) return null;

  const camX = pathXAt(camZ);
  const { fx, fz } = cameraForward(camZ);
  // Camera right vector R = (fz, −fx)
  const rx = fz;
  const rz = -fx;
  const relX = worldX - camX;

  const csx = relX * rx + relZ * rz; // lateral, camera space
  const csz = relX * fx + relZ * fz; // depth, camera space
  if (!isFinite(csx) || !isFinite(csz)) return null;

  const horizY = vh * HORIZON_Y;
  const camY = vh * CAMERA_Y;

  if (csz >= 0) {
    // MINI-PLANET (Dan, 2026-08-20, round 3: "you are flying forward over
    // the rounded surface of a mini-planet earth"). The road runs over the
    // curve; row position follows a sine of the angular distance — crawls at
    // the horizon, sweeps fast underfoot (sin' = cos).
    const a = Math.min(1, csz / FULL_AHEAD);
    // GROUNDED, NOT AERIAL (Dan, 7 Sep: "the perspective of the map should
    // also be less aerial and more grounded, so that we see more contrast
    // between what pops from afar vs what we see up close like real human
    // view near-the-ground view of the scene").
    //
    // A quarter-sine leaves the ground plane evenly spread, which is what a
    // camera looking DOWN sees. Standing on the road, the near ground rushes
    // past and the far ground piles up against the horizon. This curve has
    // twice the slope at your feet and flattens harder into the distance,
    // which is that difference.
    const t = 0.97 * (1 - Math.pow(1 - a, 2.1));
    // The rise: between MAX_AHEAD and FULL_AHEAD a thing is climbing over
    // the shoulder — first its very tip AT the horizon line, then more of it
    // as the world rolls under the camera, until it stands whole and starts
    // down the screen. The renderer clips the hidden lower part.
    const reveal = csz <= FULL_AHEAD ? 1 : Math.max(0, 1 - (csz - FULL_AHEAD) / (MAX_AHEAD - FULL_AHEAD));
    // Disc size: its own gentle falloff — a far stop is still a disc.
    const sc = Math.max(MIN_SCALE, 1 / (1 + csz * SIZE_FALLOFF));
    // Rounds 8–9 (Dan: the stops "should be flat on the ground", not coins
    // on edge): a station is an oblate button LYING ON THE ROAD, seen from
    // above — constant strong foreshortening across the chain, the thick rim
    // below the face supplies the button's height off the ground.
    // Dan, 7-8 Sep: "i used the word stop to mean goal (flat-lying coin)",
    // "that stop has to be of a certain height". A coin lying on the ground
    // seen from eye level is a THIN ellipse with a THICK side wall — the wall
    // is where its height reads. 0.58 was a view from above, where a coin is
    // nearly a circle and has no side to show.
    const scaleY = 0.40;
    // THE STOPS TRACK THE ROAD, AT ANY WIDTH. This lateral used `vw` while the
    // road's width now uses the shorter edge, so on a wide screen the two
    // drifted apart and a stop on a bend could sit out on the grass. Same
    // reference as the road; on a portrait phone the shorter edge IS the
    // width, so nothing there moves.
    const px = vw * 0.5 + csx * Math.min(vw, vh) * 0.4 * sc;
    const py = camY - (camY - horizY) * t;
    if (!isFinite(px) || !isFinite(py)) return null;
    // Dan, 2026-08-20 (his capture, round 4): "the numbered stations are
    // small enough to be contained within a single circular spot on the
    // road" — the road is ~2.5 stops wide, the stop rides IN it, never over
    // its banks.
    return { px, py, scale: sc, scaleY, size: Math.max(22, Math.round(vh * 0.23 * sc)), t, reveal, behind: false };
  }
  const d = -csz;
  const t = d / (d + FOCAL * 0.4);
  if (t > 0.97) return null;
  const sc = Math.max(MIN_SCALE, (1 - t * 0.3));
  const scaleY = 0.40;
  const px = vw * 0.5 + csx * Math.min(vw, vh) * 0.4 * sc;
  const py = camY + (vh * 1.9 - camY) * t;
  if (!isFinite(px) || !isFinite(py)) return null;
  return { px, py, scale: sc, scaleY, size: Math.max(20, Math.round(vh * 0.11 * sc)), t, reveal: 1, behind: true };
}

/**
 * Paint order: NEAR things on top — Dan's round 5: "each farther ball tucked
 * behind the nearer one."
 *
 * This was `(1 - scale) * 900`, which is backwards: a smaller (farther) scale
 * got the HIGHER z-index, so the moment a stop crested the horizon it painted
 * over the nearer stops descending in front of it — measured at the crest
 * cluster, stop 8 (z 499) covered 7 (466) covered 6 (429), which is exactly
 * Dan's 31 Aug report: "the items disappear too soon after they appear on
 * the horizon". Bigger scale = nearer = higher z, full stop.
 */
export const zOrder = (scale: number) => Math.round(scale * 900);
