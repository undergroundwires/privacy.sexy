import 'mocha';
import { expect } from 'chai';
import { FunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameter';
import { testParameterName } from '../../ParameterNameTestRunner';

describe('FunctionParameter', () => {
    describe('name', () => {
        testParameterName(
            (parameterName) => new FunctionParameterBuilder()
                .withName(parameterName)
                .build()
                .name,
        );
    });
    describe('isOptional', () => {
        describe('sets as expected', () => {
            // arrange
            const expectedValues = [ true, false];
            for (const expected of expectedValues) {
                it(expected.toString(), () => {
                    // act
                    const sut = new FunctionParameterBuilder()
                        .withIsOptional(expected)
                        .build();
                    // expect
                    expect(sut.isOptional).to.equal(expected);
                });
            }
        });
    });
});

class FunctionParameterBuilder {
    private name = 'parameterFromParameterBuilder';
    private isOptional = false;
    public withName(name: string) {
        this.name = name;
        return this;
    }
    public withIsOptional(isOptional: boolean) {
        this.isOptional = isOptional;
        return this;
    }
    public build() {
        return new FunctionParameter(this.name, this.isOptional);
    }
}
