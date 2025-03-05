import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createWhileTests(): PipeTestScenario[] {
  return [
    {
      description: 'while loop without newlines',
      input: 'while ($val -ne 3) { $val++ Write-Host $val }',
      expectedOutput: 'while ($val -ne 3) { $val++ Write-Host $val }',
    },
    {
      description: 'simple while loop (single line inside code block)',
      input: joinAsWindowsLines(
        'while ($i -lt 5) {',
        '    $i++',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($i -lt 5)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$i++')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'multiline while loop',
      input: joinAsWindowsLines(
        'while ($condition) {',
        '    Do-Something',
        '    Write-Host "Processing..."',
        '    $condition = Test-Condition',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($condition)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Do-Something')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Processing..."')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$condition = Test-Condition')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'nested while loops',
      input: joinAsWindowsLines(
        'while ($outerCondition) {',
        '    $innerCounter = 0',
        '    while ($innerCounter -lt 3) {',
        '        Do-InnerTask',
        '        $innerCounter++',
        '    }',
        '    Do-OuterTask',
        '    $outerCondition = Test-OuterCondition',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($outerCondition)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$innerCounter = 0')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($innerCounter -lt 3)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Do-InnerTask')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$innerCounter++')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Do-OuterTask')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$outerCondition = Test-OuterCondition')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'while loop without space before opening parenthesis',
      input: joinAsWindowsLines(
        'while($val -ne 3) {',
        '    $val++',
        '    Write-Host $val',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('while')
        .withLiteralString('($val -ne 3)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$val++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $val')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'while loop without space after closing parenthesis',
      input: joinAsWindowsLines(
        'while ($val -ne 3){',
        '    $val++',
        '    Write-Host $val',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($val -ne 3)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$val++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $val')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'while loop and trims extra spaces before statements',
      input: joinAsWindowsLines(
        'while ($val -ne 3) {',
        '     $val++',
        '        Write-Host $val',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($val -ne 3)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$val++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $val')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'while loop with closing brace on same line as last statement',
      input: joinAsWindowsLines(
        'while ($val -ne 3) {',
        '    $val++',
        '    Write-Host $val }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('while')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($val -ne 3)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$val++')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $val')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'while after closing bracket',
      input: joinAsWindowsLines(
        'try { throw "Error" } catch { Write-Host "Caught error" }',
        'while ($true) { break }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try { throw "Error" } catch { Write-Host "Caught error" }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('while ($true) { break }')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
