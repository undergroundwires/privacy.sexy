import { describe, it, expect } from 'vitest';
import { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';
import { useCurrentCode } from '@/presentation/components/Shared/Hooks/UseCurrentCode';
import { ApplicationCodeStub } from '@tests/unit/shared/Stubs/ApplicationCodeStub';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { EventSubscriptionCollectionStub } from '@tests/unit/shared/Stubs/EventSubscriptionCollectionStub';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { CodeChangedEventStub } from '@tests/unit/shared/Stubs/CodeChangedEventStub';

describe('useCurrentCode', () => {
  describe('currentCode', () => {
    it('gets code from initial state', () => {
      // arrange
      const expectedCode = 'initial code';
      const { codeStub, collectionStateStub } = createStubs();
      codeStub.withCurrentCode(expectedCode);
      const useCollectionStateStub = new UseCollectionStateStub();
      const { currentCode } = new UseCurrentCodeBuilder()
        .withUseCollectionState(useCollectionStateStub)
        .build();
      // act
      useCollectionStateStub.triggerOnStateChange({
        newState: collectionStateStub,
        immediateOnly: true, // set initial state
      });
      // assert
      const actualCode = currentCode.value;
      expect(actualCode).to.equal(expectedCode);
    });
    it('updates code state code is changed', () => {
      // arrange
      const initialCode = 'initial code';
      const expectedCode = 'changed code';
      const {
        codeStub: initialCodeStub,
        collectionStateStub: initialCollectionStateStub,
      } = createStubs();
      initialCodeStub.withCurrentCode(initialCode);
      const useCollectionStateStub = new UseCollectionStateStub();
      const { currentCode } = new UseCurrentCodeBuilder()
        .withUseCollectionState(useCollectionStateStub)
        .build();
      useCollectionStateStub.triggerOnStateChange({
        newState: initialCollectionStateStub,
        immediateOnly: true, // set initial state
      });
      const {
        codeStub: changedCodeStub,
        collectionStateStub: changedStateStub,
      } = createStubs();
      changedCodeStub.withCurrentCode(expectedCode);
      // act
      useCollectionStateStub.triggerOnStateChange({
        newState: changedStateStub,
        immediateOnly: true, // update state
      });
      // assert
      const actualCode = currentCode.value;
      expect(actualCode).to.equal(expectedCode);
    });
    it('updates code when code is changed', () => {
      // arrange
      const expectedCode = 'changed code';
      const { codeStub, collectionStateStub } = createStubs();
      const { currentCode } = new UseCurrentCodeBuilder()
        .withCollectionState(collectionStateStub)
        .build();
      // act
      codeStub.triggerCodeChange(new CodeChangedEventStub().withCode(expectedCode));
      // assert
      const actualCode = currentCode.value;
      expect(expectedCode).to.equal(actualCode);
    });
    it('registers event subscription on creation', () => {
      // arrange
      const eventsStub = new EventSubscriptionCollectionStub();
      const stateStub = new UseCollectionStateStub();
      // act
      new UseCurrentCodeBuilder()
        .withUseCollectionState(stateStub)
        .withEvents(eventsStub)
        .build();
      // assert
      const calls = eventsStub.callHistory;
      expect(calls).has.lengthOf(1);
      const call = calls.find((c) => c.methodName === 'unsubscribeAllAndRegister');
      expect(call).toBeDefined();
    });
  });
});

function createStubs() {
  const codeStub = new ApplicationCodeStub();
  const collectionStateStub = new CategoryCollectionStateStub().withCode(codeStub);
  const useStateStub = new UseCollectionStateStub()
    .withState(collectionStateStub);
  return {
    codeStub,
    useStateStub,
    collectionStateStub,
  };
}

class UseCurrentCodeBuilder {
  private useCollectionState: UseCollectionStateStub = new UseCollectionStateStub();

  private events: IEventSubscriptionCollection = new EventSubscriptionCollectionStub();

  public withUseCollectionState(useCollectionState: UseCollectionStateStub): this {
    this.useCollectionState = useCollectionState;
    return this;
  }

  public withCollectionState(collectionState: CategoryCollectionStateStub): this {
    return this.withUseCollectionState(
      this.useCollectionState.withState(collectionState),
    );
  }

  public withEvents(events: IEventSubscriptionCollection): this {
    this.events = events;
    return this;
  }

  public build(): ReturnType<typeof useCurrentCode> {
    return useCurrentCode(this.useCollectionState.get(), this.events);
  }
}
