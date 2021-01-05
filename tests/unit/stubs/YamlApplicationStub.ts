import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { YamlCategory, YamlScript, YamlApplication, YamlScriptingDefinition } from 'js-yaml-loader!@/application/application.yaml';

export class YamlApplicationStub implements YamlApplication {
    public os = 'windows';
    public actions: readonly YamlCategory[] = [ getCategoryStub() ];
    public scripting: YamlScriptingDefinition = getTestDefinitionStub();

    public withActions(actions: readonly YamlCategory[]): YamlApplicationStub {
        this.actions = actions;
        return this;
    }

    public withOs(os: string): YamlApplicationStub {
        this.os = os;
        return this;
    }

    public withScripting(scripting: YamlScriptingDefinition): YamlApplicationStub {
        this.scripting = scripting;
        return this;
    }
}

export function getCategoryStub(scriptPrefix = 'testScript'): YamlCategory {
    return {
        category: 'category name',
        children: [
            getScriptStub(`${scriptPrefix}-standard`, RecommendationLevel.Standard),
            getScriptStub(`${scriptPrefix}-strict`, RecommendationLevel.Strict),
        ],
    };
}

function getTestDefinitionStub(): YamlScriptingDefinition {
    return {
        fileExtension: '.bat',
        language: ScriptingLanguage[ScriptingLanguage.batchfile],
        startCode: 'start',
        endCode: 'end',
    };
}

function getScriptStub(scriptName: string, level: RecommendationLevel = RecommendationLevel.Standard): YamlScript {
    return {
        name: scriptName,
        code: 'script code',
        revertCode: 'revert code',
        recommend: RecommendationLevel[level].toLowerCase(),
        call: undefined,
    };
}
