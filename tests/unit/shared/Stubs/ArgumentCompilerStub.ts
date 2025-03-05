import type { FunctionCallCompilationContext } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import type { ArgumentCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Compiler/SingleCall/Strategies/Argument/ArgumentCompiler';
import type { FunctionCall } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/FunctionCall';
import { FunctionCallStub } from './FunctionCallStub';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ArgumentCompilerStub
  extends StubWithObservableMethodCalls<ArgumentCompiler>
  implements ArgumentCompiler {
  private readonly scenarios = new Array<ArgumentCompilationScenario>();

  public createCompiledNestedCall(
    nestedFunctionCall: FunctionCall,
    parentFunctionCall: FunctionCall,
    context: FunctionCallCompilationContext,
  ): FunctionCall {
    this.registerMethodCall({
      methodName: 'createCompiledNestedCall',
      args: [nestedFunctionCall, parentFunctionCall, context],
    });
    const scenario = this.scenarios.find((s) => s.givenNestedFunctionCall === nestedFunctionCall);
    if (scenario) {
      return scenario.result;
    }
    return new FunctionCallStub();
  }

  public withScenario(scenario: ArgumentCompilationScenario): this {
    this.scenarios.push(scenario);
    return this;
  }
}

interface ArgumentCompilationScenario {
  readonly givenNestedFunctionCall: FunctionCall;
  readonly result: FunctionCall;
}
