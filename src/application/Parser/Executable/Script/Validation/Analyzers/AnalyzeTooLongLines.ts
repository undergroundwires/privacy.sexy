import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { CodeValidationAnalyzer, InvalidCodeLine } from './CodeValidationAnalyzer';

export const analyzeTooLongLines: CodeValidationAnalyzer = (
  lines,
  language,
) => {
  const maxLineLength = getMaxAllowedLineLength(language);
  return lines
    .filter((line) => line.text.length > maxLineLength)
    .map((line): InvalidCodeLine => ({
      lineNumber: line.lineNumber,
      error: [
        `Line is too long (${line.text.length}).`,
        `It exceed maximum allowed length ${maxLineLength} by ${line.text.length - maxLineLength} characters.`,
        'This may cause bugs due to unintended trimming by operating system, shells or terminal emulators.',
      ].join(' '),
    }));
};

function getMaxAllowedLineLength(language: ScriptingLanguage): number {
  switch (language) {
    case ScriptingLanguage.batchfile:
      /*
        The maximum length of the string that you can use at the command prompt is 8191 characters.
        https://web.archive.org/web/20240815120224/https://learn.microsoft.com/en-us/troubleshoot/windows-client/shell-experience/command-line-string-limitation
      */
      return 8191;
    case ScriptingLanguage.shellscript:
      /*
        Tests show:

        | OS  | Command | Value |
        | --- | ------- | ----- |
        | Pop!_OS 22.04                         | xargs --show-limits     | 2088784 |
        | macOS Sonoma 14.3 on Intel            | getconf ARG_MAX         | 1048576 |
        | macOS Sonoma 14.3 on Apple Silicon M1 | getconf ARG_MAX         | 1048576 |
        | Android 12 (4.14.180) with Termux     | xargs --show-limits     | 2087244 |
      */
      return 1048576; // Minimum value for reliability
    default:
      throw new Error(`Unsupported language: ${ScriptingLanguage[language]} (${language})`);
  }
}
