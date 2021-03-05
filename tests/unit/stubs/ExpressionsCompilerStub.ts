import { IExpressionsCompiler, ParameterValueDictionary } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';

interface Scenario { code: string; parameters: ParameterValueDictionary; result: string; }

export class ExpressionsCompilerStub implements IExpressionsCompiler {
    public readonly callHistory = new Array<{code: string, parameters?: ParameterValueDictionary}>();
    private readonly scenarios = new Array<Scenario>();
    public setup(code: string, parameters: ParameterValueDictionary, result: string) {
        this.scenarios.push({ code, parameters, result });
        return this;
    }
    public compileExpressions(code: string, parameters?: ParameterValueDictionary): string {
        this.callHistory.push({ code, parameters});
        const scenario = this.scenarios.find((s) => s.code === code && deepEqual(s.parameters, parameters));
        if (scenario) {
            return scenario.result;
        }
        return `[ExpressionsCompilerStub] code: "${code}"` +
            `| parameters: ${Object.keys(parameters || {}).map((p) => p + '=' + parameters[p]).join(',')}`;
    }
}

function deepEqual(dict1: ParameterValueDictionary, dict2: ParameterValueDictionary) {
    const dict1Keys = Object.keys(dict1 || {});
    const dict2Keys = Object.keys(dict2 || {});
    if (dict1Keys.length !== dict2Keys.length) {
        return false;
    }
    return dict1Keys.every((key) => dict2.hasOwnProperty(key) && dict2[key] === dict1[key]);
}
