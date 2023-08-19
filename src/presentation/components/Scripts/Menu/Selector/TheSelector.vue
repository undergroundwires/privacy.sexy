<template>
  <MenuOptionList label="Select">
    <TooltipWrapper>
      <!-- None -->
      <MenuOptionListItem
        label="None"
        :enabled="currentSelection !== SelectionType.None"
        @click="selectType(SelectionType.None)"
      />
      <template v-slot:tooltip>
        Deselect all selected scripts.
        <br />
        💡 Good start to dive deeper into tweaks and select only what you want.
      </template>
    </TooltipWrapper>

    <!-- Standard -->
    <TooltipWrapper>
      <MenuOptionListItem
        label="Standard"
        :enabled="currentSelection !== SelectionType.Standard"
        @click="selectType(SelectionType.Standard)"
      />
      <template v-slot:tooltip>
        🛡️ Balanced for privacy and functionality.
        <br />
        OS and applications will function normally.
        <br />
        💡 Recommended for everyone
      </template>
    </TooltipWrapper>

    <!-- Strict -->
    <TooltipWrapper>
      <MenuOptionListItem
        label="Strict"
        :enabled="currentSelection !== SelectionType.Strict"
        @click="selectType(SelectionType.Strict)"
      />
      <template v-slot:tooltip>
        🚫 Stronger privacy, disables risky functions that may leak your data.
        <br />
        ⚠️ Double check to remove scripts where you would trade functionality for privacy
        <br />
        💡 Recommended for daily users that prefers more privacy over non-essential functions
      </template>
    </TooltipWrapper>

    <!-- All -->
    <TooltipWrapper>
      <MenuOptionListItem
        label="All"
        :enabled="currentSelection !== SelectionType.All"
        @click="selectType(SelectionType.All)"
      />
      <template v-slot:tooltip>
        🔒 Strongest privacy, disabling any functionality that may leak your data.
        <br />
        🛑 Not designed for daily users, it will break important functionalities.
        <br />
        💡 Only recommended for extreme use-cases like crime labs where no leak is acceptable
      </template>
    </TooltipWrapper>
  </MenuOptionList>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { useCollectionStateKey } from '@/presentation/injectionSymbols';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import MenuOptionList from '../MenuOptionList.vue';
import MenuOptionListItem from '../MenuOptionListItem.vue';
import { SelectionType, SelectionTypeHandler } from './SelectionTypeHandler';

export default defineComponent({
  components: {
    MenuOptionList,
    MenuOptionListItem,
    TooltipWrapper,
  },
  setup() {
    const { modifyCurrentState, onStateChange, events } = inject(useCollectionStateKey)();

    const currentSelection = ref(SelectionType.None);

    let selectionTypeHandler: SelectionTypeHandler;

    onStateChange(() => {
      unregisterMutators();

      modifyCurrentState((state) => {
        registerStateMutator(state);
      });
    }, { immediate: true });

    function unregisterMutators() {
      events.unsubscribeAll();
    }

    function registerStateMutator(state: ICategoryCollectionState) {
      selectionTypeHandler = new SelectionTypeHandler(state);
      updateSelections();
      events.register(state.selection.changed.on(() => updateSelections()));
    }

    function selectType(type: SelectionType) {
      if (currentSelection.value === type) {
        return;
      }
      selectionTypeHandler.selectType(type);
    }

    function updateSelections() {
      currentSelection.value = selectionTypeHandler.getCurrentSelectionType();
    }

    return {
      SelectionType,
      currentSelection,
      selectType,
    };
  },
});
</script>
