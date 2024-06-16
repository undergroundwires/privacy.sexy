<template>
  <ToggleSwitch
    v-model="isReverted"
    :stop-click-propagation="true"
    label="Revert"
  />
</template>

<script lang="ts">
import {
  type PropType, defineComponent, computed,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import type { NodeMetadata } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import { getReverter } from './Reverter/ReverterFactory';
import ToggleSwitch from './ToggleSwitch.vue';
import type { Reverter } from './Reverter/Reverter';

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

    const revertHandler = computed<Reverter>(
      () => getReverter(props.node, currentCollection.value),
    );

    const isReverted = computed<boolean>({
      get() {
        const { selectedScripts } = currentSelection.value.scripts;
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
@/domain/Collection/ICategoryCollection
