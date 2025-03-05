import { getInlinedOutputWithSemicolons, joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';
import type { PipeTestScenario } from '../PipeTestRunner';

export function createHereStringTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.4#here-strings
  return [
    {
      description: 'double-quoted here-string',
      input: joinAsWindowsLines(
        '@"',
        'Lorem',
        'ipsum',
        'dolor sit amet',
        '"@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        joinLinesForDoubleQuotedString(
          '"Lorem',
          'ipsum',
          'dolor sit amet"',
        ),
      ),
    },
    {
      description: 'single-quoted here-string',
      input: joinAsWindowsLines(
        '@\'',
        'Lorem',
        'ipsum',
        'dolor sit amet',
        '\'@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        joinLinesForSingleQuotedString(
          'Lorem',
          'ipsum',
          'dolor sit amet',
        ),
      ),
    },
    {
      description: 'preserves invalid here-string syntax',
      input: joinAsWindowsLines(
        '@" invalid syntax',
        'I will not be processed as here-string',
        '"@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '@" invalid syntax',
        'I will not be processed as here-string',
        '"@',
      ),
    },
    {
      description: 'preserves here-string with character before terminator',
      input: joinAsWindowsLines(
        '@\'',
        'do not match here',
        ' \'@',
        'character \'@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '@\'',
        'do not match here',
        ' \'@',
        'character \'@',
      ),
    },
    {
      description: 'preserves here-string with mismatched delimiters',
      input: joinAsWindowsLines(
        '@\'',
        'lorem',
        '"@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '@\'',
        'lorem',
        '"@',
      ),
    },
    {
      description: 'single quoted here-string with nested single quoted here-string',
      input: joinAsWindowsLines(
        '$hasInnerDoubleQuotedTerminator = @"',
        'inner text',
        '@\'',
        'inner terminator text',
        '\'@',
        '"@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        joinLinesForDoubleQuotedString(
          '$hasInnerDoubleQuotedTerminator = "inner text',
          '@\'',
          'inner terminator text',
          '\'@"',
        ),
      ),
    },
    {
      description: 'single quoted here-string with inner double-quoted string',
      input: joinAsWindowsLines(
        '$hasInnerSingleQuotedTerminator = @\'',
        'inner text',
        '@"',
        'inner terminator text',
        '"@',
        '\'@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        joinLinesForSingleQuotedString(
          '$hasInnerSingleQuotedTerminator = \'inner text',
          '@"',
          'inner terminator text',
          '"@\'',
        ),
      ),
    },
    {
      description: 'here-string with character after terminator',
      input: joinAsWindowsLines(
        '@\'',
        'lorem',
        '\'@ after',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '\'lorem\' after',
      ),
    },
    {
      description: 'escapes double quotes in double-quoted here-string',
      input: joinAsWindowsLines(
        '@"',
        'For help, type "get-help"',
        '"@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '"For help, type `"get-help`""',
      ),
    },
    {
      description: 'escapes single quotes in single-quoted here-string',
      input: joinAsWindowsLines(
        '@\'',
        'For help, type \'get-help\'',
        '\'@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '\'For help, type \'\'get-help\'\'\'',
      ),
    },
    {
      description: 'here-string not at line start',
      input: joinAsWindowsLines(
        '$page = [XML] @"',
        'multi-lined',
        'and "quoted"',
        '"@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        joinLinesForDoubleQuotedString(
          '$page = [XML] "multi-lined',
          'and `"quoted`""',
        ),
      ),
    },
    {
      description: 'trims whitespace after here-string header',
      input: joinAsWindowsLines(
        '@"    \t',
        'text with whitespaces at here-string start',
        '"@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '"text with whitespaces at here-string start"',
      ),
    },
    {
      description: 'preserves whitespace in here-string lines',
      input: joinAsWindowsLines(
        '@\'',
        '\ttext with tabs around\t\t',
        '  text with whitespace around ',
        '\'@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        joinLinesForSingleQuotedString(
          '\'\ttext with tabs around\t\t',
          '  text with whitespace around \'',
        ),
      ),
    },
    {
      description: 'preserves code inside here-string',
      input: joinAsWindowsLines( // Triggering a some code inlining logic:
        '@"',
        'if (',
        '    $condition1 -and',
        '    $condition2',
        ') {',
        '    Write-Host "True"',
        '    Write-Warning "Not false"',
        '} else',
        '{',
        '  Get-Process `',
        '  | Where-Object { $_.CPU -gt 50 }',
        '}',
        '"@',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        joinLinesForDoubleQuotedString( // Identical to input
          '"if (',
          '    $condition1 -and',
          '    $condition2',
          ') {',
          '    Write-Host `"True`"',
          '    Write-Warning `"Not false`"',
          '} else',
          '{',
          '  Get-Process `',
          '  | Where-Object { $_.CPU -gt 50 }',
          '}"',
        ),
      ),
    },
  ];
}

function joinLinesForDoubleQuotedString(
  ...lines: readonly string[]
): string {
  return lines.join('`r`n');
}

function joinLinesForSingleQuotedString(
  ...lines: readonly string[]
): string {
  return lines.join('\'+"`r`n"+\'');
}
