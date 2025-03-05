import type { ExecutableErrorContext } from '@/application/Application/Loader/Collections/Compiler/Executable/Validation/ExecutableErrorContext';
import { ExecutableType } from '@/application/Application/Loader/Collections/Compiler/Executable/Validation/ExecutableType';
import { CategoryDataStub } from './CategoryDataStub';

export function createExecutableErrorContextStub(): ExecutableErrorContext {
  return {
    type: ExecutableType.Category,
    self: new CategoryDataStub(),
    parentCategory: new CategoryDataStub(),
  };
}
