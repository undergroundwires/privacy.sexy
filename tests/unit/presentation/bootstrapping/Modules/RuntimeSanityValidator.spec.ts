import { describe, it, expect } from 'vitest';
import { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/ISanityCheckOptions';
import { RuntimeSanityValidator } from '@/presentation/bootstrapping/Modules/RuntimeSanityValidator';

describe('RuntimeSanityValidator', () => {
  it('calls validator with correct options upon bootstrap', () => {
    // arrange
    const expectedOptions: ISanityCheckOptions = {
      validateEnvironmentVariables: true,
      validateWindowVariables: true,
    };
    let actualOptions: ISanityCheckOptions;
    const validatorMock = (options) => {
      actualOptions = options;
    };
    const sut = new RuntimeSanityValidator(validatorMock);
    // act
    sut.bootstrap();
    // assert
    expect(actualOptions).to.deep.equal(expectedOptions);
  });
  it('propagates the error if validator fails', () => {
    // arrange
    const expectedMessage = 'message thrown from validator';
    const validatorMock = () => {
      throw new Error(expectedMessage);
    };
    const sut = new RuntimeSanityValidator(validatorMock);
    // act
    const act = () => sut.bootstrap();
    // assert
    expect(act).to.throw(expectedMessage);
  });
  it('runs successfully if validator passes', () => {
    // arrange
    const validatorMock = () => { /* NOOP */ };
    const sut = new RuntimeSanityValidator(validatorMock);
    // act
    const act = () => sut.bootstrap();
    // assert
    expect(act).to.not.throw();
  });
});
