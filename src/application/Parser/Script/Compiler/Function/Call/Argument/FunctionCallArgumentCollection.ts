import { IFunctionCallArgument } from './IFunctionCallArgument';
import { IFunctionCallArgumentCollection } from './IFunctionCallArgumentCollection';

export class FunctionCallArgumentCollection implements IFunctionCallArgumentCollection {
  private readonly arguments = new Map<string, IFunctionCallArgument>();

  public addArgument(argument: IFunctionCallArgument): void {
    if (!argument) {
      throw new Error('missing argument');
    }
    if (this.hasArgument(argument.parameterName)) {
      throw new Error(`argument value for parameter ${argument.parameterName} is already provided`);
    }
    this.arguments.set(argument.parameterName, argument);
  }

  public getAllParameterNames(): string[] {
    return Array.from(this.arguments.keys());
  }

  public hasArgument(parameterName: string): boolean {
    if (!parameterName) {
      throw new Error('missing parameter name');
    }
    return this.arguments.has(parameterName);
  }

  public getArgument(parameterName: string): IFunctionCallArgument {
    if (!parameterName) {
      throw new Error('missing parameter name');
    }
    const arg = this.arguments.get(parameterName);
    if (!arg) {
      throw new Error(`parameter does not exist: ${parameterName}`);
    }
    return arg;
  }
}
