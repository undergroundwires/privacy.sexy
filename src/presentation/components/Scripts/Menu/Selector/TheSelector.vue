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
import { InjectionKeys } from '@/presentation/injectionSymbols';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IEventSubscription } from '@/infrastructure/Events/IEventSource';
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
    const { modifyCurrentState, onStateChange } = inject(InjectionKeys.useCollectionState)();
    const { events } = inject(InjectionKeys.useAutoUnsubscribedEvents)();

    const currentSelection = ref(SelectionType.None);

    let selectionTypeHandler: SelectionTypeHandler;

    onStateChange(() => {
      modifyCurrentState((state) => {
        selectionTypeHandler = new SelectionTypeHandler(state);
        updateSelections();
        events.unsubscribeAllAndRegister([
          subscribeAndUpdateSelections(state),
        ]);
      });
    }, { immediate: true });

    function subscribeAndUpdateSelections(
      state: ICategoryCollectionState,
    ): IEventSubscription {
      return state.selection.changed.on(() => updateSelections());
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
