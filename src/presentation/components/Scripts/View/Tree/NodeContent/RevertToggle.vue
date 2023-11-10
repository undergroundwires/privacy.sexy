<template>
  <ToggleSwitch
    v-model="isReverted"
    :stopClickPropagation="true"
    :label="'revert'"
  />
</template>

<script lang="ts">
import {
  PropType, defineComponent, computed,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { NodeMetadata } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
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
      currentSelection, modifyCurrentSelection,
    } = injectKey((keys) => keys.useUserSelectionState);
    const { currentState } = injectKey((keys) => keys.useCollectionState);

    const currentCollection = computed<ICategoryCollection>(() => currentState.value.collection);

    const revertHandler = computed<IReverter>(
      () => getReverter(props.node, currentCollection.value),
    );

    const isReverted = computed<boolean>({
      get() {
        const { selectedScripts } = currentSelection.value;
        return revertHandler.value.getState(selectedScripts);
      },
      set: (value: boolean) => {
        syncReversionStatusWithState(value);
      },
    });

    function syncReversionStatusWithState(value: boolean) {
      if (value === isReverted.value) {
        return;
      }
      modifyCurrentSelection((mutableSelection) => {
        revertHandler.value.selectWithRevertState(value, mutableSelection);
      });
    }

    return {
      isReverted,
    };
  },
});
</script>
