import 'mocha';
import { expect } from 'chai';
import { FunctionCall } from '@/application/Parser/Script/Compiler/FunctionCall/FunctionCall';
import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/FunctionCall/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/stubs/FunctionCallArgumentCollectionStub';

describe('FunctionCall', () => {
    describe('ctor', () => {
        it('throws when args is undefined', () => {
            // arrange
            const expectedError = 'undefined args';
            const args = undefined;
            // act
            const act = () => new FunctionCallBuilder()
                .withArgs(args)
                .build();
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws when function name is undefined', () => {
            // arrange
            const expectedError = 'empty function name in function call';
            const functionName = undefined;
            // act
            const act = () => new FunctionCallBuilder()
                .withFunctionName(functionName)
                .build();
            // assert
            expect(act).to.throw(expectedError);
        });
    });
});

class FunctionCallBuilder {
    private functionName = 'functionName';
    private args: IReadOnlyFunctionCallArgumentCollection = new FunctionCallArgumentCollectionStub();

    public withFunctionName(functionName: string) {
        this.functionName = functionName;
        return this;
    }

    public withArgs(args: IReadOnlyFunctionCallArgumentCollection) {
        this.args = args;
        return this;
    }

    public build() {
        return new FunctionCall(this.functionName, this.args);
    }
}
