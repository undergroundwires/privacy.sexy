import { describe } from 'vitest';
import { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/ISanityCheckOptions';
import { validateRuntimeSanity } from '@/infrastructure/RuntimeSanity/SanityChecks';

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

function generateTestOptions(): ISanityCheckOptions[] {
  const defaultOptions: ISanityCheckOptions = {
    validateEnvironmentVariables: true,
    validateWindowVariables: true,
  };
  return generateBooleanPermutations(defaultOptions);
}

function generateBooleanPermutations<T>(object: T): T[] {
  const keys = Object.keys(object) as (keyof T)[];

  if (keys.length === 0) {
    return [object];
  }

  const currentKey = keys[0];
  const currentValue = object[currentKey];

  if (typeof currentValue !== 'boolean') {
    return generateBooleanPermutations({
      ...object,
      [currentKey]: currentValue,
    });
  }

  const remainingKeys = Object.fromEntries(
    keys.slice(1).map((key) => [key, object[key]]),
  ) as unknown as T;

  const subPermutations = generateBooleanPermutations(remainingKeys);

  return [
    ...subPermutations.map((p) => ({ ...p, [currentKey]: true })),
    ...subPermutations.map((p) => ({ ...p, [currentKey]: false })),
  ];
}
