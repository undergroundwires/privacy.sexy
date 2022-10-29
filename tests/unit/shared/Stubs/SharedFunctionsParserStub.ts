import type { FunctionData } from '@/application/collections/';
import { sequenceEqual } from '@/application/Common/Array';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { ISharedFunctionsParser } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionsParser';
import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { SharedFunctionCollectionStub } from './SharedFunctionCollectionStub';

export class SharedFunctionsParserStub implements ISharedFunctionsParser {
  public callHistory = new Array<{
    functions: readonly FunctionData[],
    syntax: ILanguageSyntax,
  }>();

  private setupResults = new Array<{
    functions: readonly FunctionData[],
    result: ISharedFunctionCollection,
  }>();

  public setup(functions: readonly FunctionData[], result: ISharedFunctionCollection) {
    this.setupResults.push({ functions, result });
  }

  public parseFunctions(
    functions: readonly FunctionData[],
    syntax: ILanguageSyntax,
  ): ISharedFunctionCollection {
    this.callHistory.push({
      functions: Array.from(functions),
      syntax,
    });
    const result = this.findResult(functions);
    return result || new SharedFunctionCollectionStub();
  }

  private findResult(functions: readonly FunctionData[]): ISharedFunctionCollection {
    return this.setupResults
      .find((result) => sequenceEqual(result.functions, functions))
      ?.result;
  }
}
