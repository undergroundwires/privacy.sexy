import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptFunctionCallData, ScriptData } from 'js-yaml-loader!@/*';

export class ScriptDataStub implements ScriptData {
    public static createWithCode(): ScriptDataStub {
        return new ScriptDataStub()
            .withCode('stub-code')
            .withRevertCode('stub-revert-code');
    }
    public static createWithCall(call?: ScriptFunctionCallData): ScriptDataStub {
        let instance = new ScriptDataStub();
        if (call) {
            instance = instance.withCall(call);
        } else {
            instance = instance.withMockCall();
        }
        return instance;
    }
    public static createWithoutCallOrCodes(): ScriptDataStub {
        return new ScriptDataStub();
    }

    public name = 'valid-name';
    public code = undefined;
    public revertCode = undefined;
    public call = undefined;
    public recommend = RecommendationLevel[RecommendationLevel.Standard].toLowerCase();
    public docs = ['hello.com'];

    public withName(name: string): ScriptDataStub {
        this.name = name;
        return this;
    }
    public withDocs(docs: string[]): ScriptDataStub {
        this.docs = docs;
        return this;
    }
    public withCode(code: string): ScriptDataStub {
        this.code = code;
        return this;
    }
    public withRevertCode(revertCode: string): ScriptDataStub {
        this.revertCode = revertCode;
        return this;
    }
    public withMockCall(): ScriptDataStub {
        this.call = { function: 'func', parameters: [] };
        return this;
    }
    public withCall(call: ScriptFunctionCallData): ScriptDataStub {
        this.call = call;
        return this;
    }
    public withRecommend(recommend: string): ScriptDataStub {
        this.recommend = recommend;
        return this;
    }
    public withRecommendationLevel(level: RecommendationLevel): ScriptDataStub {
        this.recommend = RecommendationLevel[level].toLowerCase();
        return this;
    }
}
