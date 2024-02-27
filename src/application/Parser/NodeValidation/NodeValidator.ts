import { isString } from '@/TypeHelpers';
import { type INodeDataErrorContext, NodeDataError } from './NodeDataError';
import type { NodeData } from './NodeData';

export class NodeValidator {
  constructor(private readonly context: INodeDataErrorContext) {

  }

  public assertValidName(nameValue: string) {
    return this
      .assert(
        () => Boolean(nameValue),
        'missing name',
      )
      .assert(
        () => isString(nameValue),
        `Name (${JSON.stringify(nameValue)}) is not a string but ${typeof nameValue}.`,
      );
  }

  public assertDefined(node: NodeData) {
    return this.assert(
      () => node !== undefined && node !== null && Object.keys(node).length > 0,
      'missing node data',
    );
  }

  public assert(validationPredicate: () => boolean, errorMessage: string) {
    if (!validationPredicate()) {
      this.throw(errorMessage);
    }
    return this;
  }

  public throw(errorMessage: string): never {
    throw new NodeDataError(errorMessage, this.context);
  }
}
