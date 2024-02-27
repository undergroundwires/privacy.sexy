import { describe, it, expect } from 'vitest';
import { nextTick, watch } from 'vue';
import { type SelectionModifier, useUserSelectionState } from '@/presentation/components/Shared/Hooks/UseUserSelectionState';
import type { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { UseAutoUnsubscribedEventsStub } from '@tests/unit/shared/Stubs/UseAutoUnsubscribedEventsStub';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';

describe('useUserSelectionState', () => {
  describe('currentSelection', () => {
    it('initializes with correct selection', () => {
      // arrange
      const expectedSelection = new UserSelectionStub();
      const collectionStateStub = new UseCollectionStateStub()
        .withState(new CategoryCollectionStateStub().withSelection(expectedSelection));
      // act
      const { returnObject } = runHook({
        useCollectionState: collectionStateStub,
      });
      // assert
      const actualSelection = returnObject.currentSelection.value;
      expect(actualSelection).to.equal(expectedSelection);
    });
    describe('once collection state is changed', () => {
      it('updated', () => {
        // arrange
        const initialSelection = new UserSelectionStub();
        const changedSelection = new UserSelectionStub();
        const collectionStateStub = new UseCollectionStateStub()
          .withState(new CategoryCollectionStateStub().withSelection(initialSelection));
        const { returnObject } = runHook({
          useCollectionState: collectionStateStub,
        });
        // act
        collectionStateStub.triggerOnStateChange({
          newState: new CategoryCollectionStateStub().withSelection(changedSelection),
          immediateOnly: false,
        });
        // assert
        const actualSelection = returnObject.currentSelection.value;
        expect(actualSelection).to.equal(changedSelection);
      });
      it('not updated when old state changes', async () => {
        // arrange
        const oldScriptSelection = new ScriptSelectionStub();
        const oldSelectionState = new UserSelectionStub().withScripts(oldScriptSelection);
        const newSelectionState = new UserSelectionStub();
        const collectionStateStub = new UseCollectionStateStub()
          .withState(new CategoryCollectionStateStub().withSelection(oldSelectionState));
        const { returnObject } = runHook({
          useCollectionState: collectionStateStub,
        });
        collectionStateStub.triggerOnStateChange({
          newState: new CategoryCollectionStateStub().withSelection(newSelectionState),
          immediateOnly: false,
        });
        let totalUpdates = 0;
        watch(returnObject.currentSelection, () => {
          totalUpdates++;
        });
        // act
        oldScriptSelection.triggerSelectionChangedEvent([
          new SelectedScriptStub(new ScriptStub('newInOldState')),
        ]);
        await nextTick();
        // assert
        expect(totalUpdates).to.equal(0);
      });
      describe('triggers change', () => {
        it('with new selection reference', async () => {
          // arrange
          const oldSelection = new UserSelectionStub();
          const newSelection = new UserSelectionStub();
          const initialCollectionState = new CategoryCollectionStateStub()
            .withSelection(oldSelection);
          const changedCollectionState = new CategoryCollectionStateStub()
            .withSelection(newSelection);
          const collectionStateStub = new UseCollectionStateStub()
            .withState(initialCollectionState);
          const { returnObject } = runHook({ useCollectionState: collectionStateStub });
          let isChangeTriggered = false;
          watch(returnObject.currentSelection, () => {
            isChangeTriggered = true;
          });
          // act
          collectionStateStub.triggerOnStateChange({
            newState: changedCollectionState,
            immediateOnly: false,
          });
          await nextTick();
          // assert
          expect(isChangeTriggered).to.equal(true);
        });
        it('with the same selection reference', async () => {
          // arrange
          const userSelection = new UserSelectionStub();
          const initialCollectionState = new CategoryCollectionStateStub()
            .withSelection(userSelection);
          const changedCollectionState = new CategoryCollectionStateStub()
            .withSelection(userSelection);
          const collectionStateStub = new UseCollectionStateStub()
            .withState(initialCollectionState);
          const { returnObject } = runHook({ useCollectionState: collectionStateStub });
          let isChangeTriggered = false;
          watch(returnObject.currentSelection, () => {
            isChangeTriggered = true;
          });
          // act
          collectionStateStub.triggerOnStateChange({
            newState: changedCollectionState,
            immediateOnly: false,
          });
          await nextTick();
          // assert
          expect(isChangeTriggered).to.equal(true);
        });
      });
    });
    describe('once selection state is changed', () => {
      it('updated with same collection state', async () => {
        // arrange
        const initialScripts = [
          new SelectedScriptStub(new ScriptStub('initialSelectedScript')),
        ];
        const changedScripts = [
          new SelectedScriptStub(new ScriptStub('changedSelectedScript')),
        ];
        const scriptSelectionStub = new ScriptSelectionStub()
          .withSelectedScripts(initialScripts);
        const expectedSelectionState = new UserSelectionStub().withScripts(scriptSelectionStub);
        const collectionState = new CategoryCollectionStateStub()
          .withSelection(expectedSelectionState);
        const collectionStateStub = new UseCollectionStateStub().withState(collectionState);
        const { returnObject } = runHook({
          useCollectionState: collectionStateStub,
        });
        // act
        scriptSelectionStub.triggerSelectionChangedEvent(changedScripts);
        await nextTick();
        // assert
        const actualSelection = returnObject.currentSelection.value;
        expect(actualSelection).to.equal(expectedSelectionState);
      });
      it('updated once collection state is changed', async () => {
        // arrange
        const changedScripts = [
          new SelectedScriptStub(new ScriptStub('changedSelectedScript')),
        ];
        const scriptSelectionStub = new ScriptSelectionStub();
        const newSelectionState = new UserSelectionStub().withScripts(scriptSelectionStub);
        const initialCollectionState = new CategoryCollectionStateStub().withSelectedScripts([
          new SelectedScriptStub(new ScriptStub('initialSelectedScriptInInitialCollection')),
        ]);
        const collectionStateStub = new UseCollectionStateStub().withState(initialCollectionState);
        const { returnObject } = runHook({ useCollectionState: collectionStateStub });
        // act
        collectionStateStub.triggerOnStateChange({
          newState: new CategoryCollectionStateStub().withSelection(newSelectionState),
          immediateOnly: false,
        });
        scriptSelectionStub.triggerSelectionChangedEvent(changedScripts);
        // assert
        const actualSelection = returnObject.currentSelection.value;
        expect(actualSelection).to.equal(newSelectionState);
      });
      describe('triggers change', () => {
        it('with new selected scripts array reference', async () => {
          // arrange
          const oldSelectedScriptsArrayReference = [];
          const newSelectedScriptsArrayReference = [];
          const scriptSelectionStub = new ScriptSelectionStub()
            .withSelectedScripts(oldSelectedScriptsArrayReference);
          const collectionStateStub = new UseCollectionStateStub()
            .withState(new CategoryCollectionStateStub().withSelection(
              new UserSelectionStub().withScripts(scriptSelectionStub),
            ));
          const { returnObject } = runHook({ useCollectionState: collectionStateStub });
          let isChangeTriggered = false;
          watch(returnObject.currentSelection, () => {
            isChangeTriggered = true;
          });
          // act
          scriptSelectionStub.triggerSelectionChangedEvent(newSelectedScriptsArrayReference);
          await nextTick();
          // assert
          expect(isChangeTriggered).to.equal(true);
        });
        it('with same selected scripts array reference', async () => {
          // arrange
          const sharedSelectedScriptsReference = [];
          const scriptSelectionStub = new ScriptSelectionStub()
            .withSelectedScripts(sharedSelectedScriptsReference);
          const collectionStateStub = new UseCollectionStateStub()
            .withState(new CategoryCollectionStateStub().withSelection(
              new UserSelectionStub().withScripts(scriptSelectionStub),
            ));
          const { returnObject } = runHook({ useCollectionState: collectionStateStub });
          let isChangeTriggered = false;
          watch(returnObject.currentSelection, () => {
            isChangeTriggered = true;
          });
          // act
          scriptSelectionStub.triggerSelectionChangedEvent(sharedSelectedScriptsReference);
          await nextTick();
          // assert
          expect(isChangeTriggered).to.equal(true);
        });
      });
    });
  });
  describe('modifyCurrentSelection', () => {
    it('should modify current state', () => {
      // arrange
      const { returnObject, collectionStateStub } = runHook();
      const expectedSelection = collectionStateStub.state.selection;
      let mutatedSelection: UserSelection | undefined;
      const mutator: SelectionModifier = (selection) => {
        mutatedSelection = selection;
      };
      // act
      returnObject.modifyCurrentSelection(mutator);
      // assert
      expect(collectionStateStub.isStateModified()).to.equal(true);
      expect(mutatedSelection).to.equal(expectedSelection);
    });
    it('new state is modified once collection state is changed', async () => {
      // arrange
      const { returnObject, collectionStateStub } = runHook();
      const expectedSelection = new UserSelectionStub();
      const newCollectionState = new CategoryCollectionStateStub()
        .withSelection(expectedSelection);
      let mutatedSelection: UserSelection | undefined;
      const mutator: SelectionModifier = (selection) => {
        mutatedSelection = selection;
      };
      // act
      collectionStateStub.triggerOnStateChange({
        newState: newCollectionState,
        immediateOnly: false,
      });
      await nextTick();
      returnObject.modifyCurrentSelection(mutator);
      // assert
      expect(collectionStateStub.isStateModified()).to.equal(true);
      expect(mutatedSelection).to.equal(expectedSelection);
    });
    it('old state is not modified once collection state is changed', async () => {
      // arrange
      const oldState = new CategoryCollectionStateStub().withSelectedScripts([
        new SelectedScriptStub(new ScriptStub('scriptFromOldState')),
      ]);
      const collectionStateStub = new UseCollectionStateStub()
        .withState(oldState);
      const { returnObject } = runHook({ useCollectionState: collectionStateStub });
      const expectedSelection = new UserSelectionStub();
      const newCollectionState = new CategoryCollectionStateStub()
        .withSelection(expectedSelection);
      let totalMutations = 0;
      const mutator: SelectionModifier = () => {
        totalMutations++;
      };
      // act
      collectionStateStub.triggerOnStateChange({
        newState: newCollectionState,
        immediateOnly: false,
      });
      await nextTick();
      returnObject.modifyCurrentSelection(mutator);
      // assert
      expect(totalMutations).to.equal(1);
    });
  });
});

function runHook(scenario?: {
  useCollectionState?: UseCollectionStateStub,
}) {
  const collectionStateStub = scenario?.useCollectionState ?? new UseCollectionStateStub();
  const eventsStub = new UseAutoUnsubscribedEventsStub();
  const returnObject = useUserSelectionState(
    collectionStateStub.get(),
    eventsStub.get(),
  );
  return {
    returnObject,
    collectionStateStub,
    eventsStub,
  };
}
