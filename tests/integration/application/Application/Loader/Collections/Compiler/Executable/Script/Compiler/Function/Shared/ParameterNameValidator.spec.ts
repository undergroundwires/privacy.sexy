import { describe, it, expect } from 'vitest';
import { validateParameterName } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Shared/ParameterNameValidator';

describe('ParameterNameValidator', () => {
  describe('accepts when valid', () => {
    // arrange
    const validValues: readonly string[] = [
      'lowercase',
      'onlyLetters',
      'l3tt3rsW1thNumb3rs',
    ];
    validValues.forEach((validValue) => {
      it(validValue, () => {
        // act
        const act = () => validateParameterName(validValue);
        // assert
        expect(act).to.not.throw();
      });
    });
  });
  describe('throws if invalid', () => {
    // arrange
    const testScenarios: readonly {
      readonly description: string;
      readonly value: string;
    }[] = [
      {
        description: 'empty name',
        value: '',
      },
      {
        description: 'has @',
        value: 'b@d',
      },
      {
        description: 'has {',
        value: 'b{a}d',
      },
    ];
    testScenarios.forEach((
      { description, value },
    ) => {
      it(description, () => {
        // act
        const act = () => validateParameterName(value);
        // assert
        expect(act).to.throw();
      });
    });
  });
});
