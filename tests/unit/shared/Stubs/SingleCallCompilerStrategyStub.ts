import type { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import type { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import type { SingleCallCompilerStrategy } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/SingleCallCompilerStrategy';
import type { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import type { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import { CompiledCodeStub } from './CompiledCodeStub';

export class SingleCallCompilerStrategyStub
  extends StubWithObservableMethodCalls<SingleCallCompilerStrategy>
  implements SingleCallCompilerStrategy {
  private canCompileResult = true;

  private compiledFunctionResult: CompiledCode[] = [new CompiledCodeStub()];

  public canCompile(func: ISharedFunction): boolean {
    this.registerMethodCall({
      methodName: 'canCompile',
      args: [func],
    });
    return this.canCompileResult;
  }

  public compileFunction(
    calledFunction: ISharedFunction,
    callToFunction: FunctionCall,
    context: FunctionCallCompilationContext,
  ): CompiledCode[] {
    this.registerMethodCall({
      methodName: 'compileFunction',
      args: [calledFunction, callToFunction, context],
    });
    return this.compiledFunctionResult;
  }

  public withCanCompileResult(canCompileResult: boolean): this {
    this.canCompileResult = canCompileResult;
    return this;
  }

  public withCompiledFunctionResult(compiledFunctionResult: CompiledCode[]): this {
    this.compiledFunctionResult = compiledFunctionResult;
    return this;
  }
}
