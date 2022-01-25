import 'mocha';
import { expect } from 'chai';
import { FunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameterCollection';
import { FunctionParameterStub } from '@tests/unit/shared/Stubs/FunctionParameterStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('FunctionParameterCollection', () => {
  it('all returns added parameters as expected', () => {
    // arrange
    const expected = [
      new FunctionParameterStub().withName('1'),
      new FunctionParameterStub().withName('2').withOptionality(true),
      new FunctionParameterStub().withName('3').withOptionality(false),
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
  describe('addParameter', () => {
    describe('throws if parameter is undefined', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing parameter';
        const value = absentValue;
        const sut = new FunctionParameterCollection();
        // act
        const act = () => sut.addParameter(value);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
});
