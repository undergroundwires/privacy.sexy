import { describe, it, expect } from 'vitest';
import { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/ISanityCheckOptions';
import { RuntimeSanityValidator } from '@/presentation/bootstrapping/Modules/RuntimeSanityValidator';
import { expectDoesNotThrowAsync, expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';

describe('RuntimeSanityValidator', () => {
  it('calls validator with correct options upon bootstrap', async () => {
    // arrange
    const expectedOptions: ISanityCheckOptions = {
      validateEnvironmentVariables: true,
      validateWindowVariables: true,
    };
    let actualOptions: ISanityCheckOptions | undefined;
    const validatorMock = (options) => {
      actualOptions = options;
    };
    const sut = new RuntimeSanityValidator(validatorMock);
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
    const sut = new RuntimeSanityValidator(validatorMock);
    // act
    const act = async () => { await sut.bootstrap(); };
    // assert
    await expectThrowsAsync(act, expectedMessage);
  });
  it('runs successfully if validator passes', async () => {
    // arrange
    const validatorMock = () => { /* NOOP */ };
    const sut = new RuntimeSanityValidator(validatorMock);
    // act
    const act = async () => { await sut.bootstrap(); };
    // assert
    await expectDoesNotThrowAsync(act);
  });
});
