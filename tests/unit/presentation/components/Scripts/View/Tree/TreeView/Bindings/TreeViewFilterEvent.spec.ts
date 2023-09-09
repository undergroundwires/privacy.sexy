import { describe, it, expect } from 'vitest';
import {
  TreeViewFilterAction, TreeViewFilterEvent, TreeViewFilterPredicate,
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
    describe('returns expected predicate', () => {
      const testCases: ReadonlyArray<{
        readonly name: string,
        readonly givenPredicate: TreeViewFilterPredicate,
      }> = [
        {
          name: 'given a real predicate',
          givenPredicate: createPredicateStub(),
        },
        {
          name: 'given undefined predicate',
          givenPredicate: undefined,
        },
      ];
      testCases.forEach(({ name, givenPredicate }) => {
        it(name, () => {
          // arrange
          const expectedPredicate = givenPredicate;
          // act
          const event = createFilterTriggeredEvent(expectedPredicate);
          // assert
          expect(event.predicate).to.equal(expectedPredicate);
        });
      });
    });
    it('returns event even without predicate', () => {
      // act
      const predicate = null as TreeViewFilterPredicate;
      // assert
      const event = createFilterTriggeredEvent(predicate);
      // expect
      expect(event.predicate).to.equal(predicate);
    });
    it('returns unique timestamp', () => {
      // arrange
      const instances = new Array<TreeViewFilterEvent>();
      // act
      instances.push(
        createFilterTriggeredEvent(createPredicateStub()),
        createFilterTriggeredEvent(createPredicateStub()),
        createFilterTriggeredEvent(createPredicateStub()),
      );
      // assert
      const uniqueDates = new Set(instances.map((instance) => instance.timestamp));
      expect(uniqueDates).to.have.length(instances.length);
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
    it('returns without predicate', () => {
      // arrange
      const expected = undefined;
      // act
      const event = createFilterRemovedEvent();
      // assert
      expect(event.predicate).to.equal(expected);
    });
    it('returns unique timestamp', () => {
      // arrange
      const instances = new Array<TreeViewFilterEvent>();
      // act
      instances.push(
        createFilterRemovedEvent(),
        createFilterRemovedEvent(),
        createFilterRemovedEvent(),
      );
      // assert
      const uniqueDates = new Set(instances.map((instance) => instance.timestamp));
      expect(uniqueDates).to.have.length(instances.length);
    });
  });
});

function createPredicateStub(): TreeViewFilterPredicate {
  return () => true;
}
