declare module 'js-yaml-loader!*' {
    export interface YamlApplication {
        readonly os: string;
        readonly scripting: YamlScriptingDefinition;
        readonly actions: ReadonlyArray<YamlCategory>;
        readonly functions?: ReadonlyArray<YamlFunction>;
    }

    export interface YamlCategory extends YamlDocumentable {
        readonly children: ReadonlyArray<CategoryOrScript>;
        readonly category: string;
    }

    export type CategoryOrScript = YamlCategory | YamlScript;
    export type DocumentationUrls = ReadonlyArray<string> | string;

    export interface YamlDocumentable {
        readonly docs?: DocumentationUrls;
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

    export interface YamlScriptingDefinition {
        readonly language: string;
        readonly fileExtension: string;
        readonly startCode: string;
        readonly endCode: string;
    }

    const content: YamlApplication;
    export default content;
}
