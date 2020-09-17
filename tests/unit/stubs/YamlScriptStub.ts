import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptFunctionCall, YamlScript } from 'js-yaml-loader!./application.yaml';

export class YamlScriptStub implements YamlScript {
    public static createWithCode(): YamlScriptStub {
        return new YamlScriptStub()
            .withCode('stub-code')
            .withRevertCode('stub-revert-code');
    }
    public static createWithCall(call?: ScriptFunctionCall): YamlScriptStub {
        let instance = new YamlScriptStub();
        if (call) {
            instance = instance.withCall(call);
        } else {
            instance = instance.withMockCall();
        }
        return instance;
    }
    public static createWithoutCallOrCodes(): YamlScriptStub {
        return new YamlScriptStub();
    }

    public name = 'valid-name';
    public code = undefined;
    public revertCode = undefined;
    public call = undefined;
    public recommend = RecommendationLevel[RecommendationLevel.Standard].toLowerCase();
    public docs = ['hello.com'];

    private constructor() { }

    public withName(name: string): YamlScriptStub {
        this.name = name;
        return this;
    }

    public withDocs(docs: string[]): YamlScriptStub {
        this.docs = docs;
        return this;
    }

    public withCode(code: string): YamlScriptStub {
        this.code = code;
        return this;
    }

    public withRevertCode(revertCode: string): YamlScriptStub {
        this.revertCode = revertCode;
        return this;
    }

    public withMockCall(): YamlScriptStub {
        this.call = { function: 'func', parameters: [] };
        return this;
    }

    public withCall(call: ScriptFunctionCall): YamlScriptStub {
        this.call = call;
        return this;
    }
}
