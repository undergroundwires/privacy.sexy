import type { ErrorWithContextWrapper } from '@/application/Application/Loader/Collections/Compiler/Common/ContextualError';
import { ensureError } from '@/application/Common/CustomError';

export const errorWithContextWrapperStub
: ErrorWithContextWrapper = (error, message) => new Error(`[stubbed error wrapper] ${ensureError(error).message} + ${message}`);
