import { IReadOnlyFunctionParameterCollection } from '../../Function/Parameter/IFunctionParameterCollection';
import { ExpressionPosition } from './ExpressionPosition';
import { IExpressionEvaluationContext } from './ExpressionEvaluationContext';

export interface IExpression {
  readonly position: ExpressionPosition;
  readonly parameters: IReadOnlyFunctionParameterCollection;
  evaluate(context: IExpressionEvaluationContext): string;
}
