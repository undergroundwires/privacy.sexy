import 'mocha';
import { expect } from 'chai';
import { parseFunctionCalls } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCallParser';
import { FunctionCallDataStub } from '@tests/unit/stubs/FunctionCallDataStub';

describe('FunctionCallParser', () => {
    describe('parseFunctionCalls', () => {
        it('throws with undefined call', () => {
            // arrange
            const expectedError = 'undefined call data';
            const call = undefined;
            // act
            const act = () => parseFunctionCalls(call);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws if call is not an object', () => {
            // arrange
            const expectedError = 'called function(s) must be an object';
            const invalidCalls: readonly any[] = ['string', 33];
            invalidCalls.forEach((invalidCall) => {
                // act
                const act = () => parseFunctionCalls(invalidCall);
                // assert
                expect(act).to.throw(expectedError);
            });
        });
        it('throws if call sequence has undefined call', () => {
            // arrange
            const expectedError = 'undefined function call';
            const data = [
                new FunctionCallDataStub(),
                undefined,
            ];
            // act
            const act = () => parseFunctionCalls(data);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws if call sequence has undefined function name', () => {
            // arrange
            const expectedError = 'empty function name in function call';
            const data = [
                new FunctionCallDataStub().withName('function-name'),
                new FunctionCallDataStub().withName(undefined),
            ];
            // act
            const act = () => parseFunctionCalls(data);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('parses single call as expected', () => {
            // arrange
            const expectedFunctionName = 'functionName';
            const expectedParameterName = 'parameterName';
            const expectedArgumentValue = 'argumentValue';
            const data = new FunctionCallDataStub()
                .withName(expectedFunctionName)
                .withParameters({ [expectedParameterName]: expectedArgumentValue });
            // act
            const actual = parseFunctionCalls(data);
            // assert
            expect(actual).to.have.lengthOf(1);
            const call = actual[0];
            expect(call.functionName).to.equal(expectedFunctionName);
            const args = call.args;
            expect(args.getAllParameterNames()).to.have.lengthOf(1);
            expect(args.hasArgument(expectedParameterName)).to.equal(true,
                `Does not include expected parameter: "${expectedParameterName}"\n` +
                `But includes: "${args.getAllParameterNames()}"`);
            const argument = args.getArgument(expectedParameterName);
            expect(argument.parameterName).to.equal(expectedParameterName);
            expect(argument.argumentValue).to.equal(expectedArgumentValue);
        });
        it('parses multiple calls as expected', () => {
            // arrange
            const getFunctionName = (index: number) => `functionName${index}`;
            const getParameterName = (index: number) => `parameterName${index}`;
            const getArgumentValue = (index: number) => `argumentValue${index}`;
            const createCall = (index: number) => new FunctionCallDataStub()
                .withName(getFunctionName(index))
                .withParameters({ [getParameterName(index)]: getArgumentValue(index)});
            const calls = [ createCall(0), createCall(1), createCall(2), createCall(3) ];
            // act
            const actual = parseFunctionCalls(calls);
            // assert
            expect(actual).to.have.lengthOf(calls.length);
            for (let i = 0; i < calls.length; i++) {
                const call = actual[i];
                const expectedParameterName = getParameterName(i);
                const expectedArgumentValue = getArgumentValue(i);
                expect(call.functionName).to.equal(getFunctionName(i));
                expect(call.args.getAllParameterNames()).to.have.lengthOf(1);
                expect(call.args.hasArgument(expectedParameterName)).to.equal(true);
                const argument = call.args.getArgument(expectedParameterName);
                expect(argument.parameterName).to.equal(expectedParameterName);
                expect(argument.argumentValue).to.equal(expectedArgumentValue);
            }
        });
    });
});
