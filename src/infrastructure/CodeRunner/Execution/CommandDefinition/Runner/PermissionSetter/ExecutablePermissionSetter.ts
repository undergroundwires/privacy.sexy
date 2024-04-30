import type { ScriptFileExecutionOutcome } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';

export interface ExecutablePermissionSetter {
  makeFileExecutable(filePath: string): Promise<ScriptFileExecutionOutcome>;
}
