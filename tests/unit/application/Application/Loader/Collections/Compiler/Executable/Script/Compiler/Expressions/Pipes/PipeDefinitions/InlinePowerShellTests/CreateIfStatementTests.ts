import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createIfStatementTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_if?view=powershell-7.4
  return [
    {
      description: 'if/else statement without newlines',
      input: 'if ($condition) { Write-Host "True" } else { Write-Host "False" }',
      expectedOutput: 'if ($condition) { Write-Host "True" } else { Write-Host "False" }',
    },
    {
      description: 'simple if statement (single line inside code block)',
      input: joinAsWindowsLines(
        'if ($true) {',
        '    Write-Host "True"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($true)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "True"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'if/else statement',
      input: joinAsWindowsLines(
        'if ($condition) {',
        '    Write-Host "True"',
        '} else {',
        '    Write-Host "False"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($condition)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "True"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('else')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "False"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'if/elseif/else statement',
      input: joinAsWindowsLines(
        'if ($condition1) {',
        '    Write-Host "Condition 1"',
        '} elseif ($condition2) {',
        '    Write-Host "Condition 2"',
        '} else {',
        '    Write-Host "None"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($condition1)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Condition 1"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('elseif')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($condition2)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Condition 2"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('else')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "None"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'if statement with multiple lines',
      input: joinAsWindowsLines(
        'if ($condition) {',
        '    $result = 10 * 5',
        '    Write-Host "Calculation done"',
        '    $finalResult = $result + 20',
        '    Write-Host "Final result: $finalResult"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($condition)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 * 5')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Calculation done"')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$finalResult = $result + 20')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Final result: $finalResult"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'nested if statements',
      input: joinAsWindowsLines(
        'if ($outerCondition) {',
        '    $outerResult = 10',
        '    if ($innerCondition1) {',
        '        Write-Host "Inner condition 1 met"',
        '    } elseif ($innerCondition2) {',
        '        Write-Host "Inner condition 2 met"',
        '    } else {',
        '        Write-Host "No inner conditions met"',
        '    }',
        '    Write-Host "Outer condition processing complete"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($outerCondition)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$outerResult = 10')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($innerCondition1)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Inner condition 1 met"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('elseif')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($innerCondition2)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Inner condition 2 met"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('else')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "No inner conditions met"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Outer condition processing complete"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'if/elseif/else with closing brackets on separate lines',
      input: joinAsWindowsLines(
        'if ($condition1) {',
        '    Write-Host "Condition 1"',
        '}',
        'elseif ($condition2) {',
        '    Write-Host "Condition 2"',
        '}',
        'else {',
        '    Write-Host "No condition met"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($condition1)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Condition 1"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}') // No semicolon after this to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('elseif')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($condition2)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Condition 2"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}') // No semicolon after this to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('else')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "No condition met"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'if statement without space before opening parenthesis',
      input: joinAsWindowsLines(
        'if($condition) {',
        '    Write-Host "True"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if($condition)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "True"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'if statement without space after closing parenthesis',
      input: joinAsWindowsLines(
        'if ($condition){',
        '    Write-Host "True"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if ($condition)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "True"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'if statement with extra spaces in condition',
      input: joinAsWindowsLines(
        'if (  $condition  ) {',
        '    Write-Host "True"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$condition')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString(')')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "True"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'if statement with multiline condition',
      input: joinAsWindowsLines(
        'if ( `', // Marked: inline-conditions | Merging multiline conditions is not yet supported, so using backticks
        '    $condition1 -and `',
        '    $condition2 `',
        ') {',
        '    Write-Host "True"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$condition1 -and')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$condition2')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString(')')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "True"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'if/elseif/else with mixed brace styles',
      input: joinAsWindowsLines(
        'if ($condition1) {',
        '    Write-Host "Condition 1"',
        '} elseif ($condition2)',
        '{',
        '    Write-Host "Condition 2"',
        '} else {',
        '    Write-Host "None"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($condition1)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Condition 1"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('elseif')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($condition2)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Condition 2"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('else')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "None"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'if statement with pipeline in condition',
      input: joinAsWindowsLines(
        'if (Get-Process | Where-Object { $_.CPU -gt 50 }) {',
        '    Write-Host "High CPU usage detected"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(Get-Process |')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Where-Object { $_.CPU -gt 50 })')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "High CPU usage detected"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'if statement after closing bracket',
      input: joinAsWindowsLines(
        '$testArray = @(1, 2, 3, 4, 5)',
        '$result = $testArray | ForEach-Object { $_ * 2 }',
        'if ($result.Count -gt 0) { Write-Host "Array has items" }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('$testArray = @(1, 2, 3, 4, 5)')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = $testArray | ForEach-Object { $_ * 2 }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('if ($result.Count -gt 0) { Write-Host "Array has items" }')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
