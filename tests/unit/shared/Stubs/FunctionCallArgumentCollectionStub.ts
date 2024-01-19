import { IFunctionCallArgument } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgument';
import { IFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentStub } from './FunctionCallArgumentStub';

export class FunctionCallArgumentCollectionStub implements IFunctionCallArgumentCollection {
  private args = new Array<IFunctionCallArgument>();

  public withEmptyArguments(): this {
    this.args.length = 0;
    return this;
  }

  public withSomeArguments(): this {
    return this
      .withArgument('firstTestParameterName', 'first-parameter-argument-value')
      .withArgument('secondTestParameterName', 'second-parameter-argument-value')
      .withArgument('thirdTestParameterName', 'third-parameter-argument-value');
  }

  public withArgument(parameterName: string, argumentValue: string): this {
    const arg = new FunctionCallArgumentStub()
      .withParameterName(parameterName)
      .withArgumentValue(argumentValue);
    this.addArgument(arg);
    return this;
  }

  public withArguments(args: { readonly [index: string]: string }): this {
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
