import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { ParameterSubstitutionParser } from '@/application/Parser/Script/Compiler/Expressions/SyntaxParsers/ParameterSubstitutionParser';
import { CompositeExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/CompositeExpressionParser';
import { ExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/ExpressionsCompiler';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { FunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/FunctionCallArgumentCollection';
import { FunctionCallArgument } from '@/application/Parser/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import { ICodeSubstituter } from './ICodeSubstituter';

export class CodeSubstituter implements ICodeSubstituter {
  constructor(
    private readonly compiler: IExpressionsCompiler = createSubstituteCompiler(),
    private readonly date = new Date(),
  ) {

  }

  public substitute(code: string, info: IProjectInformation): string {
    if (!code) { throw new Error('missing code'); }
    if (!info) { throw new Error('missing info'); }
    const args = new FunctionCallArgumentCollection();
    const substitute = (name: string, value: string) => args
      .addArgument(new FunctionCallArgument(name, value));
    substitute('homepage', info.homepage);
    substitute('version', info.version);
    substitute('date', this.date.toUTCString());
    const compiledCode = this.compiler.compileExpressions(code, args);
    return compiledCode;
  }
}

function createSubstituteCompiler(): IExpressionsCompiler {
  const parsers = [new ParameterSubstitutionParser()];
  const parser = new CompositeExpressionParser(parsers);
  const expressionCompiler = new ExpressionsCompiler(parser);
  return expressionCompiler;
}
