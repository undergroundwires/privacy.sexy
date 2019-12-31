
export abstract class CodeRenderer {

    protected readonly totalFunctionSeparatorChars = 58;

    protected readonly trailingHyphens = '-'.repeat(this.totalFunctionSeparatorChars);

    protected renderComment(line?: string): string {
        return line ? `:: ${line}` : ':: ';
    }
}
