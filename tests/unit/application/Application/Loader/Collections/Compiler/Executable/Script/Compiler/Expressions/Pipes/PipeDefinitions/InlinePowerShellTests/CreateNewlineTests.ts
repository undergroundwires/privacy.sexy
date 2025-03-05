import { getInlinedOutputWithSemicolons, joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';
import type { PipeTestScenario } from '../PipeTestRunner';

export function createNewlineTests(): PipeTestScenario[] {
  return [
    {
      description: 'does not add semicolon to single line input',
      input: 'Write-Host "Single line input"',
      expectedOutput: 'Write-Host "Single line input"',
    },
    {
      description: 'does not add semicolon to last line of multiline input',
      input: joinAsWindowsLines(
        'Write-Host "First line"',
        'Write-Host "Second line"',
      ),
      expectedOutput: 'Write-Host "First line"; Write-Host "Second line"',
    },
    {
      description: 'preserves existing semicolons',
      input: joinAsWindowsLines(
        'line-without-semicolon',
        'line-with-semicolon;',
        'ending-line',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        'line-without-semicolon',
        'line-with-semicolon',
        'ending-line',
      ),
    },
    {
      description: 'inlines code with \\n newlines',
      input:
        '$things = Get-ChildItem C:\\Windows\\'
          + '\nforeach ($thing in $things) {'
          + '\nWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\n}',
      expectedOutput: getInlinedOutputWithSemicolons(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
    {
      description: 'removes empty lines',
      input:
        '$things = Get-ChildItem C:\\Windows\\'
          + '\n\nforeach ($thing in $things) {'
          + '\n\nWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\n\n\n}',
      expectedOutput: getInlinedOutputWithSemicolons(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
    {
      description: 'inlines code with \\r newlines',
      input:
        '$things = Get-ChildItem C:\\Windows\\'
          + '\rforeach ($thing in $things) {'
          + '\rWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\r}',
      expectedOutput: getInlinedOutputWithSemicolons(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
    {
      description: 'inlines code with mixed newline types',
      input:
        '$things = Get-ChildItem C:\\Windows\\'
          + '\r\nforeach ($thing in $things) {'
          + '\n\rWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\n\r}',
      expectedOutput: getInlinedOutputWithSemicolons(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
    {
      description: 'trims whitespace from lines',
      input:
        ' $things = Get-ChildItem C:\\Windows\\   '
          + '\nforeach ($thing in $things) {'
          + '\n\tWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\r       \n}',
      expectedOutput: getInlinedOutputWithSemicolons(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
  ];
}
