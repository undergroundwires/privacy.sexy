import { describe, it, expect } from 'vitest';
import { validateCategoryCollection } from '@/domain/Collection/Validation/CompositeCategoryCollectionValidator';
import type { CategoryCollectionValidationContext, CategoryCollectionValidator } from '@/domain/Collection/Validation/CategoryCollectionValidator';
import { CategoryCollectionValidationContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionValidationContextStub';

describe('validateCategoryCollection', () => {
  it('throws error when no validators are provided', () => {
    // arrange
    const emptyValidators: CategoryCollectionValidator[] = [];
    const expectedErrorMessage = 'No validators provided.';

    // act
    const act = () => new TestContext()
      .withValidators(emptyValidators)
      .runValidation();

    // assert
    expect(act).to.throw(expectedErrorMessage);
  });

  describe('validator execution', () => {
    it('executes single validator', () => {
      // arrange
      let isCalled = false;
      const singleValidator: CategoryCollectionValidator = () => {
        isCalled = true;
      };
      const validators = [singleValidator];

      // act
      new TestContext()
        .withValidators(validators)
        .runValidation();

      // assert
      expect(isCalled).to.equal(true);
    });

    it('executes multiple validators in order', () => {
      // arrange
      const expectedExecutionSequence: readonly string[] = [
        'validator1Call',
        'validator2Call',
      ];
      const actualExecutionSequence: string[] = [];
      const validator1: CategoryCollectionValidator = () => {
        actualExecutionSequence.push(expectedExecutionSequence[0]);
      };
      const validator2: CategoryCollectionValidator = () => {
        actualExecutionSequence.push(expectedExecutionSequence[1]);
      };
      const validators = [validator1, validator2];

      // act
      new TestContext()
        .withValidators(validators)
        .runValidation();

      // assert
      expect(actualExecutionSequence).to.deep.equal(expectedExecutionSequence);
    });

    it('passes correct context to single validator', () => {
      // arrange
      const expectedContext = new CategoryCollectionValidationContextStub();
      let actualContext: CategoryCollectionValidationContext | undefined;
      const validator: CategoryCollectionValidator = (context) => {
        actualContext = context;
      };
      const validators = [validator];

      // act
      new TestContext()
        .withValidators(validators)
        .withValidationContext(expectedContext)
        .runValidation();

      // assert
      expect(expectedContext).to.equal(actualContext);
    });

    it('passes same context to all validators', () => {
      // arrange
      const expectedContext = new CategoryCollectionValidationContextStub();
      const receivedContexts = new Array<CategoryCollectionValidationContext>();
      const contextStoringValidator: CategoryCollectionValidator = (context) => {
        receivedContexts.push(context);
      };
      const validators = [
        contextStoringValidator,
        contextStoringValidator,
        contextStoringValidator,
      ];

      // act
      new TestContext()
        .withValidators(validators)
        .withValidationContext(expectedContext)
        .runValidation();

      // assert
      expect(receivedContexts.every((c) => c === expectedContext)).to.equal(true);
    });
  });

  it('propagates error from validator', () => {
    // arrange
    const expectedError = 'Error from validator';
    const errorThrowingValidator: CategoryCollectionValidator = () => {
      throw new Error(expectedError);
    };
    const validators = [errorThrowingValidator];

    // act
    const act = () => new TestContext()
      .withValidators(validators)
      .runValidation();

    // Act & Assert
    expect(act).to.throw(expectedError);
  });

  it('halts execution on validator error', () => {
    // arrange
    const errorThrowingValidator: CategoryCollectionValidator = () => {
      throw new Error('Error from validator');
    };
    let isSecondValidatorCalled = false;
    const secondValidator: CategoryCollectionValidator = () => {
      isSecondValidatorCalled = true;
    };
    const validators = [errorThrowingValidator, secondValidator];

    // act
    try {
      new TestContext()
        .withValidators(validators)
        .runValidation();
    } catch { /* Swallow */ }

    // Act & Assert
    expect(isSecondValidatorCalled).to.equal(false);
  });
});

class TestContext {
  private validators: readonly CategoryCollectionValidator[] = [
    () => {},
  ];

  private validationContext
  : CategoryCollectionValidationContext = new CategoryCollectionValidationContextStub();

  public withValidators(validators: readonly CategoryCollectionValidator[]): this {
    this.validators = validators;
    return this;
  }

  public withValidationContext(validationContext: CategoryCollectionValidationContext): this {
    this.validationContext = validationContext;
    return this;
  }

  public runValidation(): ReturnType<typeof validateCategoryCollection> {
    return validateCategoryCollection(
      this.validationContext,
      this.validators,
    );
  }
}
