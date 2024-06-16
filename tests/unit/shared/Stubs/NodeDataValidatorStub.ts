import type { NodeData } from '@/application/Parser/NodeValidation/NodeData';
import type { NodeDataValidator, NodeDataValidatorFactory } from '@/application/Parser/NodeValidation/NodeDataValidator';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export const createNodeDataValidatorFactoryStub
: NodeDataValidatorFactory = () => new NodeDataValidatorStub();

export class NodeDataValidatorStub
  extends StubWithObservableMethodCalls<NodeDataValidator>
  implements NodeDataValidator {
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

  public assertDefined(node: NodeData): this {
    this.registerMethodCall({
      methodName: 'assertDefined',
      args: [node],
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
        throw new Error(`[${NodeDataValidatorStub.name}] Assert validation failed: ${errorMessage}`);
      }
    }
    return this;
  }

  public createContextualErrorMessage(errorMessage: string): string {
    this.registerMethodCall({
      methodName: 'createContextualErrorMessage',
      args: [errorMessage],
    });
    return `${NodeDataValidatorStub.name}: ${errorMessage}`;
  }
}
