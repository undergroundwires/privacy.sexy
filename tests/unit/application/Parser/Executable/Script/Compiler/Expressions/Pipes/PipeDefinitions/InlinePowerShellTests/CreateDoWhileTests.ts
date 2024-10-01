import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createDoWhileTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_do?view=powershell-7.4
  return [
    {
      description: 'do-while loop without newlines',
      input: 'do { $i++ } while ($i -lt 5)',
      expectedOutput: 'do { $i++ } while ($i -lt 5)',
    },
    {
      description: 'simple do-while loop (single line inside do block)',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '} while ($i -lt 5)',
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
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -lt 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'multiline do-while loop',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    Write-Host $i',
        '} while ($i -lt 5)',
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
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -lt 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'nested do-while loops',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    do {',
        '        $j++',
        '    } while ($j -lt 3)',
        '    Write-Host "$i, $j"',
        '} while ($i -lt 5)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$j++')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($j -lt 3)')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "$i, $j"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -lt 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-while loop with condition on separate line',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '}',
        'while ($i -lt 5)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}') // No semicolon after this to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -lt 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-while loop with multiline condition',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    $j--',
        '} while ( `', // Marked: inline-conditions | Merging multiline conditions is not yet supported, so using backticks
        '    $i -lt 10 -and `',
        '    $j -gt 0 `',
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
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i -lt 10 -and')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$j -gt 0')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString(')')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-while loop with nested if statement',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '    if ($i % 2 -eq 0) {',
        '        Write-Host "Even"',
        '    } else {',
        '        Write-Host "Odd"',
        '    }',
        '} while ($i -lt 5)',
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
        .withLiteralString('Write-Host "Even"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('else')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Odd"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -lt 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-while loop with semicolon after closing brace',
      input: joinAsWindowsLines(
        'do {',
        '    $i++',
        '};',
        'while ($i -lt 5)',
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
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -lt 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'do-while loop with pipeline in condition',
      input: joinAsWindowsLines(
        'do {',
        '    $result = Get-Something',
        '} while ( $result | Test-Condition )',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('do')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = Get-Something')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('while')
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
      description: 'do-while after closing bracket',
      input: joinAsWindowsLines(
        'if ($someCondition) { $variable = "Some value" }',
        'do { $i++; Write-Host $i } while ($i -lt 5)',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if ($someCondition) { $variable = "Some value" }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('do { $i++; Write-Host $i } while ($i -lt 5)')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
