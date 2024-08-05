import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createFunctionTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions?view=powershell-7.4
  // Known limitations:
  //  - Functions with advanced parameters are not yet supported.
  return [
    {
      description: 'function without newlines',
      input: 'function Get-Name { param($FirstName, $LastName) Write-Output "$FirstName $LastName" }',
      expectedOutput: 'function Get-Name { param($FirstName, $LastName) Write-Output "$FirstName $LastName" }',
    },
    {
      description: 'simple function (single line inside code block)',
      input: joinAsWindowsLines(
        'function Say-Hello {',
        '    Write-Host "Hello, World!"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('function')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Say-Hello')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Hello, World!"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'function with multiple statements',
      input: joinAsWindowsLines(
        'function Do-Something {',
        '    $result = Get-Something',
        '    Process-Result $result',
        '    Write-Output "Done processing"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('function')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Do-Something')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = Get-Something')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Process-Result $result')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Output "Done processing"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'function with begin, process, and end blocks',
      input: joinAsWindowsLines(
        'function Process-Collection {',
        '    begin {',
        '        $total = 0',
        '    }',
        '    process {',
        '        $total += $_',
        '    }',
        '    end {',
        '        Write-Output "Total: $total"',
        '    }',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('function')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Process-Collection')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('begin')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$total = 0')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('process')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$total += $_')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('end')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Output "Total: $total"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'nested functions',
      input: joinAsWindowsLines(
        'function Outer-Function {',
        '    param($outerParam)',
        '    function Inner-Function {',
        '        param($innerParam)',
        '        Write-Output "Inner: $innerParam"',
        '    }',
        '    Write-Output "Outer: $outerParam"',
        '    Inner-Function -innerParam "Hello from inner"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('function')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Outer-Function')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('param($outerParam)')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('function')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Inner-Function')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('param($innerParam)')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Output "Inner: $innerParam"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Output "Outer: $outerParam"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Inner-Function -innerParam "Hello from inner"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'function without space before opening brace',
      input: joinAsWindowsLines(
        'function Get-Something{',
        '    return "Something"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('function')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Get-Something')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('return "Something"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'function with single-line param block',
      input: joinAsWindowsLines(
        'function Set-Value {',
        '    param([string]$key, [object]$value)',
        '    $hash[$key] = $value',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('function')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Set-Value')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('param([string]$key, [object]$value)')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$hash[$key] = $value')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'function after closing bracket',
      input: joinAsWindowsLines(
        'if ($condition) { $value = 10 }',
        'function Test-Function { param($param) Write-Host $param }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if ($condition) { $value = 10 }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('function Test-Function { param($param) Write-Host $param }')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
