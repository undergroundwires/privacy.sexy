import type { ExecutableErrorContext } from '@/application/Parser/Executable/Validation/ExecutableErrorContext';
import { ExecutableType } from '@/application/Parser/Executable/Validation/ExecutableType';
import { CategoryDataStub } from './CategoryDataStub';

export function createExecutableErrorContextStub(): ExecutableErrorContext {
  return {
    type: ExecutableType.Category,
    self: new CategoryDataStub(),
    parentCategory: new CategoryDataStub(),
  };
}
