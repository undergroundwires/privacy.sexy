import { describe, it, expect } from 'vitest';
import { FilterChange } from '@/application/Context/State/Filter/Event/FilterChange';
import { FilterResultStub } from '@tests/unit/shared/Stubs/FilterResultStub';
import { FilterActionType } from '@/application/Context/State/Filter/Event/FilterActionType';
import { FilterChangeDetailsVisitorStub } from '@tests/unit/shared/Stubs/FilterChangeDetailsVisitorStub';
import { ApplyFilterAction } from '@/application/Context/State/Filter/Event/FilterChangeDetails';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('FilterChange', () => {
  describe('forApply', () => {
    it('sets filter result', () => {
      // arrange
      const expectedFilter = new FilterResultStub();
      // act
      const sut = FilterChange.forApply(expectedFilter);
      // assert
      const actualFilter = (sut.action as ApplyFilterAction).filter;
      expect(actualFilter).to.equal(expectedFilter);
    });
    it('sets action as expected', () => {
      // arrange
      const expectedAction = FilterActionType.Apply;
      // act
      const sut = FilterChange.forApply(new FilterResultStub());
      // assert
      const actualAction = sut.action.type;
      expect(actualAction).to.equal(expectedAction);
    });
  });
  describe('forClear', () => {
    it('does not set filter result', () => {
      // arrange
      const expectedFilter = undefined;
      // act
      const sut = FilterChange.forClear();
      // assert
      const actualFilter = (sut.action as ApplyFilterAction).filter;
      expect(actualFilter).to.equal(expectedFilter);
    });
    it('sets action as expected', () => {
      // arrange
      const expectedAction = FilterActionType.Clear;
      // act
      const sut = FilterChange.forClear();
      // assert
      const actualAction = sut.action.type;
      expect(actualAction).to.equal(expectedAction);
    });
  });
  describe('visit', () => {
    describe('onClear', () => {
      it('visits once', () => {
        // arrange
        const sut = FilterChange.forClear();
        const visitor = new FilterChangeDetailsVisitorStub();
        // act
        sut.visit(visitor);
        // assert
        expect(visitor.callHistory).to.have.lengthOf(1);
      });

      it('visits onClear', () => {
        // arrange
        const sut = FilterChange.forClear();
        const visitor = new FilterChangeDetailsVisitorStub();
        // act
        sut.visit(visitor);
        // assert
        const call = visitor.callHistory.find((c) => c.methodName === 'onClear');
        expect(call).toBeDefined();
      });
    });
    describe('onApply', () => {
      it('visits once', () => {
        // arrange
        const sut = FilterChange.forApply(new FilterResultStub());
        const visitor = new FilterChangeDetailsVisitorStub();
        // act
        sut.visit(visitor);
        // assert
        expect(visitor.callHistory).to.have.lengthOf(1);
      });

      it('visits onApply', () => {
        // arrange
        const sut = FilterChange.forApply(new FilterResultStub());
        const visitor = new FilterChangeDetailsVisitorStub();
        // act
        sut.visit(visitor);
        // assert
        const call = visitor.callHistory.find((c) => c.methodName === 'onApply');
        expect(call).toBeDefined();
      });

      it('visits with expected filter', () => {
        // arrange
        const expectedFilter = new FilterResultStub();
        const sut = FilterChange.forApply(expectedFilter);
        const visitor = new FilterChangeDetailsVisitorStub();
        // act
        sut.visit(visitor);
        // assert
        const call = visitor.callHistory.find((c) => c.methodName === 'onApply');
        expectExists(call);
        const [actualFilter] = call.args;
        expect(actualFilter).to.equal(expectedFilter);
      });
    });
  });
});
