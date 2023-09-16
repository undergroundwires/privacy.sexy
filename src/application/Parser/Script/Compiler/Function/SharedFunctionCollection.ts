import { ISharedFunction } from './ISharedFunction';
import { ISharedFunctionCollection } from './ISharedFunctionCollection';

export class SharedFunctionCollection implements ISharedFunctionCollection {
  private readonly functionsByName = new Map<string, ISharedFunction>();

  public addFunction(func: ISharedFunction): void {
    if (!func) { throw new Error('missing function'); }
    if (this.has(func.name)) {
      throw new Error(`function with name ${func.name} already exists`);
    }
    this.functionsByName.set(func.name, func);
  }

  public getFunctionByName(name: string): ISharedFunction {
    if (!name) { throw Error('missing function name'); }
    const func = this.functionsByName.get(name);
    if (!func) {
      throw new Error(`called function is not defined "${name}"`);
    }
    return func;
  }

  public getRequiredParameterNames(functionName: string): string[] {
    return this
      .getFunctionByName(functionName)
      .parameters
      .all
      .filter((parameter) => !parameter.isOptional)
      .map((parameter) => parameter.name);
  }

  private has(functionName: string) {
    return this.functionsByName.has(functionName);
  }
}
