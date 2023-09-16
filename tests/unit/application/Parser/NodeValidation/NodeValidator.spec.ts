import { describe, it, expect } from 'vitest';
import { NodeDataError } from '@/application/Parser/NodeValidation/NodeDataError';
import { NodeValidator } from '@/application/Parser/NodeValidation/NodeValidator';
import { expectDeepThrowsError } from '@tests/unit/shared/Assertions/ExpectDeepThrowsError';
import { CategoryDataStub } from '@tests/unit/shared/Stubs/CategoryDataStub';
import { NodeDataErrorContextStub } from '@tests/unit/shared/Stubs/NodeDataErrorContextStub';
import { NodeData } from '@/application/Parser/NodeValidation/NodeData';
import { NodeValidationTestRunner } from './NodeValidatorTestRunner';

describe('NodeValidator', () => {
  describe('assertValidName', () => {
    describe('throws if invalid', () => {
      // arrange
      const context = new NodeDataErrorContextStub();
      const sut = new NodeValidator(context);
      // act
      const act = (invalidName: string) => sut.assertValidName(invalidName);
      // assert
      new NodeValidationTestRunner()
        .testInvalidNodeName((invalidName) => ({
          act: () => act(invalidName),
          expectedContext: context,
        }));
    });
    it('does not throw if valid', () => {
      // arrange
      const validName = 'validName';
      const sut = new NodeValidator(new NodeDataErrorContextStub());
      // act
      const act = () => sut.assertValidName(validName);
      // assert
      expect(act).to.not.throw();
    });
  });
  describe('assertDefined', () => {
    describe('throws if missing', () => {
      // arrange
      const context = new NodeDataErrorContextStub();
      const sut = new NodeValidator(context);
      // act
      const act = (undefinedNode: NodeData) => sut.assertDefined(undefinedNode);
      // assert
      new NodeValidationTestRunner()
        .testMissingNodeData((invalidName) => ({
          act: () => act(invalidName),
          expectedContext: context,
        }));
    });
    it('does not throw if defined', () => {
      // arrange
      const definedNode = mockNode();
      const sut = new NodeValidator(new NodeDataErrorContextStub());
      // act
      const act = () => sut.assertDefined(definedNode);
      // assert
      expect(act).to.not.throw();
    });
  });
  describe('assert', () => {
    it('throws expected error if condition is false', () => {
      // arrange
      const message = 'error';
      const falsePredicate = () => false;
      const context = new NodeDataErrorContextStub();
      const expected = new NodeDataError(message, context);
      const sut = new NodeValidator(context);
      // act
      const act = () => sut.assert(falsePredicate, message);
      // assert
      expectDeepThrowsError(act, expected);
    });
    it('does not throw if condition is true', () => {
      // arrange
      const truePredicate = () => true;
      const sut = new NodeValidator(new NodeDataErrorContextStub());
      // act
      const act = () => sut.assert(truePredicate, 'ignored error');
      // assert
      expect(act).to.not.throw();
    });
  });
  describe('throw', () => {
    it('throws expected error', () => {
      // arrange
      const message = 'error';
      const context = new NodeDataErrorContextStub();
      const expected = new NodeDataError(message, context);
      const sut = new NodeValidator(context);
      // act
      const act = () => sut.throw(message);
      // assert
      expectDeepThrowsError(act, expected);
    });
  });
});

function mockNode() {
  return new CategoryDataStub();
}
