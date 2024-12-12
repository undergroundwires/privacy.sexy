import { describe } from 'vitest';
import type { SanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/SanityCheckOptions';
import { validateRuntimeSanity } from '@/infrastructure/RuntimeSanity/SanityChecks';
import { getUnsafeTypedKeys, isBoolean } from '@/TypeHelpers';

describe('SanityChecks', () => {
  describe('validateRuntimeSanity', () => {
    describe('does not throw on current environment', () => {
      // arrange
      const testOptions = generateTestOptions();
      testOptions.forEach((options) => {
        it(`options: ${JSON.stringify(options)}`, () => {
          // act
          const act = () => validateRuntimeSanity(options);

          // assert
          expect(act).to.not.throw();
        });
      });
    });
  });
});

function generateTestOptions(): SanityCheckOptions[] {
  const defaultOptions: SanityCheckOptions = {
    validateEnvironmentVariables: true,
    validateWindowVariables: true,
  };
  return generateBooleanPermutations(
    defaultOptions,
  ).map((options) => options as SanityCheckOptions);
}

export function generateBooleanPermutations(
  obj: object | undefined,
): object[] {
  if (!obj) {
    return [];
  }

  const keys = getUnsafeTypedKeys(obj);

  if (keys.length === 0) {
    return [obj];
  }
  const currentKey = keys[0];
  const currentValue = obj[currentKey];

  if (!isBoolean(currentValue)) {
    return generateBooleanPermutations({
      ...obj,
      [currentKey]: currentValue,
    });
  }

  const remainingKeys = Object.fromEntries(
    keys.slice(1).map((key) => [key, obj[key]]),
  );

  const subPermutations = generateBooleanPermutations(remainingKeys);

  return [
    ...subPermutations.map((p) => ({ ...p, [currentKey]: true })),
    ...subPermutations.map((p) => ({ ...p, [currentKey]: false })),
  ];
}
