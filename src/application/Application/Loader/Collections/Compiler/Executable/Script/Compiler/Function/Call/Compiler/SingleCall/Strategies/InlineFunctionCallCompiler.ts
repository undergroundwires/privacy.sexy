import { ExpressionsCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/ExpressionsCompiler';
import type { IExpressionsCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/IExpressionsCompiler';
import { FunctionBodyType, type ISharedFunction } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/ISharedFunction';
import type { FunctionCall } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/FunctionCall';
import type { CompiledCode } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { indentText } from '@/application/Common/Text/IndentText';
import type { SingleCallCompilerStrategy } from '../SingleCallCompilerStrategy';

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
        indentText([
          `Expected: "${FunctionBodyType[FunctionBodyType.Code]}"`,
          `Actual: "${FunctionBodyType[calledFunction.body.type]}"`,
        ].join('\n')),
        'Function:',
        indentText(JSON.stringify(callToFunction)),
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
