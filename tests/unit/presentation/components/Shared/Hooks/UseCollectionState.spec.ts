import 'mocha';
import { expect } from 'chai';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { ApplicationContextStub } from '@tests/unit/shared/Stubs/ApplicationContextStub';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ApplicationContextChangedEventStub } from '@tests/unit/shared/Stubs/ApplicationContextChangedEventStub';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('UseCollectionState', () => {
  describe('currentContext', () => {
    it('returns current context', () => {
      // arrange
      const expected = new ApplicationContextStub();

      // act
      const { currentContext } = useCollectionState(expected);

      // assert
      expect(currentContext).to.equal(expected);
    });
  });

  describe('currentState', () => {
    it('returns current collection state', () => {
      // arrange
      const expected = new CategoryCollectionStateStub();
      const context = new ApplicationContextStub()
        .withState(expected);

      // act
      const { currentState } = useCollectionState(context);

      // assert
      expect(currentState.value).to.equal(expected);
    });
    it('returns changed collection state', () => {
      // arrange
      const newState = new CategoryCollectionStateStub();
      const context = new ApplicationContextStub();
      const { currentState } = useCollectionState(context);

      // act
      context.dispatchContextChange(
        new ApplicationContextChangedEventStub().withNewState(newState),
      );

      // assert
      expect(currentState.value).to.equal(newState);
    });
  });

  describe('onStateChange', () => {
    describe('throws when callback is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing state handler';
        const context = new ApplicationContextStub();
        const { onStateChange } = useCollectionState(context);
        // act
        const act = () => onStateChange(absentValue);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('call handler when context state changes', () => {
      // arrange
      const expected = true;
      const context = new ApplicationContextStub();
      const { onStateChange } = useCollectionState(context);
      let wasCalled = false;

      // act
      onStateChange(() => {
        wasCalled = true;
      });
      context.dispatchContextChange();

      // assert
      expect(wasCalled).to.equal(expected);
    });
    it('call handler immediately when immediate is true', () => {
      // arrange
      const expected = true;
      const context = new ApplicationContextStub();
      const { onStateChange } = useCollectionState(context);
      let wasCalled = false;

      // act
      onStateChange(() => {
        wasCalled = true;
      }, { immediate: true });

      // assert
      expect(wasCalled).to.equal(expected);
    });
    it('does not call handler immediately when immediate is false', () => {
      // arrange
      const expected = false;
      const context = new ApplicationContextStub();
      const { onStateChange } = useCollectionState(context);
      let wasCalled = false;

      // act
      onStateChange(() => {
        wasCalled = true;
      }, { immediate: false });

      // assert
      expect(wasCalled).to.equal(expected);
    });
    it('call multiple handlers when context state changes', () => {
      // arrange
      const expected = 5;
      const context = new ApplicationContextStub();
      const { onStateChange } = useCollectionState(context);
      let totalCalled = 0;

      // act
      onStateChange(() => {
        totalCalled++;
      }, { immediate: false });
      for (let i = 0; i < expected; i++) {
        context.dispatchContextChange();
      }

      // assert
      expect(totalCalled).to.equal(expected);
    });
    it('call handler with new state after state changes', () => {
      // arrange
      const expected = new CategoryCollectionStateStub();
      let actual: IReadOnlyCategoryCollectionState;
      const context = new ApplicationContextStub();
      const { onStateChange } = useCollectionState(context);

      // act
      onStateChange((newState) => {
        actual = newState;
      });
      context.dispatchContextChange(
        new ApplicationContextChangedEventStub().withNewState(expected),
      );

      // assert
      expect(actual).to.equal(expected);
    });
    it('call handler with old state after state changes', () => {
      // arrange
      const expected = new CategoryCollectionStateStub();
      let actual: IReadOnlyCategoryCollectionState;
      const context = new ApplicationContextStub();
      const { onStateChange } = useCollectionState(context);

      // act
      onStateChange((_, oldState) => {
        actual = oldState;
      });
      context.dispatchContextChange(
        new ApplicationContextChangedEventStub().withOldState(expected),
      );

      // assert
      expect(actual).to.equal(expected);
    });
  });

  describe('modifyCurrentState', () => {
    describe('throws when callback is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing state mutator';
        const context = new ApplicationContextStub();
        const { modifyCurrentState } = useCollectionState(context);
        // act
        const act = () => modifyCurrentState(absentValue);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('modifies current collection state', () => {
      // arrange
      const oldOs = OperatingSystem.Windows;
      const newOs = OperatingSystem.Linux;
      const state = new CategoryCollectionStateStub()
        .withOs(oldOs);
      const context = new ApplicationContextStub()
        .withState(state);
      const { modifyCurrentState } = useCollectionState(context);

      // act
      modifyCurrentState((mutableState) => {
        const stubState = (mutableState as CategoryCollectionStateStub);
        stubState.withOs(newOs);
      });
      const actualOs = context.state.collection.os;

      // assert
      expect(actualOs).to.equal(newOs);
    });
  });

  describe('modifyCurrentContext', () => {
    describe('throws when callback is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing context mutator';
        const context = new ApplicationContextStub();
        const { modifyCurrentContext } = useCollectionState(context);
        // act
        const act = () => modifyCurrentContext(absentValue);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('modifies the current context', () => {
      // arrange
      const oldState = new CategoryCollectionStateStub()
        .withOs(OperatingSystem.Linux);
      const newState = new CategoryCollectionStateStub()
        .withOs(OperatingSystem.macOS);
      const context = new ApplicationContextStub()
        .withState(oldState);
      const { modifyCurrentContext } = useCollectionState(context);

      // act
      modifyCurrentContext((mutableContext) => {
        const contextStub = mutableContext as ApplicationContextStub;
        contextStub.withState(newState);
      });
      const actualState = context.state;

      // assert
      expect(actualState).to.equal(newState);
    });
  });
});
