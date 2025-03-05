import { describe, it, expect } from 'vitest';
import { createExecutableErrorContextStub } from '@tests/unit/shared/Stubs/ExecutableErrorContextStub';
import { createExecutableContextErrorMessage } from '@/application/Application/Loader/Collections/Compiler/Executable/Validation/ExecutableErrorContextMessage';
import type { ExecutableErrorContext } from '@/application/Application/Loader/Collections/Compiler/Executable/Validation/ExecutableErrorContext';
import { ExecutableType } from '@/application/Application/Loader/Collections/Compiler/Executable/Validation/ExecutableType';
import { CategoryDataStub } from '@tests/unit/shared/Stubs/CategoryDataStub';

describe('ExecutableErrorContextMessage', () => {
  describe('createExecutableContextErrorMessage', () => {
    it('includes the specified error message', () => {
      // arrange
      const expectedErrorMessage = 'expected error message';
      const context = new TestContext()
        .withErrorMessage(expectedErrorMessage);
      // act
      const actualMessage = context.createExecutableContextErrorMessage();
      // assert
      expect(actualMessage).to.include(expectedErrorMessage);
    });
    it('includes the type of executable', () => {
      // arrange
      const executableType = ExecutableType.Category;
      const expectedType = ExecutableType[executableType];
      const errorContext: ExecutableErrorContext = {
        type: executableType,
        self: new CategoryDataStub(),
      };
      const context = new TestContext()
        .withErrorContext(errorContext);
      // act
      const actualMessage = context.createExecutableContextErrorMessage();
      // assert
      expect(actualMessage).to.include(expectedType);
    });
    it('includes details of the self executable', () => {
      // arrange
      const expectedName = 'expected name';
      const selfExecutable = new CategoryDataStub()
        .withName(expectedName);
      const errorContext: ExecutableErrorContext = {
        type: ExecutableType.Category,
        self: selfExecutable,
      };
      const context = new TestContext()
        .withErrorContext(errorContext);
      // act
      const actualMessage = context.createExecutableContextErrorMessage();
      // assert
      expect(actualMessage).to.include(expectedName);
    });
    it('includes details of the parent category', () => {
      // arrange
      const expectedName = 'expected parent name';
      const parentCategoryData = new CategoryDataStub()
        .withName(expectedName);
      const errorContext: ExecutableErrorContext = {
        type: ExecutableType.Category,
        self: new CategoryDataStub(),
        parentCategory: parentCategoryData,
      };
      const context = new TestContext()
        .withErrorContext(errorContext);
      // act
      const actualMessage = context.createExecutableContextErrorMessage();
      // assert
      expect(actualMessage).to.include(expectedName);
    });
    it('constructs the complete message format correctly', () => {
      // arrange
      const errorMessage = 'expected error message';
      const expectedName = 'expected name';
      const expectedFormat = new RegExp(`^${escapeRegExp(errorMessage)}\\s+Executable:\\s+{\\s+"name":\\s+"${escapeRegExp(expectedName)}"\\s+}`);
      const errorContext: ExecutableErrorContext = {
        self: {
          name: expectedName,
        } as unknown as ExecutableErrorContext['self'],
      };
      const context = new TestContext()
        .withErrorContext(errorContext)
        .withErrorMessage(errorMessage);
      // act
      const actualMessage = context.createExecutableContextErrorMessage();
      // assert
      expect(actualMessage).to.match(expectedFormat);
    });
    describe('output trimming', () => {
      const totalLongTextDataCharacters = 5000;
      const expectedTrimmedText = '[Rest of the executable trimmed]';
      const longName = 'a'.repeat(totalLongTextDataCharacters);
      const testScenarios: readonly {
        readonly description: string;
        readonly errorContext: ExecutableErrorContext;
      } [] = [
        {
          description: 'long text from parent category data',
          errorContext: {
            type: ExecutableType.Category,
            self: new CategoryDataStub(),
            parentCategory: new CategoryDataStub().withName(longName),
          },
        },
        {
          description: 'long text from self executable data',
          errorContext: {
            type: ExecutableType.Category,
            self: new CategoryDataStub().withName(longName),
          },
        },
      ];
      testScenarios.forEach(({
        description, errorContext,
      }) => {
        it(description, () => {
          const context = new TestContext()
            .withErrorContext(errorContext);
          // act
          const actualMessage = context.createExecutableContextErrorMessage();
          // assert
          expect(actualMessage).to.include(expectedTrimmedText);
          expect(actualMessage).to.have.length.lessThan(totalLongTextDataCharacters);
        });
      });
    });
    describe('missing data handling', () => {
      it('generates a message when the executable type is undefined', () => {
        // arrange
        const errorContext: ExecutableErrorContext = {
          type: undefined,
          self: new CategoryDataStub(),
        };
        const context = new TestContext()
          .withErrorContext(errorContext);
        // act
        const actualMessage = context.createExecutableContextErrorMessage();
        // assert
        expect(actualMessage).to.have.length.greaterThan(0);
      });
      it('generates a message when executable data is missing', () => {
        // arrange
        const errorContext: ExecutableErrorContext = {
          type: undefined,
          self: undefined as unknown as ExecutableErrorContext['self'],
        };
        const context = new TestContext()
          .withErrorContext(errorContext);
        // act
        const actualMessage = context.createExecutableContextErrorMessage();
        // assert
        expect(actualMessage).to.have.length.greaterThan(0);
      });
      it('generates a message when parent category is missing', () => {
        // arrange
        const errorContext: ExecutableErrorContext = {
          type: undefined,
          self: new CategoryDataStub(),
          parentCategory: undefined,
        };
        const context = new TestContext()
          .withErrorContext(errorContext);
        // act
        const actualMessage = context.createExecutableContextErrorMessage();
        // assert
        expect(actualMessage).to.have.length.greaterThan(0);
      });
    });
  });
});

class TestContext {
  private errorMessage = `[${TestContext.name}] error message`;

  private errorContext: ExecutableErrorContext = createExecutableErrorContextStub();

  public withErrorMessage(errorMessage: string): this {
    this.errorMessage = errorMessage;
    return this;
  }

  public withErrorContext(context: ExecutableErrorContext): this {
    this.errorContext = context;
    return this;
  }

  public createExecutableContextErrorMessage() {
    return createExecutableContextErrorMessage(
      this.errorMessage,
      this.errorContext,
    );
  }
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');// $& means the whole matched string
}
