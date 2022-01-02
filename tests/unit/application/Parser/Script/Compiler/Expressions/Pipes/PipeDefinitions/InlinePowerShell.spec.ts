import 'mocha';
import { InlinePowerShell } from '@/application/Parser/Script/Compiler/Expressions/Pipes/PipeDefinitions/InlinePowerShell';
import { IPipeTestCase, runPipeTests } from './PipeTestRunner';

describe('InlinePowerShell', () => {
  // arrange
  const sut = new InlinePowerShell();
  // act
  runPipeTests(sut, [
    {
      name: 'returns undefined when if input is undefined',
      input: undefined,
      expectedOutput: undefined,
    },
    ...prefixTests('newline', getNewLineCases()),
    ...prefixTests('comment', getCommentCases()),
    ...prefixTests('here-string', hereStringCases()),
    ...prefixTests('backtick', backTickCases()),
  ]);
});

function hereStringCases(): IPipeTestCase[] {
  const expectLinesInDoubleQuotes = (...lines: string[]) => lines.join('`r`n');
  const expectLinesInSingleQuotes = (...lines: string[]) => lines.join('\'+"`r`n"+\'');
  return [
    {
      name: 'adds newlines for double quotes',
      input: getWindowsLines(
        '@"',
        'Lorem',
        'ipsum',
        'dolor sit amet',
        '"@',
      ),
      expectedOutput: expectLinesInDoubleQuotes(
        '"Lorem',
        'ipsum',
        'dolor sit amet"',
      ),
    },
    {
      name: 'adds newlines for single quotes',
      input: getWindowsLines(
        '@\'',
        'Lorem',
        'ipsum',
        'dolor sit amet',
        '\'@',
      ),
      expectedOutput: expectLinesInSingleQuotes(
        '\'Lorem',
        'ipsum',
        'dolor sit amet\'',
      ),
    },
    {
      name: 'does not match with character after here string header',
      input: getWindowsLines(
        '@" invalid syntax',
        'I will not be processed as here-string',
        '"@',
      ),
      expectedOutput: getSingleLinedOutput(
        '@" invalid syntax',
        'I will not be processed as here-string',
        '"@',
      ),
    },
    {
      name: 'does not match if there\'s character before here-string terminator',
      input: getWindowsLines(
        '@\'',
        'do not match here',
        ' \'@',
        'character \'@',
      ),
      expectedOutput: getSingleLinedOutput(
        '@\'',
        'do not match here',
        ' \'@',
        'character \'@',
      ),
    },
    {
      name: 'does not match with different here-string header/terminator',
      input: getWindowsLines(
        '@\'',
        'lorem',
        '"@',
      ),
      expectedOutput: getSingleLinedOutput(
        '@\'',
        'lorem',
        '"@',
      ),
    },
    {
      name: 'matches with inner single quoted here-string',
      input: getWindowsLines(
        '$hasInnerDoubleQuotedTerminator = @"',
        'inner text',
        '@\'',
        'inner terminator text',
        '\'@',
        '"@',
      ),
      expectedOutput: expectLinesInDoubleQuotes(
        '$hasInnerDoubleQuotedTerminator = "inner text',
        '@\'',
        'inner terminator text',
        '\'@"',
      ),
    },
    {
      name: 'matches with inner double quoted string',
      input: getWindowsLines(
        '$hasInnerSingleQuotedTerminator = @\'',
        'inner text',
        '@"',
        'inner terminator text',
        '"@',
        '\'@',
      ),
      expectedOutput: expectLinesInSingleQuotes(
        '$hasInnerSingleQuotedTerminator = \'inner text',
        '@"',
        'inner terminator text',
        '"@\'',
      ),
    },
    {
      name: 'matches if there\'s character after here-string terminator',
      input: getWindowsLines(
        '@\'',
        'lorem',
        '\'@ after',
      ),
      expectedOutput: expectLinesInSingleQuotes(
        '\'lorem\' after',
      ),
    },
    {
      name: 'escapes double quotes inside double quotes',
      input: getWindowsLines(
        '@"',
        'For help, type "get-help"',
        '"@',
      ),
      expectedOutput: '"For help, type `"get-help`""',
    },
    {
      name: 'escapes single quotes inside single quotes',
      input: getWindowsLines(
        '@\'',
        'For help, type \'get-help\'',
        '\'@',
      ),
      expectedOutput: '\'For help, type \'\'get-help\'\'\'',
    },
    {
      name: 'converts when here-string header is not at line start',
      input: getWindowsLines(
        '$page = [XML] @"',
        'multi-lined',
        'and "quoted"',
        '"@',
      ),
      expectedOutput: expectLinesInDoubleQuotes(
        '$page = [XML] "multi-lined',
        'and `"quoted`""',
      ),
    },
    {
      name: 'trims after here-string header',
      input: getWindowsLines(
        '@"    \t',
        'text with whitespaces at here-string start',
        '"@',
      ),
      expectedOutput: '"text with whitespaces at here-string start"',
    },
    {
      name: 'preserves whitespaces in lines',
      input: getWindowsLines(
        '@\'',
        '\ttext with tabs around\t\t',
        '  text with whitespaces around ',
        '\'@',
      ),
      expectedOutput: expectLinesInSingleQuotes(
        '\'\ttext with tabs around\t\t',
        '  text with whitespaces around \'',
      ),
    },
  ];
}

function backTickCases(): IPipeTestCase[] {
  return [
    {
      name: 'wraps newlines with trailing backtick',
      input: getWindowsLines(
        'Get-Service * `',
        '| Format-Table -AutoSize',
      ),
      expectedOutput: 'Get-Service * | Format-Table -AutoSize',
    },
    {
      name: 'wraps newlines with trailing backtick and different line endings',
      input: 'Get-Service `\n'
        + '* `\r'
        + '| Sort-Object StartType `\r\n'
        + '| Format-Table -AutoSize',
      expectedOutput: 'Get-Service * | Sort-Object StartType | Format-Table -AutoSize',
    },
    {
      name: 'trims tabs and whitespaces on next lines when wrapping with trailing backtick',
      input: getWindowsLines(
        'Get-Service * `',
        '\t| Sort-Object StartType `',
        '  | Format-Table -AutoSize',
      ),
      expectedOutput: 'Get-Service * | Sort-Object StartType | Format-Table -AutoSize',
    },
    {
      name: 'does not wrap without whitespace before backtick',
      input: getWindowsLines(
        'Get-Service *`',
        '| Format-Table -AutoSize',
      ),
      expectedOutput: getSingleLinedOutput(
        'Get-Service *`',
        '| Format-Table -AutoSize',
      ),
    },
    {
      name: 'does not wrap with characters after',
      input: getWindowsLines(
        'line start ` after',
        'should not be wrapped',
      ),
      expectedOutput: getSingleLinedOutput(
        'line start ` after',
        'should not be wrapped',
      ),
    },
  ];
}

function getCommentCases(): IPipeTestCase[] {
  return [
    {
      name: 'converts hash comments in the line end',
      input: getWindowsLines(
        '$text = "Hello"\t# Comment after tab',
        '$text+= #Comment without space after hash',
        'Write-Host $text# Comment without space before hash',
      ),
      expectedOutput: getSingleLinedOutput(
        '$text = "Hello"\t<# Comment after tab #>',
        '$text+= <# Comment without space after hash #>',
        'Write-Host $text<# Comment without space before hash #>',
      ),
    },
    {
      name: 'converts hash comment line',
      input: getWindowsLines(
        '# Comment in first line',
        'Write-Host "Hello"',
        '# Comment in the middle',
        'Write-Host "World"',
        '# Consecutive comments',
        '# Last line comment without line ending in the end',
      ),
      expectedOutput: getSingleLinedOutput(
        '<# Comment in first line #>',
        'Write-Host "Hello"',
        '<# Comment in the middle #>',
        'Write-Host "World"',
        '<# Consecutive comments #>',
        '<# Last line comment without line ending in the end #>',
      ),
    },
    {
      name: 'can convert comment with inline comment parts inside',
      input: getWindowsLines(
        '$text+= #Comment with < inside',
        '$text+= #Comment ending with >',
        '$text+= #Comment with <# inline comment #>',
      ),
      expectedOutput: getSingleLinedOutput(
        '$text+= <# Comment with < inside #>',
        '$text+= <# Comment ending with > #>',
        '$text+= <# Comment with <# inline comment #> #>',
      ),
    },
    {
      name: 'can convert comment with inline comment parts around', // Pretty uncommon
      input: getWindowsLines(
        'Write-Host "hi" # Comment ending line inline comment but not one #>',
        'Write-Host "hi" #>Comment starting like inline comment end but not one',
        // Following line does not compile as valid PowerShell due to missing #> for inline comment.
        'Write-Host "hi" <#Comment starting like inline comment start but not one',
      ),
      expectedOutput: getSingleLinedOutput(
        'Write-Host "hi" <# Comment ending line inline comment but not one #> #>',
        'Write-Host "hi" <# >Comment starting like inline comment end but not one #>',
        'Write-Host "hi" <<# Comment starting like inline comment start but not one #>',
      ),
    },
    {
      name: 'converts empty hash comment',
      input: getWindowsLines(
        'Write-Host "Comment without text" #',
        'Write-Host "Non-empty line"',
      ),
      expectedOutput: getSingleLinedOutput(
        'Write-Host "Comment without text" <##>',
        'Write-Host "Non-empty line"',
      ),
    },
    {
      name: 'adds whitespaces around to match',
      input: getWindowsLines(
        '#Comment line with no whitespaces around',
        'Write-Host "Hello"#Comment in the end with no whitespaces around',
      ),
      expectedOutput: getSingleLinedOutput(
        '<# Comment line with no whitespaces around #>',
        'Write-Host "Hello"<# Comment in the end with no whitespaces around #>',
      ),
    },
    {
      name: 'trims whitespaces around comment',
      input: getWindowsLines(
        '#      Comment with whitespaces around       ',
        '#\tComment with tabs around\t\t',
        '#\t  Comment with tabs and whitespaces around  \t  \t',
      ),
      expectedOutput: getSingleLinedOutput(
        '<# Comment with whitespaces around #>',
        '<# Comment with tabs around #>',
        '<# Comment with tabs and whitespaces around #>',
      ),
    },
    {
      name: 'does not convert block comments',
      input: getWindowsLines(
        '$text = "Hello"\t<# block comment #> + "World"',
        '$text = "Hello"\t+<#comment#>"World"',
        '<# Block comment in a line #>',
        'Write-Host "Hello world <# Block comment in the end of line #>',
      ),
      expectedOutput: getSingleLinedOutput(
        '$text = "Hello"\t<# block comment #> + "World"',
        '$text = "Hello"\t+<#comment#>"World"',
        '<# Block comment in a line #>',
        'Write-Host "Hello world <# Block comment in the end of line #>',
      ),
    },
    {
      name: 'does not process if there are no multi lines',
      input: 'Write-Host "expected" # as it is!',
      expectedOutput: 'Write-Host "expected" # as it is!',
    },
  ];
}

function getNewLineCases(): IPipeTestCase[] {
  return [
    {
      name: 'no new line',
      input: 'Write-Host \'Hello, World!\'',
      expectedOutput: 'Write-Host \'Hello, World!\'',
    },
    {
      name: '\\n new line',
      input:
        '$things = Get-ChildItem C:\\Windows\\'
          + '\nforeach ($thing in $things) {'
          + '\nWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\n}',
      expectedOutput: getSingleLinedOutput(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
    {
      name: '\\n double empty lines are ignored',
      input:
        '$things = Get-ChildItem C:\\Windows\\'
          + '\n\nforeach ($thing in $things) {'
          + '\n\nWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\n\n\n}',
      expectedOutput: getSingleLinedOutput(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
    {
      name: '\\r new line',
      input:
        '$things = Get-ChildItem C:\\Windows\\'
          + '\rforeach ($thing in $things) {'
          + '\rWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\r}',
      expectedOutput: getSingleLinedOutput(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
    {
      name: '\\r and \\n newlines combined',
      input:
        '$things = Get-ChildItem C:\\Windows\\'
          + '\r\nforeach ($thing in $things) {'
          + '\n\rWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\n\r}',
      expectedOutput: getSingleLinedOutput(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
    {
      name: 'trims whitespaces on lines',
      input:
        ' $things = Get-ChildItem C:\\Windows\\   '
          + '\nforeach ($thing in $things) {'
          + '\n\tWrite-Host $thing.Name -ForegroundColor Magenta'
          + '\r       \n}',
      expectedOutput: getSingleLinedOutput(
        '$things = Get-ChildItem C:\\Windows\\',
        'foreach ($thing in $things) {',
        'Write-Host $thing.Name -ForegroundColor Magenta',
        '}',
      ),
    },
  ];
}

function prefixTests(prefix: string, tests: IPipeTestCase[]): IPipeTestCase[] {
  return tests.map((test) => ({
    name: `[${prefix}] ${test.name}`,
    input: test.input,
    expectedOutput: test.expectedOutput,
  }));
}

function getWindowsLines(...lines: string[]) {
  return lines.join('\r\n');
}

function getSingleLinedOutput(...lines: string[]) {
  return lines.map((line) => line.trim()).join('; ');
}
