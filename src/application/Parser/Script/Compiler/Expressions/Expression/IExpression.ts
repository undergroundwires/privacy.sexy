import { ExpressionPosition } from './ExpressionPosition';
import type { IReadOnlyFunctionParameterCollection } from '../../Function/Parameter/IFunctionParameterCollection';
import type { IExpressionEvaluationContext } from './ExpressionEvaluationContext';

export interface IExpression {
  readonly position: ExpressionPosition;
  readonly parameters: IReadOnlyFunctionParameterCollection;
  evaluate(context: IExpressionEvaluationContext): string;
}
