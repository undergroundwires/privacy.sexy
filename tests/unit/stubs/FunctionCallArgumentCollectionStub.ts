import { IFunctionCallArgument } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgument';
import { IFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentStub } from './FunctionCallArgumentStub';

export class FunctionCallArgumentCollectionStub implements IFunctionCallArgumentCollection {
  private args = new Array<IFunctionCallArgument>();

  public withArgument(parameterName: string, argumentValue: string) {
    const arg = new FunctionCallArgumentStub()
      .withParameterName(parameterName)
      .withArgumentValue(argumentValue);
    this.addArgument(arg);
    return this;
  }

  public withArguments(args: { readonly [index: string]: string }) {
    for (const [name, value] of Object.entries(args)) {
      this.withArgument(name, value);
    }
    return this;
  }

  public hasArgument(parameterName: string): boolean {
    return this.args.some((a) => a.parameterName === parameterName);
  }

  public addArgument(argument: IFunctionCallArgument): void {
    this.args.push(argument);
  }

  public getAllParameterNames(): string[] {
    return this.args.map((a) => a.parameterName);
  }

  public getArgument(parameterName: string): IFunctionCallArgument {
    const arg = this.args.find((a) => a.parameterName === parameterName);
    if (!arg) {
      throw new Error(`no argument exists for parameter "${parameterName}"`);
    }
    return arg;
  }
}
