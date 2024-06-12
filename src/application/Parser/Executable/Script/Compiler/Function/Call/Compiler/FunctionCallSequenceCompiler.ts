import type { FunctionCall } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCall';
import { NewlineCodeSegmentMerger } from './CodeSegmentJoin/NewlineCodeSegmentMerger';
import { AdaptiveFunctionCallCompiler } from './SingleCall/AdaptiveFunctionCallCompiler';
import type { ISharedFunctionCollection } from '../../ISharedFunctionCollection';
import type { FunctionCallCompiler } from './FunctionCallCompiler';
import type { CompiledCode } from './CompiledCode';
import type { FunctionCallCompilationContext } from './FunctionCallCompilationContext';
import type { SingleCallCompiler } from './SingleCall/SingleCallCompiler';
import type { CodeSegmentMerger } from './CodeSegmentJoin/CodeSegmentMerger';

export class FunctionCallSequenceCompiler implements FunctionCallCompiler {
  public static readonly instance: FunctionCallCompiler = new FunctionCallSequenceCompiler();

  /* The constructor is protected to enforce the singleton pattern. */
  protected constructor(
    private readonly singleCallCompiler: SingleCallCompiler = new AdaptiveFunctionCallCompiler(),
    private readonly codeSegmentMerger: CodeSegmentMerger = new NewlineCodeSegmentMerger(),
  ) { }

  public compileFunctionCalls(
    calls: readonly FunctionCall[],
    functions: ISharedFunctionCollection,
  ): CompiledCode {
    if (!calls.length) { throw new Error('missing calls'); }
    const context: FunctionCallCompilationContext = {
      allFunctions: functions,
      rootCallSequence: calls,
      singleCallCompiler: this.singleCallCompiler,
    };
    const codeSegments = context.rootCallSequence
      .flatMap((call) => this.singleCallCompiler.compileSingleCall(call, context));
    return this.codeSegmentMerger.mergeCodeParts(codeSegments);
  }
}
