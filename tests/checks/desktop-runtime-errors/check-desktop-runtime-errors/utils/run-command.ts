import { exec } from 'child_process';
import { indentText } from '@/application/Common/Text/IndentText';
import type { ExecOptions, ExecException } from 'child_process';

const TIMEOUT_IN_SECONDS = 180;
const MAX_OUTPUT_BUFFER_SIZE = 1024 * 1024; // 1 MB

export function runCommand(
  command: string,
  options?: ExecOptions,
): Promise<CommandResult> {
  return new Promise((resolve) => {
    options = {
      cwd: process.cwd(),
      timeout: TIMEOUT_IN_SECONDS * 1000,
      maxBuffer: MAX_OUTPUT_BUFFER_SIZE * 2,
      ...(options ?? {}),
    };

    exec(command, options, (error, stdout, stderr) => {
      let errorText: string | undefined;
      if (error || stderr?.length > 0) {
        errorText = formatError(command, error, stdout, stderr);
      }
      resolve({
        stdout,
        error: errorText,
      });
    });
  });
}

export interface CommandResult {
  readonly stdout: string;
  readonly error?: string;
}

function formatError(
  command: string,
  error: ExecException | null,
  stdout: string | undefined,
  stderr: string | undefined,
) {
  const errorParts = [
    'Error while running command.',
    `Command:\n${indentText(command, 1)}`,
  ];
  if (error?.toString().trim()) {
    errorParts.push(`Error:\n${indentText(error.toString(), 1)}`);
  }
  if (stderr?.trim()) {
    errorParts.push(`stderr:\n${indentText(stderr, 1)}`);
  }
  if (stdout?.trim()) {
    errorParts.push(`stdout:\n${indentText(stdout, 1)}`);
  }
  return errorParts.join('\n---\n');
}
