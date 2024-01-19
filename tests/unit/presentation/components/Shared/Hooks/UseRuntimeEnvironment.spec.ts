import { describe, it, expect } from 'vitest';
import { useRuntimeEnvironment } from '@/presentation/components/Shared/Hooks/UseRuntimeEnvironment';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';

describe('UseRuntimeEnvironment', () => {
  it('returns expected environment', () => {
    // arrange
    const expectedEnvironment = new RuntimeEnvironmentStub();
    // act
    const actualEnvironment = useRuntimeEnvironment(expectedEnvironment);
    // assert
    expect(actualEnvironment).to.equal(expectedEnvironment);
  });
});
