import type { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { ParameterSubstitutionParser } from '@/application/Parser/Script/Compiler/Expressions/SyntaxParsers/ParameterSubstitutionParser';
import { CompositeExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/CompositeExpressionParser';
import { ExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/ExpressionsCompiler';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { FunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/FunctionCallArgumentCollection';
import { FunctionCallArgument } from '@/application/Parser/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import type { IExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/IExpressionParser';
import type { ICodeSubstituter } from './ICodeSubstituter';

export class CodeSubstituter implements ICodeSubstituter {
  constructor(
    private readonly compiler: IExpressionsCompiler = createSubstituteCompiler(),
    private readonly date = new Date(),
  ) {

  }

  public substitute(code: string, projectDetails: ProjectDetails): string {
    if (!code) { throw new Error('missing code'); }
    const args = new FunctionCallArgumentCollection();
    const substitute = (name: string, value: string) => args
      .addArgument(new FunctionCallArgument(name, value));
    substitute('homepage', projectDetails.homepage);
    substitute('version', projectDetails.version.toString());
    substitute('date', this.date.toUTCString());
    const compiledCode = this.compiler.compileExpressions(code, args);
    return compiledCode;
  }
}

function createSubstituteCompiler(): IExpressionsCompiler {
  const parsers: readonly IExpressionParser[] = [
    new ParameterSubstitutionParser(),
  ] as const;
  const parser = new CompositeExpressionParser(parsers);
  const expressionCompiler = new ExpressionsCompiler(parser);
  return expressionCompiler;
}
