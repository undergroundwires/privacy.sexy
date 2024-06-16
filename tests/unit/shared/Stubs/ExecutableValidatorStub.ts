import type { ExecutableData } from '@/application/collections/';
import type { ExecutableValidator, ExecutableValidatorFactory } from '@/application/Parser/Executable/Validation/ExecutableValidator';
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

  public assertDefined(data: ExecutableData): this {
    this.registerMethodCall({
      methodName: 'assertDefined',
      args: [data],
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
