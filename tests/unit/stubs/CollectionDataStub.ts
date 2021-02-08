import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { CategoryData, ScriptData, CollectionData, ScriptingDefinitionData, FunctionData } from 'js-yaml-loader!@/*';

export class CollectionDataStub implements CollectionData {
    public os = 'windows';
    public actions: readonly CategoryData[] = [ getCategoryStub() ];
    public scripting: ScriptingDefinitionData = getTestDefinitionStub();
    public functions?: ReadonlyArray<FunctionData>;

    public withActions(actions: readonly CategoryData[]): CollectionDataStub {
        this.actions = actions;
        return this;
    }
    public withOs(os: string): CollectionDataStub {
        this.os = os;
        return this;
    }
    public withScripting(scripting: ScriptingDefinitionData): CollectionDataStub {
        this.scripting = scripting;
        return this;
    }
    public withFunctions(functions: ReadonlyArray<FunctionData>) {
        this.functions = functions;
        return this;
    }
}

export function getCategoryStub(scriptPrefix = 'testScript'): CategoryData {
    return {
        category: 'category name',
        children: [
            getScriptStub(`${scriptPrefix}-standard`, RecommendationLevel.Standard),
            getScriptStub(`${scriptPrefix}-strict`, RecommendationLevel.Strict),
        ],
    };
}

function getTestDefinitionStub(): ScriptingDefinitionData {
    return {
        fileExtension: '.bat',
        language: ScriptingLanguage[ScriptingLanguage.batchfile],
        startCode: 'start',
        endCode: 'end',
    };
}

function getScriptStub(scriptName: string, level: RecommendationLevel = RecommendationLevel.Standard): ScriptData {
    return {
        name: scriptName,
        code: 'script code',
        revertCode: 'revert code',
        recommend: RecommendationLevel[level].toLowerCase(),
        call: undefined,
    };
}
