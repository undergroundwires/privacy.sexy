import { exec } from 'child_process';
import { LOG_LEVELS, log } from './log.js';
import { indentText } from './text.js';

const TIMEOUT_IN_SECONDS = 180;
const MAX_OUTPUT_BUFFER_SIZE = 1024 * 1024; // 1 MB

export function runCommand(commandString, options) {
  return new Promise((resolve) => {
    options = {
      cwd: process.cwd(),
      timeout: TIMEOUT_IN_SECONDS * 1000,
      maxBuffer: MAX_OUTPUT_BUFFER_SIZE * 2,
      ...options,
    };

    exec(commandString, options, (error, stdout, stderr) => {
      let errorText;
      if (error || stderr?.length > 0) {
        errorText = formatError(commandString, error, stdout, stderr);
      }
      resolve({
        stdout,
        error: errorText,
      });
    });
  });
}

function formatError(commandString, error, stdout, stderr) {
  const errorParts = [
    'Error while running command.',
    `Command:\n${indentText(commandString, 1)}`,
  ];
  if (error?.toString().trim()) {
    errorParts.push(`Error:\n${indentText(error.toString(), 1)}`);
  }
  if (stderr?.toString().trim()) {
    errorParts.push(`stderr:\n${indentText(stderr, 1)}`);
  }
  if (stdout?.toString().trim()) {
    errorParts.push(`stdout:\n${indentText(stdout, 1)}`);
  }
  return errorParts.join('\n---\n');
}
