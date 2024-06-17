import type {
  FunctionCallData, CallScriptData, CodeScriptData,
} from '@/application/collections/';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';

export function createScriptDataWithCode(): ScriptDataStub & CodeScriptData {
  return new ScriptDataStub()
    .withCode('stub-code')
    .withRevertCode('stub-revert-code');
}

export function createScriptDataWithCall(
  call?: FunctionCallData,
): ScriptDataStub & CallScriptData {
  let instance = new ScriptDataStub();
  if (call) {
    instance = instance.withCall(call);
  } else {
    instance = instance.withMockCall();
  }
  return instance as ScriptDataStub & CallScriptData;
}

export function createScriptDataWithoutCallOrCodes(): ScriptDataStub {
  return new ScriptDataStub();
}

class ScriptDataStub implements CallScriptData, CodeScriptData {
  public name = 'valid-name';

  public code: string;

  public revertCode: string | undefined = undefined;

  public call: FunctionCallData | undefined = undefined;

  public recommend:
  string | undefined = RecommendationLevel[RecommendationLevel.Standard].toLowerCase();

  public docs?: readonly string[] = ['hello.com'];

  public withName(name: string): this {
    this.name = name;
    return this;
  }

  public withDocs(docs: readonly string[]): this {
    this.docs = docs;
    return this;
  }

  public withCode(code: string): this & CodeScriptData {
    this.code = code;
    return this;
  }

  public withRevertCode(revertCode: string | undefined): this & CodeScriptData {
    this.revertCode = revertCode;
    return this;
  }

  public withMockCall(): this {
    this.call = new FunctionCallDataStub();
    return this;
  }

  public withCall(call: FunctionCallData | undefined): this {
    this.call = call;
    return this;
  }

  public withRecommend(recommend: string | undefined): this {
    this.recommend = recommend;
    return this;
  }

  public withRecommendationLevel(level: RecommendationLevel): this {
    this.recommend = RecommendationLevel[level].toLowerCase();
    return this;
  }
}
