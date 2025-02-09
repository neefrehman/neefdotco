/**
 * Functional wrapper around try catch, that avoids the need for mutable variables
 */
export const tryCatch = <T>(fn: (...args: unknown[]) => T) => {
    try {
      const tcData = fn();
      return [null, tcData] as const;
    } catch (tcError: unknown) {
      return [tcError, null] as const;
    }
  };