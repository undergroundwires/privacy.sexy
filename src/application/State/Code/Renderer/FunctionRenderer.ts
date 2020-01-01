import { CodeRenderer } from './CodeRenderer';

export class FunctionRenderer extends CodeRenderer {
    public renderFunction(name: string, code: string) {
        if (!name)  { throw new Error('name cannot be empty or null'); }
        if (!code)  { throw new Error('code cannot be empty or null'); }
        return this.renderFunctionStartComment(name) + '\n'
            + `echo --- ${name}` + '\n'
            + code + '\n'
            + this.renderFunctionEndComment();
    }

    private renderFunctionStartComment(functionName: string): string {
        if (functionName.length >= this.totalFunctionSeparatorChars) {
            return this.renderComment(functionName);
        }
        return this.renderComment(this.trailingHyphens) + '\n' +
            this.renderFunctionName(functionName) + '\n' +
            this.renderComment(this.trailingHyphens);
    }

    private renderFunctionName(functionName: string) {
        const firstHyphens = '-'.repeat(Math.floor((this.totalFunctionSeparatorChars - functionName.length) / 2));
        const secondHyphens = '-'.repeat(Math.ceil((this.totalFunctionSeparatorChars - functionName.length) / 2));
        return `${this.renderComment()}${firstHyphens}${functionName}${secondHyphens}`;
    }

    private renderFunctionEndComment(): string {
        return this.renderComment(this.trailingHyphens);
    }
}
