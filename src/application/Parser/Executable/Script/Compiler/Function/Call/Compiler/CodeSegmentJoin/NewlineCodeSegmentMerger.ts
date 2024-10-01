import { filterEmptyStrings } from '@/application/Common/Text/FilterEmptyStrings';
import type { CompiledCode } from '../CompiledCode';
import type { CodeSegmentMerger } from './CodeSegmentMerger';

export class NewlineCodeSegmentMerger implements CodeSegmentMerger {
  public mergeCodeParts(codeSegments: readonly CompiledCode[]): CompiledCode {
    if (!codeSegments.length) {
      throw new Error('missing segments');
    }
    return {
      code: joinCodeParts(codeSegments.map((f) => f.code)),
      revertCode: joinCodeParts(filterEmptyStrings(
        codeSegments.map((f) => f.revertCode),
      )),
    };
  }
}

function joinCodeParts(codeSegments: readonly string[]): string {
  return codeSegments
    .filter((segment) => segment.length > 0)
    .join('\n');
}
