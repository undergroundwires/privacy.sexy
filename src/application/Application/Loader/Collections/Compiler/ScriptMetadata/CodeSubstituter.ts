import { ParameterSubstitutionParser } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/SyntaxParsers/ParameterSubstitutionParser';
import { CompositeExpressionParser } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Parser/CompositeExpressionParser';
import { ExpressionsCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/ExpressionsCompiler';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { FunctionCallArgumentCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgumentCollection';
import type { IExpressionParser } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Parser/IExpressionParser';
import { createFunctionCallArgument, type FunctionCallArgumentFactory } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import type { IExpressionsCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/IExpressionsCompiler';

export interface CodeSubstituter {
  (
    code: string,
    projectDetails: ProjectDetails,
    utilities?: CodeSubstitutionUtilities,
  ): string;
}

export const substituteCode: CodeSubstituter = (
  code,
  projectDetails,
  utilities = DefaultUtilities,
) => {
  if (!code) { throw new Error('missing code'); }
  const args = new FunctionCallArgumentCollection();
  const substitute = (name: string, value: string) => args
    .addArgument(utilities.createCallArgument(name, value));
  substitute('homepage', projectDetails.homepage);
  substitute('version', projectDetails.version.toString());
  substitute('date', utilities.provideDate().toUTCString());
  const compiledCode = utilities.compiler.compileExpressions(code, args);
  return compiledCode;
};

function createSubstituteCompiler(): IExpressionsCompiler {
  const parsers: readonly IExpressionParser[] = [
    new ParameterSubstitutionParser(),
  ] as const;
  const parser = new CompositeExpressionParser(parsers);
  const expressionCompiler = new ExpressionsCompiler(parser);
  return expressionCompiler;
}

interface CodeSubstitutionUtilities {
  readonly compiler: IExpressionsCompiler;
  readonly provideDate: () => Date;
  readonly createCallArgument: FunctionCallArgumentFactory;
}

const DefaultUtilities: CodeSubstitutionUtilities = {
  compiler: createSubstituteCompiler(),
  provideDate: () => new Date(),
  createCallArgument: createFunctionCallArgument,
};
