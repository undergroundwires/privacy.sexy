import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createSwitchTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_switch?view=powershell-7.4
  return [
    {
      description: 'switch statement with no newlines',
      input: 'switch ($value) { 1 { Write-Host "One" }; 2 { Write-Host "Two" }; default { Write-Host "Other" } }',
      expectedOutput: 'switch ($value) { 1 { Write-Host "One" }; 2 { Write-Host "Two" }; default { Write-Host "Other" } }',
    },
    {
      description: 'simple switch statement (single line inside code block)',
      input: joinAsWindowsLines(
        'switch ($value) {',
        '    1 { Write-Host "One" }',
        '    2 { Write-Host "Two" }',
        '    default { Write-Host "Other" }',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('switch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($value)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('1')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "One"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('2')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Two"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('default')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Other"')
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
      description: 'multiline switch statement',
      input: joinAsWindowsLines(
        'switch ($value) {',
        '    1 {',
        '        Write-Host "One"',
        '        $result = 1',
        '    }',
        '    2 {',
        '        Write-Host "Two"',
        '        $result = 2',
        '    }',
        '    default {',
        '        Write-Host "Other"',
        '        $result = 0',
        '    }',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('switch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($value)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('1')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "One"')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 1')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('2')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Two"')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 2')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('default')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Other"')
        .withSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 0')
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
      description: 'nested switch statements',
      input: joinAsWindowsLines(
        'switch ($outer) {',
        '    1 {',
        '        switch ($inner) {',
        '            "A" { Write-Host "1A" }',
        '            "B" { Write-Host "1B" }',
        '        }',
        '    }',
        '    2 {',
        '        switch ($inner) {',
        '            "A" { Write-Host "2A" }',
        '            "B" { Write-Host "2B" }',
        '        }',
        '    }',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('switch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($outer)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('1')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('switch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($inner)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('"A"')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "1A"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('"B"')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "1B"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('2')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('switch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($inner)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('"A"')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "2A"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('"B"')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "2B"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
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
      description: 'switch statement with no spaces',
      input: joinAsWindowsLines(
        'switch($value){1{Write-Host"One"}2{Write-Host"Two"}default{Write-Host"Other"}}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('switch')
        .withLiteralString('($value)')
        .withLiteralString('{')
        .withLiteralString('1')
        .withLiteralString('{')
        .withLiteralString('Write-Host"One"')
        .withOptionalSemicolon()
        .withLiteralString('}')
        .withLiteralString('2')
        .withLiteralString('{')
        .withLiteralString('Write-Host"Two"')
        .withOptionalSemicolon()
        .withLiteralString('}')
        .withLiteralString('default')
        .withLiteralString('{')
        .withLiteralString('Write-Host"Other"')
        .withOptionalSemicolon()
        .withLiteralString('}')
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'switch statement with regex matches',
      input: joinAsWindowsLines(
        'switch -Regex ($value) {',
        '    "^A.*" { Write-Host "Starts with A" }',
        '    ".*Z$" { Write-Host "Ends with Z" }',
        '    Default { Write-Host "No match" }',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('switch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('-Regex')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('($value)')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('"^A.*"')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Starts with A"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('".*Z$"')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Ends with Z"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Default')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "No match"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .buildRegex(),
    },
    {
      description: 'switch after closing bracket',
      input: joinAsWindowsLines(
        'if ($condition) { $value = 10 }',
        'switch ($value) { 1 { "One" } 2 { "Two" } default { "Other" } }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if ($condition) { $value = 10 }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('switch ($value) { 1 { "One" } 2 { "Two" } default { "Other" } }')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
