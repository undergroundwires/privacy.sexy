import { YamlDocumentable } from 'js-yaml-loader!./application.yaml';

export function parseDocUrls(documentable: YamlDocumentable): ReadonlyArray<string> {
    const docs = documentable.docs;
    if (!docs) {
        return [];
    }
    const result = new DocumentationUrls();
    if (docs instanceof Array) {
        for (const doc of docs) {
            if (typeof doc !== 'string') {
                throw new Error('Docs field (documentation url) must be an array of strings');
            }
            result.add(doc);
        }
    } else if (typeof docs === 'string') {
        result.add(docs);
    } else {
        throw new Error('Docs field (documentation url) must a string or array of strings');
    }
    return result.getAll();
}

class DocumentationUrls {
    private readonly urls = new Array<string>();

    public add(url: string) {
        validateUrl(url);
        this.urls.push(url);
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
    const res = docUrl.match(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (res == null) {
        throw new Error(`Invalid documentation url: ${docUrl}`);
    }
}
