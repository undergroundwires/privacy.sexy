import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/FunctionCall/Argument/IFunctionCallArgumentCollection';
import { scrambledEqual } from '@/application/Common/Array';


export class ExpressionsCompilerStub implements IExpressionsCompiler {
    public readonly callHistory = new Array<{code: string, parameters: IReadOnlyFunctionCallArgumentCollection}>();

    private readonly scenarios = new Array<ITestScenario>();

    public setup(
        code: string,
        parameters: IReadOnlyFunctionCallArgumentCollection,
        result: string): ExpressionsCompilerStub {
        this.scenarios.push({ code, parameters, result });
        return this;
    }
    public compileExpressions(
        code: string,
        parameters: IReadOnlyFunctionCallArgumentCollection): string {
        this.callHistory.push({ code, parameters});
        const scenario = this.scenarios.find((s) => s.code === code && deepEqual(s.parameters, parameters));
        if (scenario) {
            return scenario.result;
        }
        const parametersAndValues = parameters
            .getAllParameterNames()
            .map((name) => `${name}=${parameters.getArgument(name).argumentValue}`)
            .join('", "');
        return `[ExpressionsCompilerStub] code: "${code}" | parameters: "${parametersAndValues}"`;
    }
}

interface ITestScenario {
    readonly code: string;
    readonly parameters: IReadOnlyFunctionCallArgumentCollection;
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
        const expectedValue = expected.getArgument(parameterName);
        const actualValue = expected.getArgument(parameterName);
        if (expectedValue !== actualValue) {
            return false;
        }
    }
    return true;
}
