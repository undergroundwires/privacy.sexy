import { describe, it } from 'vitest';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';

describe('EnvironmentVariablesFactory', () => {
  it('can read current environment', () => {
    const environmentVariables = EnvironmentVariablesFactory.Current.instance;
    Object.entries(environmentVariables).forEach(([key, value]) => {
      it(`${key} value is defined`, () => {
        expect(value).to.not.equal(undefined);
        expect(value).to.not.equal(null);
        expect(value).to.not.equal(Number.NaN);
      });
    });
  });
});
