import type { DocumentableData, DocumentationData } from '@/application/collections/';
import { isString, isArray } from '@/TypeHelpers';

export const parseDocs: DocsParser = (documentable) => {
  const { docs } = documentable;
  if (!docs) {
    return [];
  }
  let result = new DocumentationContainer();
  result = addDocs(docs, result);
  return result.getAll();
};

export interface DocsParser {
  (
    documentable: DocumentableData,
  ): readonly string[];
}

function addDocs(
  docs: DocumentationData,
  container: DocumentationContainer,
): DocumentationContainer {
  if (isArray(docs)) {
    docs.forEach((doc) => container.addPart(doc));
  } else if (isString(docs)) {
    container.addPart(docs);
  } else {
    throwInvalidType();
  }
  return container;
}

class DocumentationContainer {
  private readonly parts = new Array<string>();

  public addPart(documentation: unknown): void {
    if (!documentation) {
      throw Error('missing documentation');
    }
    if (!isString(documentation)) {
      throwInvalidType();
    }
    this.parts.push(documentation);
  }

  public getAll(): ReadonlyArray<string> {
    return this.parts;
  }
}

function throwInvalidType(): never {
  throw new Error('docs field (documentation) must be an array of strings');
}
