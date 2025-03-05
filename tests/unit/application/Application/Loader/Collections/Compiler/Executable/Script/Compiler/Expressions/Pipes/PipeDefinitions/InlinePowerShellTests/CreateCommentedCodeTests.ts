import { getInlinedOutputWithSemicolons, joinAsWindowsLines } from './CommonInlinePowerShellTestUtilities';
import type { PipeTestScenario } from '../PipeTestRunner';

export function createCommentedCodeTests(): PipeTestScenario[] {
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_comment_based_help?view=powershell-7.4
  return [
    {
      description: 'converts hash comments at line end',
      input: joinAsWindowsLines(
        '$text = "Hello"\t# Comment after tab',
        '$text+= #Comment without space after hash',
        'Write-Host $text# Comment without space before hash',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '$text = "Hello"\t<# Comment after tab #>',
        '$text+= <# Comment without space after hash #>',
        'Write-Host $text<# Comment without space before hash #>',
      ),
    },
    {
      description: 'converts hash comment lines',
      input: joinAsWindowsLines(
        '# Comment in first line',
        'Write-Host "Hello"',
        '# Comment in the middle',
        'Write-Host "World"',
        '# Consecutive comments',
        '# Last line comment without line ending in the end',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '<# Comment in first line #>',
        'Write-Host "Hello"',
        '<# Comment in the middle #>',
        'Write-Host "World"',
        '<# Consecutive comments #>',
        '<# Last line comment without line ending in the end #>',
      ),
    },
    {
      description: 'converts comments with inline comment parts inside',
      input: joinAsWindowsLines(
        '$text+= #Comment with < inside',
        '$text+= #Comment ending with >',
        '$text+= #Comment with <# inline comment #>',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '$text+= <# Comment with < inside #>',
        '$text+= <# Comment ending with > #>',
        '$text+= <# Comment with <# inline comment #> #>',
      ),
    },
    {
      description: 'converts comments with inline comment parts around', // Pretty uncommon
      input: joinAsWindowsLines(
        'Write-Host "hi" # Comment ending line inline comment but not one #>',
        'Write-Host "hi" #>Comment starting like inline comment end but not one',
        // Following line does not compile as valid PowerShell due to missing #> for inline comment.
        'Write-Host "hi" <#Comment starting like inline comment start but not one',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        'Write-Host "hi" <# Comment ending line inline comment but not one #> #>',
        'Write-Host "hi" <# >Comment starting like inline comment end but not one #>',
        'Write-Host "hi" <<# Comment starting like inline comment start but not one #>',
      ),
    },
    {
      description: 'converts empty hash comments',
      input: joinAsWindowsLines(
        'Write-Host "Comment without text" #',
        'Write-Host "Non-empty line"',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        'Write-Host "Comment without text" <##>',
        'Write-Host "Non-empty line"',
      ),
    },
    {
      description: 'adds whitespaces around comments',
      input: joinAsWindowsLines(
        '#Comment line with no whitespaces around',
        'Write-Host "Hello"#Comment in the end with no whitespaces around',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '<# Comment line with no whitespaces around #>',
        'Write-Host "Hello"<# Comment in the end with no whitespaces around #>',
      ),
    },
    {
      description: 'trims whitespaces around comments',
      input: joinAsWindowsLines(
        '#      Comment with whitespaces around       ',
        '#\tComment with tabs around\t\t',
        '#\t  Comment with tabs and whitespaces around  \t  \t',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '<# Comment with whitespaces around #>',
        '<# Comment with tabs around #>',
        '<# Comment with tabs and whitespaces around #>',
      ),
    },
    {
      description: 'preserves block comments',
      input: joinAsWindowsLines(
        '$text = "Hello"\t<# block comment #> + "World"',
        '$text = "Hello"\t+<#comment#>"World"',
        '<# Block comment in a line #>',
        'Write-Host "Hello world <# Block comment in the end of line #>',
      ),
      expectedOutput: getInlinedOutputWithSemicolons(
        '$text = "Hello"\t<# block comment #> + "World"',
        '$text = "Hello"\t+<#comment#>"World"',
        '<# Block comment in a line #>',
        'Write-Host "Hello world <# Block comment in the end of line #>',
      ),
    },
    {
      description: 'preserves single-line input',
      input: 'Write-Host "expected" # as it is!',
      expectedOutput: 'Write-Host "expected" # as it is!',
    },
  ];
}
