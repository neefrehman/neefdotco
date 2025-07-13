export const throttle = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  delay: number,
) => {
  let inThrottle: boolean;
  return function (...args: Parameters<F>) {
    if (inThrottle) return;
    inThrottle = true;
    setTimeout(() => {
      inThrottle = false;
    }, delay);
    // @ts-expect-error
    fn.apply(this, args);
  };
};
