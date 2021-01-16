import { IExpressionsCompiler, ParameterValueDictionary } from './IExpressionsCompiler';
import { generateIlCode, IILCode } from './ILCode';

export class ExpressionsCompiler implements IExpressionsCompiler {
    public static readonly instance: IExpressionsCompiler = new ExpressionsCompiler();
    protected constructor() { }
    public compileExpressions(code: string, parameters?: ParameterValueDictionary): string {
        let intermediateCode = generateIlCode(code);
        intermediateCode = substituteParameters(intermediateCode, parameters);
        return intermediateCode.compile();
    }
}

function substituteParameters(intermediateCode: IILCode, parameters: ParameterValueDictionary): IILCode {
    const parameterNames = intermediateCode.getUniqueParameterNames();
    ensureValuesProvided(parameterNames, parameters);
    for (const parameterName of parameterNames) {
        const parameterValue = parameters[parameterName];
        intermediateCode = intermediateCode.substituteParameter(parameterName, parameterValue);
    }
    return intermediateCode;
}

function ensureValuesProvided(names: string[], nameValues: ParameterValueDictionary) {
    nameValues = nameValues || {};
    const notProvidedNames = names.filter((name) => !Boolean(nameValues[name]));
    if (notProvidedNames.length) {
        throw new Error(`parameter value(s) not provided for: ${printList(notProvidedNames)}`);
    }
}

function printList(list: readonly string[]): string {
    return `"${list.join('", "')}"`;
}
