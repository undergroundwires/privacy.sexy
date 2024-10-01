import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createForLoopTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_for?view=powershell-7.4
  // Known limitations:
  //  - Multiline for loop with sections without semicolon, e.g. `for(\n$i =0\n$i - l5\n$i++\n)`
  return [
    {
      description: 'for loop without newlines',
      input: 'for ($i = 0; $i -lt 5; $i++) { Write-Host $i }',
      expectedOutput: 'for ($i = 0; $i -lt 5; $i++) { Write-Host $i }',
    },
    {
      description: 'simple for loop (single line inside code block)',
      input: joinAsWindowsLines(
        'for ($i = 0; $i -lt 5; $i++) {',
        '    Write-Host $i',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('for')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i = 0; $i -lt 5; $i++)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $i')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'multiline for loop',
      input: joinAsWindowsLines(
        'for ($i = 0; $i -lt 5; $i++) {',
        '    Write-Host "Current value: $i"',
        '    $result += $i',
        '    Do-SomethingWith $i',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('for')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i = 0; $i -lt 5; $i++)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Current value: $i"')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result += $i')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Do-SomethingWith $i')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'nested for loops',
      input: joinAsWindowsLines(
        'for ($i = 0; $i -lt 3; $i++) {',
        '    for ($j = 0; $j -lt 2; $j++) {',
        '        Write-Host "i: $i, j: $j"',
        '    }',
        '    Write-Host "Outer loop: $i"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('for')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i = 0; $i -lt 3; $i++)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('for')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($j = 0; $j -lt 2; $j++)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "i: $i, j: $j"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Outer loop: $i"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'for loop without spaces in header',
      input: joinAsWindowsLines(
        'for($i=0;$i-lt5;$i++){',
        '    Write-Host $i',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('for')
        .withLiteralString('($i=0;$i-lt5;$i++)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $i')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'for loop with empty sections',
      input: joinAsWindowsLines(
        'for (;;) {',
        '    $i++',
        '    if ($i -ge 5) { break }',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('for')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(;;)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('if ($i -ge 5) { break }')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'for loop with multiple statements in each section',
      input: joinAsWindowsLines(
        'for ($i = 0, $j = 10; $i -lt 5 -and $j -gt 0; $i++, $j--) {',
        '    Write-Host "i: $i, j: $j"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('for')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i = 0, $j = 10; $i -lt 5 -and $j -gt 0; $i++, $j--)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "i: $i, j: $j"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'for loop with multiline sections',
      input: joinAsWindowsLines(
        'for ( `', // Marked: inline-conditions | Merging multiline conditions is not yet supported, so using backticks
        ' $i = 0; `',
        ' $i -lt 5; `',
        ' $i++ `',
        ') {',
        '    Write-Host $i',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('for')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i = 0;')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i -lt 5;')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString(')')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $i')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'for after closing bracket',
      input: joinAsWindowsLines(
        '$scriptBlock = { Write-Host "Inside script block" }',
        'for ($i = 0; $i -lt 5; $i++) { Write-Host $i }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('$scriptBlock = { Write-Host "Inside script block" }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('for ($i = 0; $i -lt 5; $i++) { Write-Host $i }')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
