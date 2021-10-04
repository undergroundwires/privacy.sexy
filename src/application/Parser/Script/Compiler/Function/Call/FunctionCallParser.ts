import { FunctionCallData, FunctionCallsData } from 'js-yaml-loader!@/*';
import { IFunctionCall } from './IFunctionCall';
import { FunctionCallArgumentCollection } from './Argument/FunctionCallArgumentCollection';
import { FunctionCallArgument } from './Argument/FunctionCallArgument';
import { FunctionCall } from './FunctionCall';

export function parseFunctionCalls(calls: FunctionCallsData): IFunctionCall[] {
    if (!calls) {
        throw new Error('undefined call data');
    }
    const sequence = getCallSequence(calls);
    return sequence.map((call) => parseFunctionCall(call));
}

function getCallSequence(calls: FunctionCallsData): FunctionCallData[] {
    if (typeof calls !== 'object') {
        throw new Error('called function(s) must be an object');
    }
    if (calls instanceof Array) {
        return calls as FunctionCallData[];
    }
    return [ calls as FunctionCallData ];
}

function parseFunctionCall(call: FunctionCallData): IFunctionCall {
    if (!call) {
        throw new Error(`undefined function call`);
    }
    const args = new FunctionCallArgumentCollection();
    for (const parameterName of Object.keys(call.parameters || {})) {
        const arg = new FunctionCallArgument(parameterName, call.parameters[parameterName]);
        args.addArgument(arg);
    }
    return new FunctionCall(call.function, args);
}
