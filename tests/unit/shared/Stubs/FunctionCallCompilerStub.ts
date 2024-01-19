import { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { FunctionCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompiler';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';

interface IScenario {
  calls: FunctionCall[];
  functions: ISharedFunctionCollection;
  result: CompiledCode;
}

export class FunctionCallCompilerStub implements FunctionCallCompiler {
  public scenarios = new Array<IScenario>();

  public setup(
    calls: FunctionCall[],
    functions: ISharedFunctionCollection,
    result: CompiledCode,
  ) {
    this.scenarios.push({ calls, functions, result });
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
    return {
      code: 'function code [FunctionCallCompilerStub]',
      revertCode: 'function revert code [FunctionCallCompilerStub]',
    };
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
