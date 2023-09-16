import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { ISharedFunctionCollection } from '../../ISharedFunctionCollection';
import { FunctionCallCompiler } from './FunctionCallCompiler';
import { CompiledCode } from './CompiledCode';
import { FunctionCallCompilationContext } from './FunctionCallCompilationContext';
import { SingleCallCompiler } from './SingleCall/SingleCallCompiler';
import { AdaptiveFunctionCallCompiler } from './SingleCall/AdaptiveFunctionCallCompiler';
import { CodeSegmentMerger } from './CodeSegmentJoin/CodeSegmentMerger';
import { NewlineCodeSegmentMerger } from './CodeSegmentJoin/NewlineCodeSegmentMerger';

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
    if (!functions) { throw new Error('missing functions'); }
    if (!calls?.length) { throw new Error('missing calls'); }
    if (calls.some((f) => !f)) { throw new Error('missing function call'); }
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
