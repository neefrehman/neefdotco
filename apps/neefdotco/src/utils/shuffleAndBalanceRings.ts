import { shuffle } from "@repo/utils/math/shuffle";

const MAX_INNER_WORD_LENGTH = 10;

/**
 * Randomises the order of `words` across the rings of the orbit, so that:
 *  1. the inner ring (which has the least room) only gets short words,
 *  2. the outer and middle rings get a similar spread of short and long words, and
 *  3. around each ring, neighbouring words add up to about the same width, so long words
 *     aren't next to long words (they'd overlap) and short words aren't next to short words (gaps).
 *
 * The rings (outermost first) always have words in the ratio 3:2:1, and any excess words are ignored.
 * Circumference = 2 * PI * r, so doubling the radius also doubles the circumference, i.e. each
 * concentric ring should increase in word count by the number of words of the smallest ring.
 */
export const shuffleAndBalanceRings = (words: readonly string[]) => {
  const inner = Math.floor(words.length / 6);

  const fitsInner = ({ length }: string) => Number(length <= MAX_INNER_WORD_LENGTH);
  const innerFirst = shuffle(words.slice(0, 6 * inner)).sort((a, b) => fitsInner(b) - fitsInner(a));

  // Deal the rest longest to shortest, in blocks of five words that go three to the outer ring and two to the middle
  const rest = innerFirst.slice(inner).sort((a, b) => b.length - a.length);
  const isOuter = Array.from({ length: inner }, () =>
    shuffle([true, true, true, false, false]),
  ).flat();

  return [
    rest.filter((_, i) => isOuter[i]),
    rest.filter((_, i) => !isOuter[i]),
    innerFirst.slice(0, inner),
  ].map((ring) => {
    // Neighbours (wrapping round) should add up to similar lengths: this is smallest when the sums are most even
    const cost = (order: string[]) =>
      order.reduce(
        (sum, { length }, i) => sum + (length + (order[(i + 1) % order.length]?.length ?? 0)) ** 2,
        0,
      );

    // Start from a random order, then try reversing random stretches of it, keeping any that don't make things worse
    return Array.from({ length: 5000 }).reduce<string[]>((order) => {
      const from = Math.floor(Math.random() * ring.length);
      const count = 1 + Math.floor(Math.random() * (ring.length - from));
      const next = order.toSpliced(from, count, ...order.slice(from, from + count).toReversed());
      return cost(next) <= cost(order) ? next : order;
    }, shuffle(ring));
  });
};
