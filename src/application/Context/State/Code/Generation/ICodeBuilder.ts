export interface ICodeBuilder {
    currentLine: number;
    appendLine(code?: string): ICodeBuilder;
    appendTrailingHyphensCommentLine(totalRepeatHyphens: number): ICodeBuilder;
    appendCommentLine(commentLine?: string): ICodeBuilder;
    appendCommentLineWithHyphensAround(sectionName: string, totalRepeatHyphens: number): ICodeBuilder;
    appendFunction(name: string, code: string): ICodeBuilder;
    toString(): string;
}
