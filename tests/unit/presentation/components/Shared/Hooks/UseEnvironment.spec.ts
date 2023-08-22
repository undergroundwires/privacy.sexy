import { describe, it, expect } from 'vitest';
import { useEnvironment } from '@/presentation/components/Shared/Hooks/UseEnvironment';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { EnvironmentStub } from '@tests/unit/shared/Stubs/EnvironmentStub';

describe('UseEnvironment', () => {
  describe('environment is absent', () => {
    itEachAbsentObjectValue((absentValue) => {
      // arrange
      const expectedError = 'missing environment';
      const environmentValue = absentValue;
      // act
      const act = () => useEnvironment(environmentValue);
      // assert
      expect(act).to.throw(expectedError);
    });
  });

  it('returns expected environment', () => {
    // arrange
    const expectedEnvironment = new EnvironmentStub();
    // act
    const actualEnvironment = useEnvironment(expectedEnvironment);
    // assert
    expect(actualEnvironment).to.equal(expectedEnvironment);
  });
});
