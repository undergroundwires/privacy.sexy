<template>
  <ToggleSwitch
    v-model="isChecked"
    :stopClickPropagation="true"
    :label="'revert'"
  />
</template>

<script lang="ts">
import {
  PropType, defineComponent, ref, watch, computed,
} from 'vue';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { injectKey } from '@/presentation/injectionSymbols';
import { NodeMetadata } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';
import { IReverter } from './Reverter/IReverter';
import { getReverter } from './Reverter/ReverterFactory';
import ToggleSwitch from './ToggleSwitch.vue';

export default defineComponent({
  components: {
    ToggleSwitch,
  },
  props: {
    node: {
      type: Object as PropType<NodeMetadata>,
      required: true,
    },
  },
  setup(props) {
    const {
      currentState, modifyCurrentState, onStateChange,
    } = injectKey((keys) => keys.useCollectionState);
    const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

    const isReverted = ref(false);

    let handler: IReverter | undefined;

    watch(
      () => props.node,
      (node) => onNodeChanged(node),
      { immediate: true },
    );

    onStateChange((newState) => {
      updateRevertStatusFromState(newState.selection.selectedScripts);
      events.unsubscribeAllAndRegister([
        newState.selection.changed.on((scripts) => updateRevertStatusFromState(scripts)),
      ]);
    }, { immediate: true });

    function onNodeChanged(node: NodeMetadata) {
      handler = getReverter(node, currentState.value.collection);
      updateRevertStatusFromState(currentState.value.selection.selectedScripts);
    }

    function updateRevertStatusFromState(scripts: ReadonlyArray<SelectedScript>) {
      isReverted.value = handler?.getState(scripts) ?? false;
    }

    function syncReversionStatusWithState(value: boolean) {
      if (value === isReverted.value) {
        return;
      }
      modifyCurrentState((state) => {
        handler.selectWithRevertState(value, state.selection);
      });
    }

    const isChecked = computed({
      get() {
        return isReverted.value;
      },
      set: (value: boolean) => {
        syncReversionStatusWithState(value);
      },
    });

    return {
      isChecked,
    };
  },
});
</script>
