import { isFunction } from '@/TypeHelpers';

/**
 * Creates a secure proxy for the specified object, exposing only the public properties
 * of its interface.
 *
 * This approach prevents the full exposure of the object, thereby reducing the risk
 * of unintended access or misuse. For instance, creating a facade for a class rather
 * than exposing the class itself ensures that private members and dependencies
 * (such as file access or internal state) remain encapsulated and inaccessible.
 */
export function createSecureFacade<T>(
  originalObject: T,
  accessibleMembers: KeyTypeCombinations<T>,
): T {
  const facade: Partial<T> = {};

  accessibleMembers.forEach((key: keyof T) => {
    const member = originalObject[key];
    if (isFunction(member)) {
      facade[key] = ((...args: unknown[]) => {
        return member.apply(originalObject, args);
      }) as T[keyof T];
    } else {
      facade[key] = member;
    }
  });

  return facade as T;
}

type PrependTuple<H, T extends readonly unknown[]> = H extends unknown ? T extends unknown ?
  ((h: H, ...t: T) => void) extends ((...r: infer R) => void) ? R : never : never : never;
type RecursionDepthControl = [
  never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
];
type AllKeyCombinations<T, U = T, N extends number = 15> = T extends unknown ?
  PrependTuple<T, Exclude<U, T> extends infer X ? {
    0: [], 1: AllKeyCombinations<X, X, RecursionDepthControl[N]>
  }[[X] extends [never] ? 0 : 1] : never> :
  never;
type KeyTypeCombinations<T> = AllKeyCombinations<keyof T>;
