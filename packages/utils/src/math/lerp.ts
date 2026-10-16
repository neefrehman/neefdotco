import type { Vector } from "./types";

/**
 * Performs a linear interpolation between two numbers
 *
 * @param start First value
 * @param end Second value
 * @param alpha The amount of interpolation. A number between 0 and 1
 *
 * @returns The interpolated value
 */
export const lerp = (start: number, end: number, alpha: number): number =>
  start * (1 - alpha) + end * alpha;

/**
 * Performs a linear interpolation between two vectors. For getting values between a min and max vector
 *
 * @param startVector The first vector to interpolate from
 * @param endVector The Second vector to interpolate to
 * @param alpha The amount of interpolation. A number between 0 and 1
 * @returns The interpolated vector
 *
 * @example
 * // Choose a random point within a 3D range
 * const start = [0, 0, 0];
 * const end = [25, 50, 25];
 * const point = lerpArray(start, end, Math.random());
 */
export const lerpVector = <D extends number>(
  startVector: Vector<D>,
  endVector: Vector<D>,
  alpha: number,
): Vector<D> => {
  if (startVector.length !== endVector.length)
    throw new TypeError("start & end vectors should have the same length");

  return startVector.map((start, i) => {
    const end = endVector[i];
    if (end === undefined)
      throw new TypeError("end vector must contain a number for each dimension");
    return lerp(start, end, alpha);
  }) as Vector<D>;
};
