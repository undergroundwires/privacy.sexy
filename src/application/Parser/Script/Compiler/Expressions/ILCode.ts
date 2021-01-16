export interface IILCode {
    compile(): string;
    getUniqueParameterNames(): string[];
    substituteParameter(parameterName: string, parameterValue: string): IILCode;
}

export function generateIlCode(rawText: string): IILCode {
    const ilCode = generateIl(rawText);
    return new ILCode(ilCode);
}

class ILCode implements IILCode {
    private readonly ilCode: string;

    constructor(ilCode: string) {
        this.ilCode = ilCode;
    }

    public substituteParameter(parameterName: string, parameterValue: string): IILCode {
        const newCode = substituteParameter(this.ilCode, parameterName, parameterValue);
        return new ILCode(newCode);
    }

    public getUniqueParameterNames(): string[] {
        return getUniqueParameterNames(this.ilCode);
    }

    public compile(): string {
        ensureNoExpressionLeft(this.ilCode);
        return this.ilCode;
    }
}

// Trim each expression and put them inside "{{exp|}}" e.g. "{{ $hello }}" becomes "{{exp|$hello}}"
function generateIl(rawText: string): string {
    return rawText.replace(/\{\{([\s]*[^;\s\{]+[\s]*)\}\}/g, (_, match) => {
        return `\{\{exp|${match.trim()}\}\}`;
    });
}

// finds all "{{exp|..}} left"
function ensureNoExpressionLeft(ilCode: string) {
    const allSubstitutions = ilCode.matchAll(/\{\{exp\|(.*?)\}\}/g);
    const allMatches = Array.from(allSubstitutions, (match) => match[1]);
    const uniqueExpressions = getDistinctValues(allMatches);
    if (uniqueExpressions.length > 0) {
        throw new Error(`unknown expression: ${printList(uniqueExpressions)}`);
    }
}

// Parses all distinct usages of {{exp|$parameterName}}
function getUniqueParameterNames(ilCode: string) {
    const allSubstitutions = ilCode.matchAll(/\{\{exp\|\$([^;\s\{]+[\s]*)\}\}/g);
    const allParameters = Array.from(allSubstitutions, (match) => match[1]);
    const uniqueParameterNames = getDistinctValues(allParameters);
    return uniqueParameterNames;
}

// substitutes {{exp|$parameterName}} to value of the parameter
function substituteParameter(ilCode: string, parameterName: string, parameterValue: string) {
    const pattern = `{{exp|$${parameterName}}}`;
    return ilCode.split(pattern).join(parameterValue); // as .replaceAll() is not yet supported by TS
}

function getDistinctValues(values: readonly string[]): string[] {
    return values.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
}

function printList(list: readonly string[]): string {
    return `"${list.join('","')}"`;
}
