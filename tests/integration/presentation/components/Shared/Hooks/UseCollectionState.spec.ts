import 'mocha';
import { expect } from 'chai';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { IReadOnlyApplicationContext } from '@/application/Context/IApplicationContext';

describe('UseCollectionState', () => {
  describe('currentContext', () => {
    it('multiple calls get the same instance', () => {
      // act
      const firstContext = useCollectionState().currentContext;
      const secondContext = useCollectionState().currentContext;
      // assert
      expect(firstContext).to.equal(secondContext);
    });
  });

  describe('currentState', () => {
    it('returns current collection state', () => {
      // arrange
      const { currentContext } = useCollectionState();
      const expectedState = currentContext.state;

      // act
      const { currentState } = useCollectionState();
      const actualState = currentState.value;

      // assert
      expect(expectedState).to.equal(actualState);
    });
    it('returns changed collection state', () => {
      // arrange
      const { currentContext, currentState, modifyCurrentContext } = useCollectionState();
      const newOs = pickNonCurrentOs(currentContext);

      // act
      modifyCurrentContext((context) => {
        context.changeContext(newOs);
      });
      const expectedState = currentContext.state;

      // assert
      expect(currentState.value).to.equal(expectedState);
    });
  });

  describe('modifyCurrentContext', () => {
    it('modifies the current context', () => {
      // arrange
      const { currentContext, currentState, modifyCurrentContext } = useCollectionState();
      const expectedOs = pickNonCurrentOs(currentContext);

      // act
      modifyCurrentContext((context) => {
        context.changeContext(expectedOs);
      });

      // assert
      expect(currentContext.state.os).to.equal(expectedOs);
      expect(currentState.value.os).to.equal(expectedOs);
    });
  });

  describe('modifyCurrentState', () => {
    it('modifies the current state', () => {
      // arrange
      const { currentState, modifyCurrentState } = useCollectionState();
      const expectedFilter = 'expected-filter';

      // act
      modifyCurrentState((state) => {
        state.filter.setFilter(expectedFilter);
      });

      // assert
      const actualFilter = currentState.value.filter.currentFilter.query;
      expect(actualFilter).to.equal(expectedFilter);
    });
  });
});

function pickNonCurrentOs(context: IReadOnlyApplicationContext) {
  return context.app.getSupportedOsList().find((os) => os !== context.state.os);
}
