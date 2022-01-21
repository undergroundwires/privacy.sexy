import { DocumentableData, DocumentationUrlsData } from 'js-yaml-loader!@/*';

export function parseDocUrls(documentable: DocumentableData): ReadonlyArray<string> {
  if (!documentable) {
    throw new Error('missing documentable');
  }
  const { docs } = documentable;
  if (!docs || !docs.length) {
    return [];
  }
  let result = new DocumentationUrlContainer();
  result = addDocs(docs, result);
  return result.getAll();
}

function addDocs(
  docs: DocumentationUrlsData,
  urls: DocumentationUrlContainer,
): DocumentationUrlContainer {
  if (docs instanceof Array) {
    urls.addUrls(docs);
  } else if (typeof docs === 'string') {
    urls.addUrl(docs);
  } else {
    throw new Error('Docs field (documentation url) must a string or array of strings');
  }
  return urls;
}

class DocumentationUrlContainer {
  private readonly urls = new Array<string>();

  public addUrl(url: string) {
    validateUrl(url);
    this.urls.push(url);
  }

  public addUrls(urls: readonly string[]) {
    for (const url of urls) {
      if (typeof url !== 'string') {
        throw new Error('Docs field (documentation url) must be an array of strings');
      }
      this.addUrl(url);
    }
  }

  public getAll(): ReadonlyArray<string> {
    return this.urls;
  }
}

function validateUrl(docUrl: string): void {
  if (!docUrl) {
    throw new Error('Documentation url is null or empty');
  }
  if (docUrl.includes('\n')) {
    throw new Error('Documentation url cannot be multi-lined.');
  }
  const validUrlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
  const res = docUrl.match(validUrlRegex);
  if (res == null) {
    throw new Error(`Invalid documentation url: ${docUrl}`);
  }
}
