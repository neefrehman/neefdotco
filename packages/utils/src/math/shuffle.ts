/**
 * Shuffles an array using fisher-yates algorithm
 *
 * @param array - the array to be shuffled
 */
export const shuffle = <T>(array: T[]) => {
  const a = [...array];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = a[i] as T;
    a[i] = a[j] as T;
    a[j] = current;
  }
  return a;
};
