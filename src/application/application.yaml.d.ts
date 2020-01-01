declare module 'js-yaml-loader!*' {
    type CategoryOrScript = YamlCategory | YamlScript;
    type DocumentationUrls = ReadonlyArray<string> | string;

    export interface YamlDocumentable {
        docs?: DocumentationUrls;
    }

    export interface YamlScript extends YamlDocumentable {
        name: string;
        code: string;
        default: boolean;
    }

    export interface YamlCategory extends YamlDocumentable {
        children: ReadonlyArray<CategoryOrScript>;
        category: string;
    }

    interface ApplicationYaml {
        name: string;
        version: number;
        actions: ReadonlyArray<YamlCategory>;
    }

    const content: ApplicationYaml;
    export default content;
}
