import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { useSelectedScriptNodeIds } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/UseSelectedScriptNodeIds';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { UseAutoUnsubscribedEventsStub } from '@tests/unit/shared/Stubs/UseAutoUnsubscribedEventsStub';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { getScriptNodeId } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/CategoryNodeMetadataConverter';
import { IScript } from '@/domain/IScript';

describe('useSelectedScriptNodeIds', () => {
  it('returns empty array when no scripts are selected', () => {
    // arrange
    const { useStateStub, returnObject } = mountWrapperComponent();
    useStateStub.withState(new CategoryCollectionStateStub().withSelectedScripts([]));
    // act
    const actualIds = returnObject.selectedScriptNodeIds.value;
    // assert
    expect(actualIds).to.have.lengthOf(0);
  });

  it('returns correct node IDs for selected scripts', () => {
    // arrange
    const selectedScripts = [
      new SelectedScriptStub('id-1'),
      new SelectedScriptStub('id-2'),
    ];
    const parsedNodeIds = new Map<IScript, string>([
      [selectedScripts[0].script, 'expected-id-1'],
      [selectedScripts[1].script, 'expected-id-1'],
    ]);
    const { useStateStub, returnObject } = mountWrapperComponent({
      scriptNodeIdParser: (script) => parsedNodeIds.get(script),
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
});

function mountWrapperComponent(scenario?: {
  readonly scriptNodeIdParser?: typeof getScriptNodeId,
}) {
  const useStateStub = new UseCollectionStateStub();
  const nodeIdParser: typeof getScriptNodeId = scenario?.scriptNodeIdParser
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
          () => new UseAutoUnsubscribedEventsStub().get(),
      },
    },
  });

  return {
    returnObject,
    useStateStub,
  };
}
