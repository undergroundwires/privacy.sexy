declare module 'js-yaml-loader!*' {
    type CategoryOrScript = YamlCategory | YamlScript;
    type DocumentationUrls = ReadonlyArray<string> | string;

    export interface YamlDocumentable {
        docs?: DocumentationUrls;
    }

    export interface YamlScript extends YamlDocumentable {
        name: string;
        code: string;
        recommend: boolean;
    }

    export interface YamlCategory extends YamlDocumentable {
        children: ReadonlyArray<CategoryOrScript>;
        category: string;
    }

    interface ApplicationYaml {
        name: string;
        repositoryUrl: string;
        actions: ReadonlyArray<YamlCategory>;
    }

    const content: ApplicationYaml;
    export default content;
}
