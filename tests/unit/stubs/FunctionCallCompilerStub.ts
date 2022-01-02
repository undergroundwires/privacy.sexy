import { ICompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/ICompiledCode';
import { IFunctionCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/IFunctionCallCompiler';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { IFunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/IFunctionCall';

interface IScenario {
  calls: IFunctionCall[];
  functions: ISharedFunctionCollection;
  result: ICompiledCode;
}

export class FunctionCallCompilerStub implements IFunctionCallCompiler {
  public scenarios = new Array<IScenario>();

  public setup(
    calls: IFunctionCall[],
    functions: ISharedFunctionCollection,
    result: ICompiledCode,
  ) {
    this.scenarios.push({ calls, functions, result });
  }

  public compileCall(
    calls: IFunctionCall[],
    functions: ISharedFunctionCollection,
  ): ICompiledCode {
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
  first: readonly IFunctionCall[],
  second: readonly IFunctionCall[],
) {
  const comparer = (a: IFunctionCall, b: IFunctionCall) => a.functionName
    .localeCompare(b.functionName);
  const printSorted = (calls: readonly IFunctionCall[]) => JSON
    .stringify([...calls].sort(comparer));
  return printSorted(first) === printSorted(second);
}
