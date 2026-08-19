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

export const HORIZON_Y = 0.3; // horizon, as a fraction of the box height
export const CAMERA_Y = 0.8; // the eye line (where relZ = 0 lands)
export const FOCAL = 3.8; // focal length in stop units — bigger = flatter perspective
export const MAX_AHEAD = 38; // draw distance ahead (stops)
export const MAX_BEHIND = 4; // draw distance behind (stops)
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
    const t = csz / (csz + FOCAL);
    if (t > 0.97) return null;
    const sc = Math.max(0.08, FOCAL / (FOCAL + csz));
    const scaleY = Math.max(0.12, 1 - t * 0.88);
    const px = vw * 0.5 + csx * vw * 0.4 * sc;
    const py = camY - (camY - horizY) * t;
    if (!isFinite(px) || !isFinite(py)) return null;
    return { px, py, scale: sc, scaleY, size: Math.max(14, Math.round(72 * sc)), t, behind: false };
  }
  const d = -csz;
  const t = d / (d + FOCAL * 0.75);
  if (t > 0.97) return null;
  const sc = Math.max(0.1, (1 - t * 0.78) * 0.86);
  const scaleY = Math.max(0.12, 1 - t * 0.88);
  const px = vw * 0.5 + csx * vw * 0.4 * sc;
  const py = camY + (vh * 1.05 - camY) * t;
  if (!isFinite(px) || !isFinite(py)) return null;
  return { px, py, scale: sc, scaleY, size: Math.max(12, Math.round(64 * sc)), t, behind: true };
}

/** Paint order: far things first. */
export const zOrder = (scale: number) => Math.round((1 - scale) * 900);
