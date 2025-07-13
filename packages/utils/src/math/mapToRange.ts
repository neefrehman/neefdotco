/**
 * Re-maps a number from one range to another.
 *
 * @param value - the incoming value to be converted
 * @param inputMin - lower bound of the value's current range
 * @param inputMax - upper bound of the value's current range
 * @param outputMin - lower bound of the value's target range
 * @param outputMax - upper bound of the value's target range
 *
 * @return the re-mapped number
 *
 * @example
 * // Converts normalized -1..1 coordinate to screen coordinate
 * const x = -1;
 * const pixel = mapToRange(x, -1, 1, 0, width);
 */
export const mapToRange = (
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
) => {
  if (Math.abs(inputMin - inputMax) < Number.EPSILON) return outputMin;

  const outputValue =
    ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;

  return outputValue;
};
