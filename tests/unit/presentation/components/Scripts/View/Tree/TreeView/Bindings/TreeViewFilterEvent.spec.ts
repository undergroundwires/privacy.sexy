import { describe, it, expect } from 'vitest';
import {
  TreeViewFilterAction, type TreeViewFilterPredicate,
  createFilterRemovedEvent, createFilterTriggeredEvent,
} from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputFilterEvent';

describe('TreeViewFilterEvent', () => {
  describe('createFilterTriggeredEvent', () => {
    it('returns expected action', () => {
      // arrange
      const expectedAction = TreeViewFilterAction.Triggered;
      // act
      const event = createFilterTriggeredEvent(createPredicateStub());
      // expect
      expect(event.action).to.equal(expectedAction);
    });
    it('returns expected predicate', () => {
      // arrange
      const expectedPredicate = createPredicateStub();
      // act
      const event = createFilterTriggeredEvent(expectedPredicate);
      // assert
      expect(event.predicate).to.equal(expectedPredicate);
    });
  });

  describe('createFilterRemovedEvent', () => {
    it('returns expected action', () => {
      // arrange
      const expectedAction = TreeViewFilterAction.Removed;
      // act
      const event = createFilterRemovedEvent();
      // expect
      expect(event.action).to.equal(expectedAction);
    });
  });
});

function createPredicateStub(): TreeViewFilterPredicate {
  return () => true;
}
