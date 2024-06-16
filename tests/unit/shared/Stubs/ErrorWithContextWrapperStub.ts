import type { ErrorWithContextWrapper } from '@/application/Parser/ContextualError';

export const errorWithContextWrapperStub
: ErrorWithContextWrapper = (error, message) => new Error(`[stubbed error wrapper] ${error.message} + ${message}`);
