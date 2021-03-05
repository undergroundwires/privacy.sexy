import { IExpressionsCompiler, ParameterValueDictionary } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { ParameterSubstitutionParser } from '@/application/Parser/Script/Compiler/Expressions/SyntaxParsers/ParameterSubstitutionParser';
import { CompositeExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/CompositeExpressionParser';
import { ExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/ExpressionsCompiler';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ICodeSubstituter } from './ICodeSubstituter';

export class CodeSubstituter implements ICodeSubstituter {
    constructor(
        private readonly compiler: IExpressionsCompiler = createSubstituteCompiler(),
        private readonly date = new Date(),
    ) {

    }
    public substitute(code: string, info: IProjectInformation): string {
        if (!code) { throw new Error('undefined code'); }
        if (!info) { throw new Error('undefined info'); }
        const parameters: ParameterValueDictionary = {
            homepage: info.homepage,
            version: info.version,
            date: this.date.toUTCString(),
        };
        const compiledCode = this.compiler.compileExpressions(code, parameters);
        return compiledCode;
    }
}

function createSubstituteCompiler(): IExpressionsCompiler {
    const parsers = [ new ParameterSubstitutionParser() ];
    const parser = new CompositeExpressionParser(parsers);
    const expressionCompiler = new ExpressionsCompiler(parser);
    return expressionCompiler;
}
