import { IExpression } from '@/application/Parser/Script/Compiler/Expressions/Expression/IExpression';
import { IExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/IExpressionParser';

export class ExpressionParserStub implements IExpressionParser {
    public callHistory = new Array<string>();
    private result: IExpression[] = [];
    public withResult(result: IExpression[]) {
        this.result = result;
        return this;
    }
    public findExpressions(code: string): IExpression[] {
        this.callHistory.push(code);
        return this.result;
    }
}
