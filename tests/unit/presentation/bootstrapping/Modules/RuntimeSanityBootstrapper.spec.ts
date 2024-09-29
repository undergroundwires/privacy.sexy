import { describe, it, expect } from 'vitest';
import type { SanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/SanityCheckOptions';
import { RuntimeSanityBootstrapper } from '@/presentation/bootstrapping/Modules/RuntimeSanityBootstrapper';
import { expectDoesNotThrowAsync, expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import type { RuntimeSanityValidator } from '@/infrastructure/RuntimeSanity/SanityChecks';

describe('RuntimeSanityBootstrapper', () => {
  it('calls validator with correct options upon bootstrap', async () => {
    // arrange
    const expectedOptions: SanityCheckOptions = {
      validateEnvironmentVariables: true,
      validateWindowVariables: true,
    };
    let actualOptions: SanityCheckOptions | undefined;
    const validatorMock: RuntimeSanityValidator = (options) => {
      actualOptions = options;
    };
    const sut = new RuntimeSanityBootstrapper(validatorMock);
    // act
    await sut.bootstrap();
    // assert
    expect(actualOptions).to.deep.equal(expectedOptions);
  });
  it('propagates the error if validator fails', async () => {
    // arrange
    const expectedMessage = 'message thrown from validator';
    const validatorMock = () => {
      throw new Error(expectedMessage);
    };
    const sut = new RuntimeSanityBootstrapper(validatorMock);
    // act
    const act = async () => { await sut.bootstrap(); };
    // assert
    await expectThrowsAsync(act, expectedMessage);
  });
  it('runs successfully if validator passes', async () => {
    // arrange
    const validatorMock = () => { /* NOOP */ };
    const sut = new RuntimeSanityBootstrapper(validatorMock);
    // act
    const act = async () => { await sut.bootstrap(); };
    // assert
    await expectDoesNotThrowAsync(act);
  });
});
