import { RegexBuilder, type PipeTestScenario } from '../PipeTestRunner';
import { getInlinedOutputWithSemicolons, joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';

export function createTryCatchFinallyTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_try_catch_finally?view=powershell-7.4
  return [
    {
      description: 'try/catch/finally block without newlines',
      input: 'try { $result = 10 / 0 } catch { Write-Host "An error occurred" } finally { Write-Host "Cleanup" }',
      expectedOutput: 'try { $result = 10 / 0 } catch { Write-Host "An error occurred" } finally { Write-Host "Cleanup" }',
    },
    {
      description: 'simple try/catch block (single line inside code blocks)',
      input: joinAsWindowsLines(
        'try {',
        '    $result = 10 / 0',
        '} catch {',
        '    Write-Warning "An error occurred"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 / 0')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch {')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Warning "An error occurred"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'multiline try/catch block',
      input: joinAsWindowsLines(
        'try {',
        '    $result = 10 / 0',
        '    Write-Host "Succesfully completed"',
        '} catch {',
        '    Write-Warning "An error occurred"',
        '    Write-Host "Wrong division?"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 / 0')
        .withSemicolon() // Ensure it adds semicolon to multiline text
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Succesfully completed"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch {')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Warning "An error occurred"')
        .withSemicolon() // Ensure it adds semicolon to multiline text
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Wrong division?"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'try/finally block',
      input: joinAsWindowsLines(
        'try {',
        '    $result = 10 / 0',
        '} finally {',
        '    Write-Warning "An error occurred"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 / 0')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('finally {')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Warning "An error occurred"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'try/catch/finally block',
      input: joinAsWindowsLines(
        'try {',
        '    $result = 10 / 0',
        '} catch {',
        '    Write-Host "An error occurred"',
        '} finally {',
        '    Write-Host "Cleanup"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 / 0')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch {')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "An error occurred"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('finally {')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Cleanup"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'try/catch/finally with closing brackets on separate lines',
      input: joinAsWindowsLines(
        'try {',
        '    $result = 10 / 0',
        '}',
        'catch {',
        '    Write-Host "An error occurred"',
        '}',
        'finally {',
        '    Write-Host "Cleanup"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 / 0')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline() // No semicolon after this to prevent runtime errors
        .withLiteralString('catch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "An error occurred"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline() // No semicolon after this to prevent runtime errors
        .withLiteralString('finally')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Cleanup"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'try/catch with empty catch block',
      input: joinAsWindowsLines(
        'try {',
        '    $result = 10 / 0',
        '} catch {}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 / 0')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch {}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: '/catch/finally with empty blocks',
      input: joinAsWindowsLines(
        'try {} catch {} finally {}',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        'try {} catch {} finally {}',
      ),
    },
    {
      description: 'try/catch with specific exception type',
      input: joinAsWindowsLines(
        'try {',
        '    throw [System.DivideByZeroException]::new()',
        '} catch [System.DivideByZeroException] {',
        '    Write-Host "Caught divide by zero exception"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('throw [System.DivideByZeroException]::new()')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch [System.DivideByZeroException]')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Caught divide by zero exception"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'try/catch with multiple specific exception types',
      input: joinAsWindowsLines(
        'try {',
        '    throw [System.IO.FileNotFoundException]::new()',
        '} catch [System.IO.FileNotFoundException], [System.IO.DirectoryNotFoundException] {',
        '    Write-Host "Caught file or directory not found exception"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('throw [System.IO.FileNotFoundException]::new()')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch [System.IO.FileNotFoundException], [System.IO.DirectoryNotFoundException]')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Caught file or directory not found exception"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'try/catch with multiple catch blocks',
      input: joinAsWindowsLines(
        'try {',
        '    $result = 10 / 0',
        '} catch [System.DivideByZeroException] {',
        '    Write-Host "Caught divide by zero exception"',
        '} catch [System.Exception] {',
        '    Write-Host "Caught general exception"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('$result = 10 / 0')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch [System.DivideByZeroException]')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Caught divide by zero exception"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch [System.Exception]')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Caught general exception"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'try/catch with exception variable',
      input: joinAsWindowsLines(
        'try {',
        '    throw "Custom error"',
        '} catch {',
        '    Write-Host "Error: $($_.Exception.Message)"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('throw "Custom error"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Error: $($_.Exception.Message)"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'try/catch/finally with return in try block',
      input: joinAsWindowsLines(
        'try {',
        '    return "Success"',
        '} catch {',
        '    Write-Host "An error occurred"',
        '} finally {',
        '    Write-Host "Cleanup"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('return "Success"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "An error occurred"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('finally')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Cleanup"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'nested try/catch blocks',
      input: joinAsWindowsLines(
        'try {',
        '    try {',
        '        throw "Inner exception"',
        '    } catch {',
        '        throw "Outer exception"',
        '    }',
        '} catch {',
        '    Write-Host "Caught in outer catch: $($_.Exception.Message)"',
        '}',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('try')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('throw "Inner exception"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('throw "Outer exception"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('catch')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('{')
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('Write-Host "Caught in outer catch: $($_.Exception.Message)"')
        .withOptionalSemicolon()
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('}')
        .withOptionalSemicolon()
        .buildRegex(),
    },
    {
      description: 'try after closing bracket',
      input: joinAsWindowsLines(
        'if ($condition) { $value = 10 }',
        'try { $result = 10 / $value }',
      ),
      expectedOutput: new RegexBuilder()
        .withLiteralString('if ($condition) { $value = 10 }')
        .withSemicolon() // Semicolon here to prevent runtime errors
        .withOptionalWhitespaceButNoNewline()
        .withLiteralString('try { $result = 10 / $value }')
        .withOptionalSemicolon()
        .buildRegex(),
    },
  ];
}
