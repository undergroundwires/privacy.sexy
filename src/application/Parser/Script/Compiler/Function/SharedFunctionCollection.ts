import { ISharedFunction } from './ISharedFunction';
import { ISharedFunctionCollection } from './ISharedFunctionCollection';

export class SharedFunctionCollection implements ISharedFunctionCollection {
  private readonly functionsByName = new Map<string, ISharedFunction>();

  public addFunction(func: ISharedFunction): void {
    if (!func) { throw new Error('undefined function'); }
    if (this.has(func.name)) {
      throw new Error(`function with name ${func.name} already exists`);
    }
    this.functionsByName.set(func.name, func);
  }

  public getFunctionByName(name: string): ISharedFunction {
    if (!name) { throw Error('undefined function name'); }
    const func = this.functionsByName.get(name);
    if (!func) {
      throw new Error(`called function is not defined "${name}"`);
    }
    return func;
  }

  private has(functionName: string) {
    return this.functionsByName.has(functionName);
  }
}
