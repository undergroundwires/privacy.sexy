export interface ShellCommandRunner {
  runShellCommand(command: string): Promise<ShellCommandOutcome>;
}

export type ShellCommandOutcome = ProcessStatus & ({
  readonly type: 'RegularProcessExit',
  readonly exitCode: number;
} | {
  readonly type: 'ExternallyTerminated';
  readonly terminationSignal: NodeJS.Signals;
} | {
  readonly type: 'ExecutionError';
  readonly error: Error;
});

type ProcessOutcomeType = 'RegularProcessExit' | 'ExternallyTerminated' | 'ExecutionError';

interface ProcessStatus {
  readonly type: ProcessOutcomeType;
  readonly error?: Error;
  readonly terminationSignal?: NodeJS.Signals;
  readonly exitCode?: number;
}
