<template>
  <MenuOptionList label="Select">
    <TooltipWrapper>
      <!-- None -->
      <MenuOptionListItem
        label="None"
        :enabled="currentSelection !== SelectionType.None"
        @click="selectType(SelectionType.None)"
      />
      <template #tooltip>
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
      <template #tooltip>
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
      <template #tooltip>
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
      <template #tooltip>
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
import {
  defineComponent, computed,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import MenuOptionList from '../MenuOptionList.vue';
import MenuOptionListItem from '../MenuOptionListItem.vue';
import { SelectionType, setCurrentSelectionType, getCurrentSelectionType } from './SelectionTypeHandler';

export default defineComponent({
  components: {
    MenuOptionList,
    MenuOptionListItem,
    TooltipWrapper,
  },
  setup() {
    const {
      currentSelection, modifyCurrentSelection,
    } = injectKey((keys) => keys.useUserSelectionState);
    const { currentState } = injectKey((keys) => keys.useCollectionState);

    const currentCollection = computed<ICategoryCollection>(() => currentState.value.collection);

    const currentSelectionType = computed<SelectionType>({
      get: () => getCurrentSelectionType({
        selection: currentSelection.value,
        collection: currentCollection.value,
      }),
      set: (type: SelectionType) => {
        selectType(type);
      },
    });

    function selectType(type: SelectionType) {
      if (currentSelectionType.value === type) {
        return;
      }
      modifyCurrentSelection((mutableSelection) => {
        setCurrentSelectionType(type, {
          selection: mutableSelection,
          collection: currentCollection.value,
        });
      });
    }

    return {
      SelectionType,
      currentSelection: currentSelectionType,
      selectType,
    };
  },
});
</script>
