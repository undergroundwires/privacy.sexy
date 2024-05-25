import { describe, it, expect } from 'vitest';
import { FunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameterCollection';
import { FunctionParameterStub } from '@tests/unit/shared/Stubs/FunctionParameterStub';

describe('FunctionParameterCollection', () => {
  it('all returns added parameters as expected', () => {
    // arrange
    const expected = [
      new FunctionParameterStub().withName('1'),
      new FunctionParameterStub().withName('2').withOptional(true),
      new FunctionParameterStub().withName('3').withOptional(false),
    ];
    const sut = new FunctionParameterCollection();
    for (const parameter of expected) {
      sut.addParameter(parameter);
    }
    // act
    const actual = sut.all;
    // assert
    expect(expected).to.deep.equal(actual);
  });
  it('throws when function parameters have same names', () => {
    // arrange
    const parameterName = 'duplicate-parameter';
    const expectedError = `duplicate parameter name: "${parameterName}"`;
    const sut = new FunctionParameterCollection();
    sut.addParameter(new FunctionParameterStub().withName(parameterName));
    // act
    const act = () => sut.addParameter(
      new FunctionParameterStub().withName(parameterName),
    );
    // assert
    expect(act).to.throw(expectedError);
  });
});
