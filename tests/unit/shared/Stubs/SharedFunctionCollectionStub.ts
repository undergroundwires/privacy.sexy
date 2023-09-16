import { ISharedFunction, FunctionBodyType } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { SharedFunctionStub } from './SharedFunctionStub';

export class SharedFunctionCollectionStub implements ISharedFunctionCollection {
  private readonly functions = new Map<string, ISharedFunction>();

  public withFunctions(...funcs: readonly ISharedFunction[]): this {
    for (const func of funcs) {
      this.functions.set(func.name, func);
    }
    return this;
  }

  public getFunctionByName(name: string): ISharedFunction {
    if (this.functions.has(name)) {
      return this.functions.get(name);
    }
    return new SharedFunctionStub(FunctionBodyType.Code)
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
