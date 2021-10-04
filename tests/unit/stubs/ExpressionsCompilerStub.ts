import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { scrambledEqual } from '@/application/Common/Array';
import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/stubs/FunctionCallArgumentCollectionStub';


export class ExpressionsCompilerStub implements IExpressionsCompiler {
    public readonly callHistory = new Array<{code: string, parameters: IReadOnlyFunctionCallArgumentCollection}>();

    private readonly scenarios = new Array<ITestScenario>();

    public setup(scenario: ITestScenario): ExpressionsCompilerStub {
        this.scenarios.push(scenario);
        return this;
    }
    public setupToReturnFunctionCode(func: ISharedFunction, givenArgs: FunctionCallArgumentCollectionStub) {
        return this
            .setup({ givenCode: func.body.code.do,      givenArgs,    result: func.body.code.do })
            .setup({ givenCode: func.body.code.revert,  givenArgs,    result: func.body.code.revert });
    }
    public compileExpressions(
        code: string,
        parameters: IReadOnlyFunctionCallArgumentCollection): string {
        this.callHistory.push({ code, parameters});
        const scenario = this.scenarios.find((s) => s.givenCode === code && deepEqual(s.givenArgs, parameters));
        if (scenario) {
            return scenario.result;
        }
        const parametersAndValues = parameters
            .getAllParameterNames()
            .map((name) => `${name}=${parameters.getArgument(name).argumentValue}`)
            .join('\n\t');
        return `[ExpressionsCompilerStub]\ncode: "${code}"\nparameters: ${parametersAndValues}`;
    }
}

interface ITestScenario {
    readonly givenCode: string;
    readonly givenArgs: IReadOnlyFunctionCallArgumentCollection;
    readonly result: string;
}

function deepEqual(
    expected: IReadOnlyFunctionCallArgumentCollection,
    actual: IReadOnlyFunctionCallArgumentCollection): boolean {
    const expectedParameterNames = expected.getAllParameterNames();
    const actualParameterNames = actual.getAllParameterNames();
    if (!scrambledEqual(expectedParameterNames, actualParameterNames)) {
        return false;
    }
    for (const parameterName of expectedParameterNames) {
        const expectedValue = expected.getArgument(parameterName).argumentValue;
        const actualValue = actual.getArgument(parameterName).argumentValue;
        if (expectedValue !== actualValue) {
            return false;
        }
    }
    return true;
}
