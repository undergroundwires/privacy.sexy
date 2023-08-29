import { describe, it, expect } from 'vitest';
import { useRuntimeEnvironment } from '@/presentation/components/Shared/Hooks/UseRuntimeEnvironment';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';

describe('UseRuntimeEnvironment', () => {
  describe('environment is absent', () => {
    itEachAbsentObjectValue((absentValue) => {
      // arrange
      const expectedError = 'missing environment';
      const environmentValue = absentValue;
      // act
      const act = () => useRuntimeEnvironment(environmentValue);
      // assert
      expect(act).to.throw(expectedError);
    });
  });

  it('returns expected environment', () => {
    // arrange
    const expectedEnvironment = new RuntimeEnvironmentStub();
    // act
    const actualEnvironment = useRuntimeEnvironment(expectedEnvironment);
    // assert
    expect(actualEnvironment).to.equal(expectedEnvironment);
  });
});
