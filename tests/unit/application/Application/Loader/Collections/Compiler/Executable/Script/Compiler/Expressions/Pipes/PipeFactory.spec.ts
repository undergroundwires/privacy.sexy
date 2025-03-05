import { describe, it, expect } from 'vitest';
import { PipeFactory } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Pipes/PipeFactory';
import { PipeStub } from '@tests/unit/shared/Stubs/PipeStub';
import { getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import type { Pipe } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Pipes/Pipe';

describe('PipeFactory', () => {
  describe('ctor', () => {
    it('throws when instances with same name is registered', () => {
      // arrange
      const duplicateName = 'duplicateName';
      const expectedError = `Pipe name must be unique: "${duplicateName}"`;
      const pipes = [
        new PipeStub().withName(duplicateName),
        new PipeStub().withName('uniqueName'),
        new PipeStub().withName(duplicateName),
      ];
      // act
      const act = () => new PipeFactory(pipes);
      // expect
      expect(act).to.throw(expectedError);
    });
    describe('throws when name is invalid', () => {
      // act
      const act = (invalidName: string) => new PipeFactory([new PipeStub().withName(invalidName)]);
      // assert
      testPipeNameValidation(act);
    });
  });
  describe('get', () => {
    describe('throws when name is invalid', () => {
      // arrange
      const sut = new PipeFactory();
      // act
      const act = (invalidName: string) => sut.get(invalidName);
      // assert
      testPipeNameValidation(act);
    });
    it('gets registered instance when it exists', () => {
      // arrange
      const expected = new PipeStub().withName('expectedName');
      const pipes = [expected, new PipeStub().withName('instanceToConfuse')];
      const sut = new PipeFactory(pipes);
      // act
      const actual = sut.get(expected.name);
      // expect
      expect(actual).to.equal(expected);
    });
    it('throws when instance does not exist', () => {
      // arrange
      const missingName = 'missingName';
      const expectedError = `Unknown pipe: "${missingName}"`;
      const pipes: readonly Pipe[] = [];
      const sut = new PipeFactory(pipes);
      // act
      const act = () => sut.get(missingName);
      // expect
      expect(act).to.throw(expectedError);
    });
  });
});

function testPipeNameValidation(testRunner: (invalidName: string) => void) {
  const testCases = [
    // Validate missing value
    ...getAbsentStringTestCases({ excludeNull: true, excludeUndefined: true })
      .map((testCase) => ({
        name: `empty pipe name (${testCase.valueName})`,
        value: testCase.absentValue,
        expectedError: 'empty pipe name',
      })),
    // Validate camelCase
    ...[
      'PascalCase',
      'snake-case',
      'includesNumb3rs',
      'includes Whitespace',
      'noSpec\'ial',
    ].map((nonCamelCaseValue) => ({
      name: `non camel case value (${nonCamelCaseValue})`,
      value: nonCamelCaseValue,
      expectedError: `Pipe name should be camelCase: "${nonCamelCaseValue}"`,
    })),
  ];
  for (const testCase of testCases) {
    it(testCase.name, () => {
      // arrange
      const invalidName = testCase.value;
      const { expectedError } = testCase;
      // act
      const act = () => testRunner(invalidName);
      // expect
      expect(act).to.throw(expectedError);
    });
  }
}
