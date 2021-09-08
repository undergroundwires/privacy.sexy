import { ExpressionPosition } from './ExpressionPosition';
import { IReadOnlyFunctionParameterCollection } from '../../Function/Parameter/IFunctionParameterCollection';
import { IExpressionEvaluationContext } from './ExpressionEvaluationContext';

export interface IExpression {
    readonly position: ExpressionPosition;
    readonly parameters: IReadOnlyFunctionParameterCollection;
    evaluate(context: IExpressionEvaluationContext): string;
}
