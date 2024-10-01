import { getInlinedOutputWithSemicolons, joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';
import type { PipeTestScenario } from '../PipeTestRunner';

export function createLineContinuationBacktickCases(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-7.4#line-continuation
  return [
    {
      description: 'inlines newlines with trailing backtick',
      input: joinAsWindowsLines(
        'Get-Service * `',
        '| Format-Table -AutoSize',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        'Get-Service * | Format-Table -AutoSize',
      ),
    },
    {
      description: 'inlines newlines with trailing backtick and different line endings',
      input: 'Get-Service `\n'
        + '* `\r'
        + '| Sort-Object StartType `\r\n'
        + '| Format-Table -AutoSize',
      expectedOutput: getInlinedOutputWithSemicolons(
        'Get-Service * | Sort-Object StartType | Format-Table -AutoSize',
      ),
    },
    {
      description: 'trims whitespace when inlining with trailing backtick',
      input: joinAsWindowsLines(
        'Get-Service * `',
        '\t| Sort-Object StartType `',
        '  | Format-Table -AutoSize',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        'Get-Service * | Sort-Object StartType | Format-Table -AutoSize',
      ),
    },
    {
      description: 'preserves line without whitespace before backtick',
      input: joinAsWindowsLines(
        'Get-Service *`',
        '| Format-Table -AutoSize',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        'Get-Service *`',
        '| Format-Table -AutoSize',
      ),
    },
    {
      description: 'preserves line with characters after backtick',
      input: joinAsWindowsLines(
        'line start ` after',
        'should not be wrapped',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        'line start ` after',
        'should not be wrapped',
      ),
    },
  ];
}
