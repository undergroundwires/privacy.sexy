import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { IExpression } from '@/application/Parser/Script/Compiler/Expressions/Expression/IExpression';
import { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { FunctionParameterCollectionStub } from './FunctionParameterCollectionStub';
import { IExpressionEvaluationContext } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';

export class ExpressionStub implements IExpression {
    public callHistory = new Array<IExpressionEvaluationContext>();
    public position = new ExpressionPosition(0, 5);
    public parameters: IReadOnlyFunctionParameterCollection = new FunctionParameterCollectionStub();
    private result: string;
    public withParameters(parameters: IReadOnlyFunctionParameterCollection) {
        this.parameters = parameters;
        return this;
    }
    public withParameterNames(parameterNames: readonly string[], isOptional = false) {
        const collection = new FunctionParameterCollectionStub()
            .withParameterNames(parameterNames, isOptional);
        return this.withParameters(collection);
    }
    public withPosition(start: number, end: number) {
        this.position = new ExpressionPosition(start, end);
        return this;
    }
    public withEvaluatedResult(result: string) {
        this.result = result;
        return this;
    }
    public evaluate(context: IExpressionEvaluationContext): string {
        const args = context.args;
        this.callHistory.push(context);
        const result = this.result || `[expression-stub] args: ${args ? Object.keys(args).map((key) => `${key}: ${args[key]}`).join('", "') : 'none'}`;
        return result;
    }
}
