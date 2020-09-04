declare module 'js-yaml-loader!*' {
    export type CategoryOrScript = YamlCategory | YamlScript;
    export type DocumentationUrls = ReadonlyArray<string> | string;

    export interface YamlDocumentable {
        docs?: DocumentationUrls;
    }

    export interface YamlScript extends YamlDocumentable {
        name: string;
        code: string;
        revertCode: string;
        recommend: boolean;
    }

    export interface YamlCategory extends YamlDocumentable {
        children: ReadonlyArray<CategoryOrScript>;
        category: string;
    }

    export interface ApplicationYaml {
        actions: ReadonlyArray<YamlCategory>;
    }

    const content: ApplicationYaml;
    export default content;
}
