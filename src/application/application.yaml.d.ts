declare module 'js-yaml-loader!*' {
    export interface ApplicationYaml {
        actions: ReadonlyArray<YamlCategory>;
        functions: ReadonlyArray<YamlFunction> | undefined;
    }

    export interface YamlCategory extends YamlDocumentable {
        children: ReadonlyArray<CategoryOrScript>;
        category: string;
    }

    export type CategoryOrScript = YamlCategory | YamlScript;
    export type DocumentationUrls = ReadonlyArray<string> | string;

    export interface YamlDocumentable {
        docs?: DocumentationUrls;
    }

    export interface YamlFunction {
        name: string;
        code: string;
        revertCode?: string;
        parameters?: readonly string[];
    }

    export interface FunctionCallParameters {
        [index: string]: string;
    }

    export interface FunctionCall {
        function: string;
        parameters?: FunctionCallParameters;
    }

    export type ScriptFunctionCall = readonly FunctionCall[] | FunctionCall | undefined;

    export interface YamlScript extends YamlDocumentable {
        name: string;
        code: string | undefined;
        revertCode: string | undefined;
        call: ScriptFunctionCall;
        recommend: string | undefined;
    }

    const content: ApplicationYaml;
    export default content;
}
