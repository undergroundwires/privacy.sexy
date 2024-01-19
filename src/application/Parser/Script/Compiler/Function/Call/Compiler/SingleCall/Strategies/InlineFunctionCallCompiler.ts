import { ExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/ExpressionsCompiler';
import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { FunctionBodyType, ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { SingleCallCompilerStrategy } from '../SingleCallCompilerStrategy';

export class InlineFunctionCallCompiler implements SingleCallCompilerStrategy {
  public constructor(
    private readonly expressionsCompiler: IExpressionsCompiler = new ExpressionsCompiler(),
  ) {
  }

  public canCompile(func: ISharedFunction): boolean {
    return func.body.type === FunctionBodyType.Code;
  }

  public compileFunction(
    calledFunction: ISharedFunction,
    callToFunction: FunctionCall,
  ): CompiledCode[] {
    if (calledFunction.body.type !== FunctionBodyType.Code) {
      throw new Error([
        'Unexpected function body type.',
        `\tExpected: "${FunctionBodyType[FunctionBodyType.Code]}"`,
        `\tActual: "${FunctionBodyType[calledFunction.body.type]}"`,
        'Function:',
        `\t${JSON.stringify(callToFunction)}`,
      ].join('\n'));
    }
    const { code } = calledFunction.body;
    const { args } = callToFunction;
    return [
      {
        code: this.expressionsCompiler.compileExpressions(code.execute, args),
        revertCode: (() => {
          if (!code.revert) {
            return undefined;
          }
          return this.expressionsCompiler.compileExpressions(code.revert, args);
        })(),
      },
    ];
  }
}
