import type { ISharedFunction } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/ISharedFunction';
import type { ISharedFunctionCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/ISharedFunctionCollection';
import { createSharedFunctionStubWithCode } from './SharedFunctionStub';

export class SharedFunctionCollectionStub implements ISharedFunctionCollection {
  private readonly functions = new Map<string, ISharedFunction>();

  public withFunctions(...funcs: readonly ISharedFunction[]): this {
    for (const func of funcs) {
      this.functions.set(func.name, func);
    }
    return this;
  }

  public getFunctionByName(name: string): ISharedFunction {
    const foundFunction = this.functions.get(name);
    if (foundFunction) {
      return foundFunction;
    }
    return createSharedFunctionStubWithCode()
      .withName(name)
      .withCode('code by SharedFunctionCollectionStub')
      .withRevertCode('revert-code by SharedFunctionCollectionStub');
  }

  public getRequiredParameterNames(functionName: string): string[] {
    return this.getFunctionByName(functionName)
      .parameters
      .all
      .filter((p) => !p.isOptional)
      .map((p) => p.name);
  }
}
