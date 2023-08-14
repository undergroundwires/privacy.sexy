<template>
  <ToggleSwitch
    v-model="isChecked"
    :stopClickPropagation="true"
    :label="'revert'"
  />
</template>

<script lang="ts">
import {
  PropType, defineComponent, ref, watch,
  computed,
} from 'vue';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IReverter } from './Reverter/IReverter';
import { INodeContent } from './INodeContent';
import { getReverter } from './Reverter/ReverterFactory';
import ToggleSwitch from './ToggleSwitch.vue';

export default defineComponent({
  components: {
    ToggleSwitch,
  },
  props: {
    node: {
      type: Object as PropType<INodeContent>,
      required: true,
    },
  },
  setup(props) {
    const {
      currentState, modifyCurrentState, onStateChange, events,
    } = useCollectionState();

    const isReverted = ref(false);

    let handler: IReverter | undefined;

    watch(
      () => props.node,
      async (node) => { await onNodeChanged(node); },
      { immediate: true },
    );

    onStateChange((newState) => {
      updateRevertStatusFromState(newState.selection.selectedScripts);
      events.unsubscribeAll();
      events.register(
        newState.selection.changed.on((scripts) => updateRevertStatusFromState(scripts)),
      );
    }, { immediate: true });

    async function onNodeChanged(node: INodeContent) {
      handler = getReverter(node, currentState.value.collection);
      updateRevertStatusFromState(currentState.value.selection.selectedScripts);
    }

    async function updateRevertStatusFromState(scripts: ReadonlyArray<SelectedScript>) {
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
