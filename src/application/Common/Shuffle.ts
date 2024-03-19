/*
  Shuffle an array of strings, returning a new array with elements in random order.
  Uses the Fisher-Yates (or Durstenfeld) algorithm.
*/
export function shuffle<T>(array: readonly T[]): T[] {
  const shuffledArray = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}
