declare module 'js-yaml-loader!*' {
    export interface CollectionData {
        readonly os: string;
        readonly scripting: ScriptingDefinitionData;
        readonly actions: ReadonlyArray<CategoryData>;
        readonly functions?: ReadonlyArray<FunctionData>;
    }

    export interface CategoryData extends DocumentableData {
        readonly children: ReadonlyArray<CategoryOrScriptData>;
        readonly category: string;
    }

    export type CategoryOrScriptData = CategoryData | ScriptData;
    export type DocumentationUrlsData = ReadonlyArray<string> | string;

    export interface DocumentableData {
        readonly docs?: DocumentationUrlsData;
    }

    export interface FunctionData {
        name: string;
        code: string;
        revertCode?: string;
        parameters?: readonly string[];
    }

    export interface FunctionCallParametersData {
        [index: string]: string;
    }

    export interface FunctionCallData {
        function: string;
        parameters?: FunctionCallParametersData;
    }

    export type ScriptFunctionCallData = readonly FunctionCallData[] | FunctionCallData | undefined;

    export interface ScriptData extends DocumentableData {
        name: string;
        code?: string;
        revertCode?: string;
        call: ScriptFunctionCallData;
        recommend?: string;
    }

    export interface ScriptingDefinitionData {
        readonly language: string;
        readonly fileExtension: string;
        readonly startCode: string;
        readonly endCode: string;
    }

    const content: CollectionData;
    export default content;
}
