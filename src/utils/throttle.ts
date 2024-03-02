export const throttle = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  delay: number
) => {
  let inThrottle: boolean;
  return function (...args: Parameters<F>) {
    if (inThrottle) return;
    inThrottle = true;
    setTimeout(() => (inThrottle = false), delay);
    fn.apply(this, args);
  };
};

export const throttleWithLag = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  delay: number,
  /** How long after the final invocation should the function continue to be called for (in ms) */
  finalDelay: number
) => {
  let updateInterval: NodeJS.Timeout;
  let endTimeout: NodeJS.Timeout;
  // @ts-expect-error -- TS can't determine that this type won't be instantiated differently
  const fnWithInterval: typeof fn = (...args) => {
    clearTimeout(updateInterval);
    clearTimeout(endTimeout);
    updateInterval = setInterval(() => fn(...args), delay);
    endTimeout = setTimeout(() => clearTimeout(updateInterval), finalDelay);
    return fn(...args);
  };
  return throttle(fnWithInterval, delay);
};
