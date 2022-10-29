import type { FunctionData } from '@/application/collections/';
import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { ISharedFunctionCollection } from './ISharedFunctionCollection';

export interface ISharedFunctionsParser {
  parseFunctions(
    functions: readonly FunctionData[],
    syntax: ILanguageSyntax,
  ): ISharedFunctionCollection;
}
