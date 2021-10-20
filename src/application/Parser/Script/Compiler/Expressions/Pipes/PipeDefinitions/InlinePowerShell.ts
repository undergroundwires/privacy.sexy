import { IPipe } from '../IPipe';

export class InlinePowerShell implements IPipe {
    public readonly name: string = 'inlinePowerShell';
    public apply(code: string): string {
        if (!code || !hasLines(code)) {
            return code;
        }
        code = replaceComments(code);
        code = mergeLinesWithBacktick(code);
        code = mergeHereStrings(code);
        const lines = getLines(code)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
        return lines
            .join('; ');
    }
}

function hasLines(text: string) {
    return text.includes('\n') || text.includes('\r');
}

/*
    Line comments using "#" are replaced with inline comment syntax <# comment.. #>
    Otherwise single # comments out rest of the code
*/
function replaceComments(code: string) {
    return code.replaceAll(/#(?<!<#)(?![<>])(.*)$/gm, (_$, match1 ) => {
        const value = match1?.trim();
        if (!value) {
            return '<##>';
        }
        return `<# ${value} #>`;
    });
}

function getLines(code: string) {
    return (code.split(/\r\n|\r|\n/) || []);
}

/*
    Merges inline here-strings to a single lined string with Windows line terminator (\r\n)
    https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules#here-strings
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
 // We handle @' and @" differently so single quotes are interpreted literally and doubles are expandable
function getHereStringHandler(quotes: string): IInlinedHereString {
    const expandableNewLine = '`r`n';
    switch (quotes) {
        case '\'':
            return {
                quotesAround: '\'',
                escapedQuotes: '\'\'',
                separator: `\'+"${expandableNewLine}"+\'`,
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
