import { ExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/ExpressionsCompiler';
import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { SingleCallCompilerStrategy } from '../SingleCallCompilerStrategy';

export class InlineFunctionCallCompiler implements SingleCallCompilerStrategy {
  public constructor(
    private readonly expressionsCompiler: IExpressionsCompiler = new ExpressionsCompiler(),
  ) {
  }

  public canCompile(func: ISharedFunction): boolean {
    return func.body.code !== undefined;
  }

  public compileFunction(
    calledFunction: ISharedFunction,
    callToFunction: FunctionCall,
  ): CompiledCode[] {
    const { code } = calledFunction.body;
    const { args } = callToFunction;
    return [
      {
        code: this.expressionsCompiler.compileExpressions(code.execute, args),
        revertCode: this.expressionsCompiler.compileExpressions(code.revert, args),
      },
    ];
  }
}
