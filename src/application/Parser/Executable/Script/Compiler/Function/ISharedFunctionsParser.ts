import type { FunctionData } from '@/application/collections/';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import type { ISharedFunctionCollection } from './ISharedFunctionCollection';

export interface ISharedFunctionsParser {
  parseFunctions(
    functions: readonly FunctionData[],
    syntax: ILanguageSyntax,
  ): ISharedFunctionCollection;
}
