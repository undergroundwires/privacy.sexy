// Compares to Array<T> objects for equality, ignoring order
export function scrambledEqual<T>(array1: readonly T[], array2: readonly T[]) {
  const sortedArray1 = sort(array1);
  const sortedArray2 = sort(array2);
  return sequenceEqual(sortedArray1, sortedArray2);
  function sort(array: readonly T[]) {
    return array.slice().sort();
  }
}

// Compares to Array<T> objects for equality in same order
export function sequenceEqual<T>(array1: readonly T[], array2: readonly T[]) {
  if (array1.length !== array2.length) {
    return false;
  }
  return array1.every((val, index) => val === array2[index]);
}
