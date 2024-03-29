import type { CompiledCode } from '../CompiledCode';

export interface CodeSegmentMerger {
  mergeCodeParts(codeSegments: readonly CompiledCode[]): CompiledCode;
}
