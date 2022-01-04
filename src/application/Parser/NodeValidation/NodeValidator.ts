import { isString } from '@/TypeHelpers';
import { type NodeDataErrorContext, NodeDataError } from './NodeDataError';
import type { NodeData } from './NodeData';

export class NodeValidator {
  constructor(private readonly context: NodeDataErrorContext) {

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

  public assertExecutableId(idValue: string) { // TODO: Unit test this
    return this
      .assert(
        () => Boolean(idValue),
        getMessageWithIdSuggestion('missing ID'),
      )
      .assert(
        () => isString(idValue),
        getMessageWithIdSuggestion(`ID "${idValue}" is not a string but ${typeof idValue}`),
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

function getMessageWithIdSuggestion(message: string) {
  return `${message}. How about using "${suggestId()}"?`;
}

function suggestId(): string {
  const partialGuid = crypto.randomUUID().split('-')[0];
  if (isAllDigits(partialGuid)) {
    return suggestId(); // Numeric-only IDs in YAML without quotes are interpreted as numbers
  }
  return partialGuid;
}

function isAllDigits(text: string): boolean {
  return /^\d+$/.test(text);
}
