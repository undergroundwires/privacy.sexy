declare module 'js-yaml-loader!@/*' {
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

    export interface InstructionHolder {
        readonly name: string;

        readonly code?: string;
        readonly revertCode?: string;

        readonly call?: FunctionCallsData;
    }

    export interface ParameterDefinitionData {
        readonly name: string;
        readonly optional?: boolean;
    }

    export interface FunctionData extends InstructionHolder {
        readonly parameters?: readonly ParameterDefinitionData[];
    }

    export interface FunctionCallParametersData {
        readonly [index: string]: string;
    }

    export interface FunctionCallData {
        readonly function: string;
        readonly parameters?: FunctionCallParametersData;
    }

    export type FunctionCallsData = readonly FunctionCallData[] | FunctionCallData | undefined;

    export interface ScriptData extends InstructionHolder, DocumentableData {
        readonly name: string;
        readonly recommend?: string;
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
