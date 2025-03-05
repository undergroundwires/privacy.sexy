import type { CompiledCode } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Compiler/CompiledCode';
import type { FunctionCallCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Compiler/FunctionCallCompiler';
import type { ISharedFunctionCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/ISharedFunctionCollection';
import type { FunctionCall } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/FunctionCall';
import { CompiledCodeStub } from './CompiledCodeStub';

interface FunctionCallCompilationTestScenario {
  readonly calls: FunctionCall[];
  readonly functions: ISharedFunctionCollection;
  readonly result: CompiledCode;
}

export class FunctionCallCompilerStub implements FunctionCallCompiler {
  public scenarios = new Array<FunctionCallCompilationTestScenario>();

  private defaultCompiledCode: CompiledCode = new CompiledCodeStub()
    .withCode(`[${FunctionCallCompilerStub.name}] function code`)
    .withRevertCode(`[${FunctionCallCompilerStub.name}] function revert code`);

  public setup(
    calls: FunctionCall[],
    functions: ISharedFunctionCollection,
    result: CompiledCode,
  ): this {
    this.scenarios.push({ calls, functions, result });
    return this;
  }

  public withDefaultCompiledCode(defaultCompiledCode: CompiledCode): this {
    this.defaultCompiledCode = defaultCompiledCode;
    return this;
  }

  public compileFunctionCalls(
    calls: readonly FunctionCall[],
    functions: ISharedFunctionCollection,
  ): CompiledCode {
    const predefined = this.scenarios
      .find((s) => areEqual(s.calls, calls) && s.functions === functions);
    if (predefined) {
      return predefined.result;
    }
    return this.defaultCompiledCode;
  }
}

function areEqual(
  first: readonly FunctionCall[],
  second: readonly FunctionCall[],
) {
  const comparer = (a: FunctionCall, b: FunctionCall) => a.functionName
    .localeCompare(b.functionName);
  const printSorted = (calls: readonly FunctionCall[]) => JSON
    .stringify([...calls].sort(comparer));
  return printSorted(first) === printSorted(second);
}
