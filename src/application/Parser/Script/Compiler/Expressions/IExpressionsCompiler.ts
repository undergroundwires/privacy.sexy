export interface ParameterValueDictionary { [parameterName: string]: string; }

export interface IExpressionsCompiler {
    compileExpressions(code: string, parameters?: ParameterValueDictionary): string;
}
