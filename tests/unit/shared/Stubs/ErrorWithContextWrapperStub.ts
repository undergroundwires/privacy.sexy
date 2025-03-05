import type { ErrorWithContextWrapper } from '@/application/Application/Loader/Collections/Compiler/Common/ContextualError';

export const errorWithContextWrapperStub
: ErrorWithContextWrapper = (error, message) => new Error(`[stubbed error wrapper] ${error.message} + ${message}`);
