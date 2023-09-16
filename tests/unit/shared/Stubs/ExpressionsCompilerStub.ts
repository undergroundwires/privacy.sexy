import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { scrambledEqual } from '@/application/Common/Array';
import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ExpressionsCompilerStub
  extends StubWithObservableMethodCalls<IExpressionsCompiler>
  implements IExpressionsCompiler {
  private readonly scenarios = new Array<ExpressionCompilationScenario>();

  public setup(scenario: ExpressionCompilationScenario): ExpressionsCompilerStub {
    this.scenarios.push(scenario);
    return this;
  }

  public setupToReturnFunctionCode(
    func: ISharedFunction,
    givenArgs: FunctionCallArgumentCollectionStub,
  ) {
    return this
      .setup({ givenCode: func.body.code.execute, givenArgs, result: func.body.code.execute })
      .setup({ givenCode: func.body.code.revert, givenArgs, result: func.body.code.revert });
  }

  public compileExpressions(
    code: string,
    parameters: IReadOnlyFunctionCallArgumentCollection,
  ): string {
    this.registerMethodCall({
      methodName: 'compileExpressions',
      args: [code, parameters],
    });
    const scenario = this.scenarios.find(
      (s) => s.givenCode === code && deepEqual(s.givenArgs, parameters),
    );
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

interface ExpressionCompilationScenario {
  readonly givenCode: string;
  readonly givenArgs: IReadOnlyFunctionCallArgumentCollection;
  readonly result: string;
}

function deepEqual(
  expected: IReadOnlyFunctionCallArgumentCollection,
  actual: IReadOnlyFunctionCallArgumentCollection,
): boolean {
  const expectedParameterNames = expected.getAllParameterNames();
  const actualParameterNames = actual.getAllParameterNames();
  if (!scrambledEqual(expectedParameterNames, actualParameterNames)) {
    return false;
  }
  return expectedParameterNames.every((parameterName) => {
    const expectedValue = expected.getArgument(parameterName).argumentValue;
    const actualValue = actual.getArgument(parameterName).argumentValue;
    return expectedValue === actualValue;
  });
}
