import { isString } from '@/TypeHelpers';
import { type NodeDataErrorContext } from './NodeDataErrorContext';
import { createNodeContextErrorMessage, type NodeContextErrorMessageCreator } from './NodeDataErrorContextMessage';
import type { NodeData } from './NodeData';

export interface NodeDataValidatorFactory {
  (context: NodeDataErrorContext): NodeDataValidator;
}

export interface NodeDataValidator {
  assertValidName(nameValue: string): void;
  assertDefined(
    node: NodeData | undefined,
  ): asserts node is NonNullable<NodeData> & void;
  assert(
    validationPredicate: () => boolean,
    errorMessage: string,
  ): asserts validationPredicate is (() => true);
  createContextualErrorMessage(errorMessage: string): string;
}

export const createNodeDataValidator
: NodeDataValidatorFactory = (context) => new ContextualNodeDataValidator(context);

export class ContextualNodeDataValidator implements NodeDataValidator {
  constructor(
    private readonly context: NodeDataErrorContext,
    private readonly createErrorMessage
    : NodeContextErrorMessageCreator = createNodeContextErrorMessage,
  ) {

  }

  public assertValidName(nameValue: string): void {
    this.assert(() => Boolean(nameValue), 'missing name');
    this.assert(
      () => isString(nameValue),
      `Name (${JSON.stringify(nameValue)}) is not a string but ${typeof nameValue}.`,
    );
  }

  public assertDefined(
    node: NodeData,
  ): asserts node is NonNullable<NodeData> {
    this.assert(
      () => node !== undefined && node !== null && Object.keys(node).length > 0,
      'missing node data',
    );
  }

  public assert(
    validationPredicate: () => boolean,
    errorMessage: string,
  ): asserts validationPredicate is (() => true) {
    if (!validationPredicate()) {
      this.throw(errorMessage);
    }
  }

  public createContextualErrorMessage(errorMessage: string): string {
    return this.createErrorMessage(errorMessage, this.context);
  }

  private throw(errorMessage: string): never {
    throw new Error(
      this.createContextualErrorMessage(errorMessage),
    );
  }
}
