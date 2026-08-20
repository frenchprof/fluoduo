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
export const HORIZON_Y = 0.46; // the road's CREST — stops vanish behind this rounded shoulder
export const SKYLINE_Y = 0.2; // the true sky line, far above the crest — the distant vista lives between
export const CAMERA_Y = 1.04; // the eye line sits just below the box's bottom
export const FOCAL = 6.2; // view depth, in stop units — rows spread linearly across it
export const FULL_AHEAD = 4; // fully risen this close — nearer than this, a thing stands whole on the ground
export const MAX_AHEAD = 5.5; // beyond this, still wholly below the planet's shoulder
export const MAX_BEHIND = 1.5; // draw distance behind (stops)
export const SIZE_FALLOFF = 0.12; // per-stop size decay — Candy-Crush gentle
export const MIN_SCALE = 0.45; // a far stop is still nearly half a near one
export const LOOK_AHEAD = 1.5; // heading = the road this far ahead

/** Road snake: world X per stop, repeating every ten stops (one unit). */
export const WX = [-0.04, 0.48, 0.8, 0.54, 0.06, -0.54, -0.8, -0.48, -0.04, 0.36];
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
    const t = 0.97 * Math.sin((a * Math.PI) / 2);
    // The rise: between MAX_AHEAD and FULL_AHEAD a thing is climbing over
    // the shoulder — first its very tip AT the horizon line, then more of it
    // as the world rolls under the camera, until it stands whole and starts
    // down the screen. The renderer clips the hidden lower part.
    const reveal = csz <= FULL_AHEAD ? 1 : Math.max(0, 1 - (csz - FULL_AHEAD) / (MAX_AHEAD - FULL_AHEAD));
    // Disc size: its own gentle falloff — a far stop is still a disc.
    const sc = Math.max(MIN_SCALE, 1 / (1 + csz * SIZE_FALLOFF));
    // The reference's stops stay ROUND at every distance — the hiding is the
    // planet's job, not a squish. Only a whisper of foreshortening.
    const scaleY = Math.max(0.85, 1 - t * 0.15);
    const px = vw * 0.5 + csx * vw * 0.4 * sc;
    const py = camY - (camY - horizY) * t;
    if (!isFinite(px) || !isFinite(py)) return null;
    return { px, py, scale: sc, scaleY, size: Math.max(26, Math.round(vh * 0.165 * sc)), t, reveal, behind: false };
  }
  const d = -csz;
  const t = d / (d + FOCAL * 0.4);
  if (t > 0.97) return null;
  const sc = Math.max(MIN_SCALE, (1 - t * 0.3));
  const scaleY = Math.max(0.7, 1 - t * 0.2);
  const px = vw * 0.5 + csx * vw * 0.4 * sc;
  const py = camY + (vh * 1.05 - camY) * t;
  if (!isFinite(px) || !isFinite(py)) return null;
  return { px, py, scale: sc, scaleY, size: Math.max(22, Math.round(vh * 0.14 * sc)), t, reveal: 1, behind: true };
}

/** Paint order: far things first. */
export const zOrder = (scale: number) => Math.round((1 - scale) * 900);
