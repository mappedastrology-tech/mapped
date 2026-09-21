/**
 * Lunar nodes (Rahu = North Node, Ketu = South Node).
 *
 * Two conventions exist and both are in wide use:
 * - MEAN node: a smoothly moving average position (always retrograde). The
 *   traditional Jyotish choice and Mapped's default. Computed in ephemeris.ts.
 * - TRUE (osculating) node: where the Moon's actual orbit plane crosses the
 *   ecliptic right now. It wobbles up to ~1.7° either side of the mean node and
 *   occasionally moves direct.
 *
 * The true node here is taken from the Moon's instantaneous position and
 * velocity: the orbit normal is r × v, and the ascending node lies along
 * ẑ × (r × v). Coordinates are rotated to the TRUE ecliptic of date first, so
 * this matches the frame of every other tropical longitude in the app. Agrees
 * with Swiss Ephemeris' true node to a few arcseconds.
 */

import * as Astronomy from "astronomy-engine";

export type NodeType = "mean" | "true";

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  mean: "Mean node",
  true: "True node",
};

export function normalizeNodeType(value: unknown): NodeType {
  return value === "true" ? "true" : "mean";
}

/** Tropical longitude of the true (osculating) ascending lunar node, degrees. */
export function trueNodeLongitude(jdUt: number): number {
  const time = Astronomy.MakeTime(new Date((jdUt - 2440587.5) * 86400000));
  const rot = Astronomy.Rotation_EQJ_ECT(time);
  const s = Astronomy.RotateState(rot, Astronomy.GeoMoonState(time));
  // h = r × v
  const hx = s.y * s.vz - s.z * s.vy;
  const hy = s.z * s.vx - s.x * s.vz;
  const lon = Math.atan2(hx, -hy) * (180 / Math.PI);
  return ((lon % 360) + 360) % 360;
}
