import type { CompiledCode } from '../CompiledCode';
import type { CodeSegmentMerger } from './CodeSegmentMerger';

export class NewlineCodeSegmentMerger implements CodeSegmentMerger {
  public mergeCodeParts(codeSegments: readonly CompiledCode[]): CompiledCode {
    if (!codeSegments.length) {
      throw new Error('missing segments');
    }
    return {
      code: joinCodeParts(codeSegments.map((f) => f.code)),
      revertCode: joinCodeParts(
        codeSegments
          .map((f) => f.revertCode)
          .filter((code): code is string => Boolean(code)),
      ),
    };
  }
}

function joinCodeParts(codeSegments: readonly string[]): string {
  return codeSegments
    .filter((segment) => segment.length > 0)
    .join('\n');
}
