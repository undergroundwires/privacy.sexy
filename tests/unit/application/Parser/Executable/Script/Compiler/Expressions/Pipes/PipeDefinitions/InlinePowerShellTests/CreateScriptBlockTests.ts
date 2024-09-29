import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createScriptBlockTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_script_blocks%3Fview=powershell-7.4
  return [
    {
      description: 'simple script block without newlines',
      input: '{ Write-Host "Hello, World!" }',
      expectedOutput: '{ Write-Host "Hello, World!" }',
    },
    {
      description: 'multiline script block',
      input: joinAsWindowsLines(
        '{',
        '    $result = 10 * 5',
        '    Write-Host "The result is: $result"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 * 5')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "The result is: $result"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'script block with parameters',
      input: joinAsWindowsLines(
        '{',
        '    param($p1, $p2)',
        '    Write-Host "p1: $p1, p2: $p2"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('param($p1, $p2)')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "p1: $p1, p2: $p2"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'script block with typed parameters',
      input: joinAsWindowsLines(
        '{',
        '    param([int]$p1, [string]$p2)',
        '    Write-Host "p1: $p1, p2: $p2"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('param([int]$p1, [string]$p2)')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "p1: $p1, p2: $p2"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'script block with begin, process, and end blocks',
      input: joinAsWindowsLines(
        '{',
        '    begin { $total = 0 }',
        '    process { $total += $_ }',
        '    end { Write-Host "Total: $total" }',
        '}',
      ),
      expectedOutput: new RegexBuilder()
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
        .withLiteralString('Write-Host "Total: $total"')
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
      description: 'nested script blocks',
      input: joinAsWindowsLines(
        '{',
        '    $innerBlock = {',
        '        param($x)',
        '        Write-Host "Inner: $x"',
        '    }',
        '    & $innerBlock -x "Hello"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$innerBlock =')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('param($x)')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Inner: $x"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('& $innerBlock -x "Hello"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'script block with return statement',
      input: joinAsWindowsLines(
        '{',
        '    $result = 10 * 5',
        '    return $result',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 * 5')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('return $result')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'script block with pipeline input',
      input: joinAsWindowsLines(
        '{',
        '    process {',
        '        $_ | Where-Object { $_ % 2 -eq 0 }',
        '    }',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('process')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$_ | Where-Object { $_ % 2 -eq 0 }')
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
      description: 'script block with dynamicparam block',
      input: joinAsWindowsLines(
        '{',
        '    dynamicparam {',
        '        $paramDictionary = New-Object System.Management.Automation.RuntimeDefinedParameterDictionary',
        '        return $paramDictionary',
        '    }',
        '    process {',
        '        Write-Host "Processing"',
        '    }',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('dynamicparam')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$paramDictionary = New-Object System.Management.Automation.RuntimeDefinedParameterDictionary')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('return $paramDictionary')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('process')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Processing"')
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
      description: 'script block after closing bracket',
      input: joinAsWindowsLines(
        'if ($condition) { $value = 10 }',
        '$scriptBlock = { param($x) Write-Host $x }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if ($condition) { $value = 10 }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$scriptBlock = { param($x) Write-Host $x }')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
