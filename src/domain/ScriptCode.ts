import { IScriptCode } from './IScriptCode';

export class ScriptCode implements IScriptCode {
  constructor(
    public readonly execute: string,
    public readonly revert: string,
    syntax: ILanguageSyntax,
  ) {
    if (!syntax) { throw new Error('undefined syntax'); }
    validateCode(execute, syntax);
    validateRevertCode(revert, execute, syntax);
  }
}

export interface ILanguageSyntax {
  readonly commentDelimiters: string[];
  readonly commonCodeParts: string[];
}

function validateRevertCode(revertCode: string, execute: string, syntax: ILanguageSyntax) {
  if (!revertCode) {
    return;
  }
  try {
    validateCode(revertCode, syntax);
    if (execute === revertCode) {
      throw new Error('Code itself and its reverting code cannot be the same');
    }
  } catch (err) {
    throw Error(`(revert): ${err.message}`);
  }
}

function validateCode(code: string, syntax: ILanguageSyntax): void {
  if (!code || code.length === 0) {
    throw new Error('code is empty or undefined');
  }
  ensureNoEmptyLines(code);
  ensureCodeHasUniqueLines(code, syntax);
}

function ensureNoEmptyLines(code: string): void {
  const lines = code.split(/\r\n|\r|\n/);
  if (lines.some((line) => line.trim().length === 0)) {
    throw Error(`Script has empty lines:\n${lines.map((part, index) => `\n (${index}) ${part || '❌'}`).join('')}`);
  }
}

function ensureCodeHasUniqueLines(code: string, syntax: ILanguageSyntax): void {
  const allLines = code.split(/\r\n|\r|\n/);
  const checkedLines = allLines.filter((line) => !shouldIgnoreLine(line, syntax));
  if (checkedLines.length === 0) {
    return;
  }
  const duplicateLines = checkedLines.filter((e, i, a) => a.indexOf(e) !== i);
  if (duplicateLines.length !== 0) {
    throw Error(`Duplicates detected in script:\n${printDuplicatedLines(allLines)}`);
  }
}

function printDuplicatedLines(allLines: string[]) {
  return allLines
    .map((line, index) => {
      const occurrenceIndices = allLines
        .map((e, i) => (e === line ? i : ''))
        .filter(String);
      const isDuplicate = occurrenceIndices.length > 1;
      const indicator = isDuplicate ? `❌ (${occurrenceIndices.join(',')})\t` : '✅ ';
      return `${indicator}[${index}] ${line}`;
    })
    .join('\n');
}

function shouldIgnoreLine(codeLine: string, syntax: ILanguageSyntax): boolean {
  const lowerCaseCodeLine = codeLine.toLowerCase();
  const isCommentLine = () => syntax.commentDelimiters.some(
    (delimiter) => lowerCaseCodeLine.startsWith(delimiter),
  );
  const consistsOfFrequentCommands = () => {
    const trimmed = lowerCaseCodeLine.trim().split(' ');
    return trimmed.every((part) => syntax.commonCodeParts.includes(part));
  };
  return isCommentLine() || consistsOfFrequentCommands();
}
