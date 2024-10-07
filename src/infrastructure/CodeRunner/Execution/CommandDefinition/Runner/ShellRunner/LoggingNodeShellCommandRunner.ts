import type { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import type { SystemOperations } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { NodeElectronSystemOperations } from '@/infrastructure/CodeRunner/System/NodeElectronSystemOperations';
import type { ShellCommandOutcome, ShellCommandRunner } from './ShellCommandRunner';

export class LoggingNodeShellCommandRunner implements ShellCommandRunner {
  constructor(
    private readonly logger: Logger = ElectronLogger,
    private readonly systemOps: SystemOperations = NodeElectronSystemOperations,
  ) {
  }

  public runShellCommand(command: string): Promise<ShellCommandOutcome> {
    this.logger.info(`Executing command: ${command}`);
    return new Promise((resolve) => {
      this.systemOps.command.exec(command)
        // https://archive.today/2024.01.19-004011/https://nodejs.org/api/child_process.html#child_process_event_exit
        .on('exit', (
          code, // The exit code if the child exited on its own.
          signal, // The signal by which the child process was terminated.
        ) => {
          // One of `code` or `signal` will always be non-null.
          // If the process exited, code is the final exit code of the process, otherwise null.
          if (code !== null) {
            this.logger.info(`Command completed with exit code ${code}.`);
            resolve({ type: 'RegularProcessExit', exitCode: code });
            return; // Prevent further execution to avoid multiple promise resolutions and logs.
          }
          // If the process terminated due to receipt of a signal, signal is the string name of
          // the signal, otherwise null.
          resolve({ type: 'ExternallyTerminated', terminationSignal: signal as NodeJS.Signals });
          this.logger.warn(`Command terminated by signal: ${signal}`);
        })
        .on('error', (error) => {
          // https://archive.ph/20200912193803/https://nodejs.org/api/child_process.html#child_process_event_error
          // The 'error' event is emitted whenever:
          // - The process could not be spawned, or
          // - The process could not be killed, or
          // - Sending a message to the child process failed.
          // The 'exit' event may or may not fire after an error has occurred.
          this.logger.error('Command execution failed:', error);
          resolve({ type: 'ExecutionError', error });
        });
    });
  }
}
