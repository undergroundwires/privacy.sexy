import { ExpressionPosition } from './ExpressionPosition';
import { IReadOnlyFunctionCallArgumentCollection } from '../../FunctionCall/Argument/IFunctionCallArgumentCollection';
import { IReadOnlyFunctionParameterCollection } from '../../Function/Parameter/IFunctionParameterCollection';

export interface IExpression {
    readonly position: ExpressionPosition;
    readonly parameters: IReadOnlyFunctionParameterCollection;
    evaluate(args: IReadOnlyFunctionCallArgumentCollection): string;
}
