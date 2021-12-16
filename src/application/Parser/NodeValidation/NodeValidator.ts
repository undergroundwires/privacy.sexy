import { INodeDataErrorContext, NodeDataError } from './NodeDataError';
import { NodeData } from './NodeData';

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
        () => typeof nameValue === 'string',
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

  public throw(errorMessage: string) {
    throw new NodeDataError(errorMessage, this.context);
  }
}
