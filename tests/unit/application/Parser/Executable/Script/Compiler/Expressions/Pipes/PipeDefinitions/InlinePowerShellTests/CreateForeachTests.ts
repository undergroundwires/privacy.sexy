import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createForeachTests(): PipeTestScenario[] {
  return [
    // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_foreach?view=powershell-7.4
    {
      description: 'foreach loop without newlines',
      input: 'foreach ($item in $collection) { Write-Host $item }',
      expectedOutput: 'foreach ($item in $collection) { Write-Host $item }',
    },
    {
      description: 'simple foreach loop (single line inside code block)',
      input: joinAsWindowsLines(
        'foreach ($item in $collection) {',
        '    Write-Host $item',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('foreach')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($item in $collection)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $item')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'multiline foreach loop',
      input: joinAsWindowsLines(
        'foreach ($item in $collection) {',
        '    $processedItem = $item.ToUpper()',
        '    Write-Host "Processing: $processedItem"',
        '    $result += $processedItem',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('foreach')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($item in $collection)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$processedItem = $item.ToUpper()')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Processing: $processedItem"')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result += $processedItem')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'nested foreach loops',
      input: joinAsWindowsLines(
        'foreach ($outer in $outerCollection) {',
        '    Write-Host "Outer: $outer"',
        '    foreach ($inner in $innerCollection) {',
        '        Write-Host "  Inner: $inner"',
        '        $result = "$outer-$inner"',
        '        $combinedResults += $result',
        '    }',
        '    Write-Host "Completed inner loop for $outer"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('foreach')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($outer in $outerCollection)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Outer: $outer"')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('foreach')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($inner in $innerCollection)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "  Inner: $inner"')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = "$outer-$inner"')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$combinedResults += $result')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Completed inner loop for $outer"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'foreach loop with multiline condition',
      input: joinAsWindowsLines(
        'foreach ( `', // Marked: inline-conditions | Merging multiline conditions is not yet supported, so using backticks
        '    $item `',
        '    in `',
        '    $collection `',
        ') {',
        '    Write-Host $item',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('foreach')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('(')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$item')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('in')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$collection')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString(')')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $item')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'foreach loop with pipeline in collection',
      input: joinAsWindowsLines(
        'foreach ($item in Get-Process | Where-Object { $_.CPU -gt 50 }) {',
        '    Write-Host $item.Name',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('foreach')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($item in Get-Process |')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Where-Object { $_.CPU -gt 50 })')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $item.Name')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'foreach loop with complex collection expression',
      input: joinAsWindowsLines(
        'foreach ($item in ( `',
        '    $array1 + `', // Marked: inline-conditions | Merging multiline conditions is not yet supported, so using backticks
        '    $array2 | `',
        '    Where-Object { $_ -ne $null } `',
        ')) {',
        '    Write-Host $item',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('foreach')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($item in (')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$array1 +')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$array2 |')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Where-Object { $_ -ne $null }')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('))')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $item')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'foreach loop with script block in collection',
      input: joinAsWindowsLines(
        'foreach ($item in & {',
        '    param($start, $end)',
        '    $start..$end',
        '} 1 10) {',
        '    Write-Host $item',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('foreach')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($item in &')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('param($start, $end)')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$start..$end')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('1 10)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $item')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'foreach loop with closing brace on same line as last statement',
      input: joinAsWindowsLines(
        'foreach ($item in $collection) {',
        '    Write-Host $item',
        '    Process-Item $item }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('foreach')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($item in $collection)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host $item')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Process-Item $item')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'foreach after closing bracket',
      input: joinAsWindowsLines(
        'function Test-Function { Write-Host "Test" }',
        'foreach ($item in @(1,2,3)) { Write-Host $item }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('function Test-Function { Write-Host "Test" }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('foreach ($item in @(1,2,3)) { Write-Host $item }')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
