import type { DocumentableData, DocumentationData } from '@/application/collections/';

export function parseDocs(documentable: DocumentableData): readonly string[] {
  const { docs } = documentable;
  if (!docs) {
    return [];
  }
  let result = new DocumentationContainer();
  result = addDocs(docs, result);
  return result.getAll();
}

function addDocs(
  docs: DocumentationData,
  container: DocumentationContainer,
): DocumentationContainer {
  if (docs instanceof Array) {
    if (docs.length > 0) {
      container.addParts(docs);
    }
  } else if (typeof docs === 'string') {
    container.addPart(docs);
  } else {
    throwInvalidType();
  }
  return container;
}

class DocumentationContainer {
  private readonly parts = new Array<string>();

  public addPart(documentation: string) {
    if (!documentation) {
      throw Error('missing documentation');
    }
    if (typeof documentation !== 'string') {
      throwInvalidType();
    }
    this.parts.push(documentation);
  }

  public addParts(parts: readonly string[]) {
    for (const part of parts) {
      this.addPart(part);
    }
  }

  public getAll(): ReadonlyArray<string> {
    return this.parts;
  }
}

function throwInvalidType() {
  throw new Error('docs field (documentation) must be an array of strings');
}
