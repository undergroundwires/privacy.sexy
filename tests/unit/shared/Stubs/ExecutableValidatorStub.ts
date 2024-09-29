import type { ExecutableValidator, ExecutableValidatorFactory } from '@/application/Parser/Executable/Validation/ExecutableValidator';
import type { TypeValidator } from '@/application/Compiler/Common/TypeValidator';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export const createExecutableValidatorFactoryStub
: ExecutableValidatorFactory = () => new ExecutableValidatorStub();

export class ExecutableValidatorStub
  extends StubWithObservableMethodCalls<ExecutableValidator>
  implements ExecutableValidator {
  private assertThrowsOnFalseCondition = true;

  public withAssertThrowsOnFalseCondition(enableAssertThrows: boolean): this {
    this.assertThrowsOnFalseCondition = enableAssertThrows;
    return this;
  }

  public assertValidName(nameValue: string): this {
    this.registerMethodCall({
      methodName: 'assertValidName',
      args: [nameValue],
    });
    return this;
  }

  public assertType(assert: (validator: TypeValidator) => void): this {
    this.registerMethodCall({
      methodName: 'assertType',
      args: [assert],
    });
    return this;
  }

  public assert(
    validationPredicate: () => boolean,
    errorMessage: string,
  ): this {
    this.registerMethodCall({
      methodName: 'assert',
      args: [validationPredicate, errorMessage],
    });
    if (this.assertThrowsOnFalseCondition) {
      if (!validationPredicate()) {
        throw new Error(`[${ExecutableValidatorStub.name}] Assert validation failed: ${errorMessage}`);
      }
    }
    return this;
  }

  public createContextualErrorMessage(errorMessage: string): string {
    this.registerMethodCall({
      methodName: 'createContextualErrorMessage',
      args: [errorMessage],
    });
    return `${ExecutableValidatorStub.name}: ${errorMessage}`;
  }
}
