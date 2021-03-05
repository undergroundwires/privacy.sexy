import { IExpression } from '../Expression/IExpression';

export interface IExpressionParser {
    findExpressions(code: string): IExpression[];
}
