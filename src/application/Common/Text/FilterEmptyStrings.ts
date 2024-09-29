import { isArray } from '@/TypeHelpers';

export type OptionalString = string | undefined | null;

export function filterEmptyStrings(
  texts: readonly OptionalString[],
  isArrayType: typeof isArray = isArray,
): string[] {
  if (!isArrayType(texts)) {
    throw new Error(`Invalid input: Expected an array, but received type ${typeof texts}.`);
  }
  assertArrayItemsAreStringLike(texts);
  return texts
    .filter((title): title is string => Boolean(title));
}

function assertArrayItemsAreStringLike(
  texts: readonly unknown[],
): asserts texts is readonly OptionalString[] {
  const invalidItems = texts.filter((item) => !(typeof item === 'string' || item === undefined || item === null));
  if (invalidItems.length > 0) {
    const invalidTypes = invalidItems.map((item) => typeof item).join(', ');
    throw new Error(`Invalid array items: Expected items as string, undefined, or null. Received invalid types: ${invalidTypes}.`);
  }
}
