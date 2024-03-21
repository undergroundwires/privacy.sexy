import type { IPipe } from '../IPipe';

export class InlinePowerShell implements IPipe {
  public readonly name: string = 'inlinePowerShell';

  public apply(code: string): string {
    if (!code || !hasLines(code)) {
      return code;
    }
    const processor = new Array<(data: string) => string>(...[ // for broken ESlint "indent"
      inlineComments,
      mergeLinesWithBacktick,
      mergeHereStrings,
      mergeNewLines,
    ]).reduce((a, b) => (data) => b(a(data)));
    const newCode = processor(code);
    return newCode;
  }
}

function hasLines(text: string) {
  return text.includes('\n') || text.includes('\r');
}

/*
  Line comments using "#" are replaced with inline comment syntax <# comment.. #>
  Otherwise single # comments out rest of the code
*/
function inlineComments(code: string): string {
  const makeInlineComment = (comment: string) => {
    const value = comment.trim();
    if (!value) {
      return '<##>';
    }
    return `<# ${value} #>`;
  };
  return code.replaceAll(/<#.*?#>|#(.*)/g, (match, captureComment) => {
    if (captureComment === undefined) {
      return match;
    }
    return makeInlineComment(captureComment);
  });
  /*
    Other alternatives considered:
    --------------------------
    /#(?<!<#)(?![<>])(.*)$/gm
    -------------------------
      ✅ Simple, yet matches and captures only what's necessary
      ❌ Fails to match some cases
        ❌ `Write-Host "hi" # Comment ending line inline comment but not one #>`
        ❌ `Write-Host "hi" <#Comment starting like inline comment start but not one`
        ❌ `Write-Host "hi" #>Comment starting like inline comment end but not one`
      ❌ Uses lookbehind
        Safari does not yet support lookbehind and syntax, leading application to not
        load and throw "Invalid regular expression: invalid group specifier name"
        https://caniuse.com/js-regexp-lookbehind
      ⏩ Usage
        return code.replaceAll(/#(?<!<#)(?![<>])(.*)$/gm, (match, captureComment) => {
          return makeInlineComment(captureComment)
        });
    ----------------
    /<#.*?#>|#(.*)/g
    ----------------
      ✅ Simple yet affective
      ❌ Matches all comments, but only captures dash comments
      ❌ Fails to match some cases
        ❌ `Write-Host "hi" # Comment ending line inline comment but not one #>`
        ❌ `Write-Host "hi" <#Comment starting like inline comment start but not one`
      ⏩ Usage
        return code.replaceAll(/<#.*?#>|#(.*)/g, (match, captureComment) => {
          if (captureComment === undefined) {
            return match;
          }
          return makeInlineComment(captureComment);
        });
    ------------------------------------
    /(^(?:<#.*?#>|[^#])*)(?:(#)(.*))?/gm
    ------------------------------------
      ✅ Covers all cases
      ❌ Matches every line, three capture groups are used to build result
      ⏩ Usage
        return code.replaceAll(/(^(?:<#.*?#>|[^#])*)(?:(#)(.*))?/gm,
          (match, captureLeft, captureDash, captureComment) => {
            if (!captureDash) {
              return match;
            }
            return captureLeft + makeInlineComment(captureComment);
          });
    */
}

function getLines(code: string): string[] {
  return (code?.split(/\r\n|\r|\n/) || []);
}

/*
  Merges inline here-strings to a single lined string with Windows line terminator (\r\n)
  https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.4#here-strings
*/
function mergeHereStrings(code: string) {
  const regex = /@(['"])\s*(?:\r\n|\r|\n)((.|\n|\r)+?)(\r\n|\r|\n)\1@/g;
  return code.replaceAll(regex, (_$, quotes, scope) => {
    const newString = getHereStringHandler(quotes);
    const escaped = scope.replaceAll(quotes, newString.escapedQuotes);
    const lines = getLines(escaped);
    const inlined = lines.join(newString.separator);
    const quoted = `${newString.quotesAround}${inlined}${newString.quotesAround}`;
    return quoted;
  });
}
interface IInlinedHereString {
  readonly quotesAround: string;
  readonly escapedQuotes: string;
  readonly separator: string;
}
function getHereStringHandler(quotes: string): IInlinedHereString {
  /*
    We handle @' and @" differently.
    Single quotes are interpreted literally and doubles are expandable.
  */
  const expandableNewLine = '`r`n';
  switch (quotes) {
    case '\'':
      return {
        quotesAround: '\'',
        escapedQuotes: '\'\'',
        separator: `'+"${expandableNewLine}"+'`,
      };
    case '"':
      return {
        quotesAround: '"',
        escapedQuotes: '`"',
        separator: expandableNewLine,
      };
    default:
      throw new Error(`expected quotes: ${quotes}`);
  }
}

/*
  Input ->
      Get-Service * `
          Sort-Object StartType `
          Format-Table Name, ServiceType, Status -AutoSize
  Output ->
      Get-Service * | Sort-Object StartType | Format-Table -AutoSize
*/
function mergeLinesWithBacktick(code: string) {
  /*
    The regex actually wraps any whitespace character after backtick and before newline
    However, this is not always the case for PowerShell.
    I see two behaviors:
        1. If inside string, it's accepted (inside " or ')
        2. If part of a command, PowerShell throws "An empty pipe element is not allowed"
    However we don't need to be so robust and handle this complexity (yet), so for easier regex
    we wrap it anyway
  */
  return code.replaceAll(/ +`\s*(?:\r\n|\r|\n)\s*/g, ' ');
}

function mergeNewLines(code: string) {
  return getLines(code)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('; ');
}
