import type { FunctionCallCompilationContext } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import type { SingleCallCompiler } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/SingleCall/SingleCallCompiler';
import type { FunctionCall } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCall';
import type { ISharedFunctionCollection } from '@/application/Parser/Executable/Script/Compiler/Function/ISharedFunctionCollection';
import { SingleCallCompilerStub } from './SingleCallCompilerStub';
import { FunctionCallStub } from './FunctionCallStub';
import { SharedFunctionCollectionStub } from './SharedFunctionCollectionStub';

export class FunctionCallCompilationContextStub implements FunctionCallCompilationContext {
  public allFunctions: ISharedFunctionCollection = new SharedFunctionCollectionStub();

  public rootCallSequence: readonly FunctionCall[] = [
    new FunctionCallStub(), new FunctionCallStub(),
  ];

  public singleCallCompiler: SingleCallCompiler = new SingleCallCompilerStub();

  public withSingleCallCompiler(singleCallCompiler: SingleCallCompiler): this {
    this.singleCallCompiler = singleCallCompiler;
    return this;
  }

  public withAllFunctions(allFunctions: ISharedFunctionCollection): this {
    this.allFunctions = allFunctions;
    return this;
  }
}
