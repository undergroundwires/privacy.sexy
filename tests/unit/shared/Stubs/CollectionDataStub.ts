import type {
  CategoryData, ScriptData, CollectionData, ScriptMetadataData, FunctionData,
} from '@/application/collections/';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { createScriptDataWithCode } from './ScriptDataStub';

export class CollectionDataStub implements CollectionData {
  public os = 'windows';

  public actions: readonly CategoryData[] = [getCategoryStub()];

  public scripting: ScriptMetadataData = getTestDefinitionStub();

  public functions?: ReadonlyArray<FunctionData>;

  public withActions(actions: readonly CategoryData[]): this {
    this.actions = actions;
    return this;
  }

  public withOs(os: string): this {
    this.os = os;
    return this;
  }

  public withScriptMetadata(scriptMetadata: ScriptMetadataData): this {
    this.scripting = scriptMetadata;
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

function getTestDefinitionStub(): ScriptMetadataData {
  return {
    language: ScriptLanguage[ScriptLanguage.batchfile],
    startCode: 'start',
    endCode: 'end',
  };
}

function getScriptStub(
  scriptName: string,
  level: RecommendationLevel = RecommendationLevel.Standard,
): ScriptData {
  return createScriptDataWithCode()
    .withName(scriptName)
    .withRecommend(RecommendationLevel[level].toLowerCase());
}
