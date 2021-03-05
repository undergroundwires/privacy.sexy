import { ExpressionPosition } from './ExpressionPosition';

export interface IExpression {
    readonly position: ExpressionPosition;
    readonly parameters?: readonly string[];
    evaluate(args?: ExpressionArguments): string;
}

export interface ExpressionArguments {
    readonly [parameter: string]: string;
}

