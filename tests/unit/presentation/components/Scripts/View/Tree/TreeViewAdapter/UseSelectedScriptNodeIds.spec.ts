import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick, watch } from 'vue';
import { useSelectedScriptNodeIds } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/UseSelectedScriptNodeIds';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { UseAutoUnsubscribedEventsStub } from '@tests/unit/shared/Stubs/UseAutoUnsubscribedEventsStub';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { getScriptNodeId } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/CategoryNodeMetadataConverter';
import { IScript } from '@/domain/IScript';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';

describe('useSelectedScriptNodeIds', () => {
  it('returns an empty array when no scripts are selected', () => {
    // arrange
    const { useStateStub, returnObject } = mountWrapperComponent();
    useStateStub.withState(new CategoryCollectionStateStub().withSelectedScripts([]));
    // act
    const actualIds = returnObject.selectedScriptNodeIds.value;
    // assert
    expect(actualIds).to.have.lengthOf(0);
  });
  it('initially registers the unsubscribe callback', () => {
    // arrange
    const eventsStub = new UseAutoUnsubscribedEventsStub();
    // act
    mountWrapperComponent({
      useAutoUnsubscribedEvents: eventsStub,
    });
    // assert
    const calls = eventsStub.events.callHistory;
    expect(eventsStub.events.callHistory).has.lengthOf(1);
    const call = calls.find((c) => c.methodName === 'unsubscribeAllAndRegister');
    expect(call).toBeDefined();
  });
  describe('returns correct node IDs for selected scripts', () => {
    it('immediately', () => {
      // arrange
      const selectedScripts = [
        new SelectedScriptStub('id-1'),
        new SelectedScriptStub('id-2'),
      ];
      const parsedNodeIds = new Map<IScript, string>([
        [selectedScripts[0].script, 'expected-id-1'],
        [selectedScripts[1].script, 'expected-id-2'],
      ]);
      const { useStateStub, returnObject } = mountWrapperComponent({
        scriptNodeIdParser: createNodeIdParserFromMap(parsedNodeIds),
      });
      useStateStub.triggerOnStateChange({
        newState: new CategoryCollectionStateStub().withSelectedScripts(selectedScripts),
        immediateOnly: true,
      });
      // act
      const actualIds = returnObject.selectedScriptNodeIds.value;
      // assert
      const expectedNodeIds = [...parsedNodeIds.values()];
      expect(actualIds).to.have.lengthOf(expectedNodeIds.length);
      expect(actualIds).to.include.members(expectedNodeIds);
    });
    it('when the collection state changes', () => {
      // arrange
      const initialScripts = [];
      const changedScripts = [
        new SelectedScriptStub('id-1'),
        new SelectedScriptStub('id-2'),
      ];
      const parsedNodeIds = new Map<IScript, string>([
        [changedScripts[0].script, 'expected-id-1'],
        [changedScripts[1].script, 'expected-id-2'],
      ]);
      const { useStateStub, returnObject } = mountWrapperComponent({
        scriptNodeIdParser: createNodeIdParserFromMap(parsedNodeIds),
      });
      useStateStub.triggerOnStateChange({
        newState: new CategoryCollectionStateStub().withSelectedScripts(initialScripts),
        immediateOnly: true,
      });
      // act
      useStateStub.triggerOnStateChange({
        newState: new CategoryCollectionStateStub().withSelectedScripts(changedScripts),
        immediateOnly: false,
      });
      const actualIds = returnObject.selectedScriptNodeIds.value;
      // assert
      const expectedNodeIds = [...parsedNodeIds.values()];
      expect(actualIds).to.have.lengthOf(expectedNodeIds.length);
      expect(actualIds).to.include.members(expectedNodeIds);
    });
    it('when the selection state changes', () => {
      // arrange
      const initialScripts = [];
      const changedScripts = [
        new SelectedScriptStub('id-1'),
        new SelectedScriptStub('id-2'),
      ];
      const parsedNodeIds = new Map<IScript, string>([
        [changedScripts[0].script, 'expected-id-1'],
        [changedScripts[1].script, 'expected-id-2'],
      ]);
      const { useStateStub, returnObject } = mountWrapperComponent({
        scriptNodeIdParser: createNodeIdParserFromMap(parsedNodeIds),
      });
      const userSelection = new UserSelectionStub([])
        .withSelectedScripts(initialScripts);
      useStateStub.triggerOnStateChange({
        newState: new CategoryCollectionStateStub()
          .withSelection(userSelection),
        immediateOnly: true,
      });
      // act
      userSelection.triggerSelectionChangedEvent(changedScripts);
      const actualIds = returnObject.selectedScriptNodeIds.value;
      // assert
      const expectedNodeIds = [...parsedNodeIds.values()];
      expect(actualIds).to.have.lengthOf(expectedNodeIds.length);
      expect(actualIds).to.include.members(expectedNodeIds);
    });
  });
  describe('reactivity to state changes', () => {
    describe('when the collection state changes', () => {
      it('with new array references', async () => {
        // arrange
        const { useStateStub, returnObject } = mountWrapperComponent();
        let isChangeTriggered = false;
        watch(() => returnObject.selectedScriptNodeIds.value, () => {
          isChangeTriggered = true;
        });
        // act
        useStateStub.triggerOnStateChange({
          newState: new CategoryCollectionStateStub(),
          immediateOnly: false,
        });
        await nextTick();
        // assert
        expect(isChangeTriggered).to.equal(true);
      });
      it('with the same array reference', async () => {
        // arrange
        const sharedSelectedScriptsReference = [];
        const initialCollectionState = new CategoryCollectionStateStub()
          .withSelectedScripts(sharedSelectedScriptsReference);
        const changedCollectionState = new CategoryCollectionStateStub()
          .withSelectedScripts(sharedSelectedScriptsReference);
        const { useStateStub, returnObject } = mountWrapperComponent();
        useStateStub.triggerOnStateChange({
          newState: initialCollectionState,
          immediateOnly: true,
        });
        let isChangeTriggered = false;
        watch(() => returnObject.selectedScriptNodeIds.value, () => {
          isChangeTriggered = true;
        });
        // act
        sharedSelectedScriptsReference.push(new SelectedScriptStub('new')); // mutate array using same reference
        useStateStub.triggerOnStateChange({
          newState: changedCollectionState,
          immediateOnly: false,
        });
        await nextTick();
        // assert
        expect(isChangeTriggered).to.equal(true);
      });
    });
    describe('when the selection state changes', () => {
      it('with new array references', async () => {
        // arrange
        const { useStateStub, returnObject } = mountWrapperComponent();
        const userSelection = new UserSelectionStub([])
          .withSelectedScripts([]);
        useStateStub.triggerOnStateChange({
          newState: new CategoryCollectionStateStub()
            .withSelection(userSelection),
          immediateOnly: true,
        });
        let isChangeTriggered = false;
        watch(() => returnObject.selectedScriptNodeIds.value, () => {
          isChangeTriggered = true;
        });
        // act
        userSelection.triggerSelectionChangedEvent([]);
        await nextTick();
        // assert
        expect(isChangeTriggered).to.equal(true);
      });
      it('with the same array reference', async () => {
        // arrange
        const { useStateStub, returnObject } = mountWrapperComponent();
        const sharedSelectedScriptsReference = [];
        const userSelection = new UserSelectionStub([])
          .withSelectedScripts(sharedSelectedScriptsReference);
        useStateStub.triggerOnStateChange({
          newState: new CategoryCollectionStateStub()
            .withSelection(userSelection),
          immediateOnly: true,
        });
        let isChangeTriggered = false;
        watch(() => returnObject.selectedScriptNodeIds.value, () => {
          isChangeTriggered = true;
        });
        // act
        sharedSelectedScriptsReference.push(new SelectedScriptStub('new')); // mutate array using same reference
        userSelection.triggerSelectionChangedEvent(sharedSelectedScriptsReference);
        await nextTick();
        // assert
        expect(isChangeTriggered).to.equal(true);
      });
    });
  });
});

type ScriptNodeIdParser = typeof getScriptNodeId;

function createNodeIdParserFromMap(scriptToIdMap: Map<IScript, string>): ScriptNodeIdParser {
  return (script) => {
    const expectedId = scriptToIdMap.get(script);
    if (!expectedId) {
      throw new Error(`No mapped ID for script: ${JSON.stringify(script)}`);
    }
    return expectedId;
  };
}

function mountWrapperComponent(scenario?: {
  readonly scriptNodeIdParser?: ScriptNodeIdParser,
  readonly useAutoUnsubscribedEvents?: UseAutoUnsubscribedEventsStub,
}) {
  const useStateStub = new UseCollectionStateStub();
  const nodeIdParser: ScriptNodeIdParser = scenario?.scriptNodeIdParser
    ?? ((script) => script.id);
  let returnObject: ReturnType<typeof useSelectedScriptNodeIds>;

  shallowMount({
    setup() {
      returnObject = useSelectedScriptNodeIds(nodeIdParser);
    },
    template: '<div></div>',
  }, {
    global: {
      provide: {
        [InjectionKeys.useCollectionState as symbol]:
          () => useStateStub.get(),
        [InjectionKeys.useAutoUnsubscribedEvents as symbol]:
          () => (scenario?.useAutoUnsubscribedEvents ?? new UseAutoUnsubscribedEventsStub()).get(),
      },
    },
  });

  return {
    returnObject,
    useStateStub,
  };
}
