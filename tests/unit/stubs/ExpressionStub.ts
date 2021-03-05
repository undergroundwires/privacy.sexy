import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { ExpressionArguments, IExpression } from '@/application/Parser/Script/Compiler/Expressions/Expression/IExpression';

export class ExpressionStub implements IExpression {
    public callHistory = new Array<ExpressionArguments>();
    public position = new ExpressionPosition(0, 5);
    public parameters = [];
    private result: string;
    public withParameters(...parameters: string[]) {
        this.parameters = parameters;
        return this;
    }
    public withPosition(start: number, end: number) {
        this.position = new ExpressionPosition(start, end);
        return this;
    }
    public withEvaluatedResult(result: string) {
        this.result = result;
        return this;
    }
    public evaluate(args?: ExpressionArguments): string {
        this.callHistory.push(args);
        const result = this.result || `[expression-stub] args: ${args ? Object.keys(args).map((key) => `${key}: ${args[key]}`).join('", "') : 'none'}`;
        return result;
    }
}
