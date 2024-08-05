import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createDoUntilTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_do?view=powershell-7.4
  return [
    {
      description: 'do-until loop without newlines',
      input: 'do { $i++; Write-Host $i } until ($i -ge 5)',
      expectedOutput: 'do { $i++; Write-Host $i } until ($i -ge 5)',
    },
    {
      description: 'simple do-until loop (single line inside do block)',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '} until ($i -lt 5)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -lt 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'multiline do-until loop',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    Write-Host $i',
        '} until ($i -ge 5)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $i')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -ge 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'nested do-until loops',
      input: joinAsWindowsLines(
        'do {',
        '    $outer = 0',
        '    do {',
        '        $inner = 0',
        '        do {',
        '            $inner++',
        '            Write-Host "Inner: $inner"',
        '        } until ($inner -ge 3)',
        '        $outer++',
        '        Write-Host "Outer: $outer"',
        '    } until ($outer -ge 2)',
        '    $mainCounter++',
        '    Write-Host "Main: $mainCounter"',
        '} until ($mainCounter -ge 2)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$outer = 0')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$inner = 0')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$inner++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Inner: $inner"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($inner -ge 3)')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$outer++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Outer: $outer"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($outer -ge 2)')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$mainCounter++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Main: $mainCounter"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($mainCounter -ge 2)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-until loop with condition on separate line',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    Write-Host $i',
        '}',
        'until ($i -ge 5)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $i')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}') // No semicolon after this to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -ge 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-until loop with complex condition',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    $j--',
        '} until ( `', // Marked: inline-conditions | Merging multiline conditions is not yet supported, so using backticks
        '    $i -ge 10 -or `',
        '    $j -le 0 `',
        ')',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$j--')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i -ge 10 -or')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$j -le 0')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString(')')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-until loop with nested if statement',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    if ($i % 2 -eq 0) {',
        '        Write-Host "Even: $i"',
        '    } else {',
        '        Write-Host "Odd: $i"',
        '    }',
        '} until ($i -ge 5)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('if ($i % 2 -eq 0)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Even: $i"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('else')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Odd: $i"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -ge 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-until loop with semicolon after closing brace',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    Write-Host $i',
        '};',
        'until ($i -ge 5)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $i')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -ge 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: '-until loop with pipeline in condition',
      input: joinAsWindowsLines(
        'do {',
        '    $result = Get-Something',
        '    Process-Result $result',
        '} until ($result | Test-Condition)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = Get-Something')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Process-Result $result')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result | Test-Condition')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString(')')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-until loop with multiline condition',
      input: joinAsWindowsLines(
        'do {',
        '    $result = Get-Something',
        '    Process-Result $result',
        '} until ( `', // Marked: inline-conditions | Merging multiline conditions is not yet supported, so using backticks
        '    $result -and (-Not $result) `',
        ')',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = Get-Something')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Process-Result $result')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result -and (-Not $result)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString(')')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-until loop with script block condition',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    Write-Host $i',
        '} until ( `', // Marked: inline-conditions | Merging multiline conditions is not yet supported, so using backticks
        '    & {',
        '        param($val)',
        '        $val -ge 5',
        '    } $i `',
        ')',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $i')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('until')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('&')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('param($val)')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$val -ge 5')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString(')')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-until after closing bracket',
      input: joinAsWindowsLines(
        'switch ($value) { default { Write-Host "Default" } }',
        'do { $i++ } until ($i -ge 5)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('switch ($value) { default { Write-Host "Default" } }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('do { $i++ } until ($i -ge 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
