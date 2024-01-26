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
        <SelectionTypeDocumentation
          :privacy-rating="0"
          description="Deselects all scripts. Good starting point to review and select individual tweaks."
          recommendation="Recommended for users who prefer total control over changes. It allows you to examine and select only the tweaks you require."
        />
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
        <SelectionTypeDocumentation
          :privacy-rating="2"
          description="Provides a balanced approach between privacy and functionality."
          recommendation="Recommended for most users who wish to improve privacy with best-practices without affecting stability."
          :includes="[
            'Retains functionality of all apps and system services.',
            'Clears non-essential OS and app telemetry data and caches.',
            'Keeps essential security services enabled.',
          ]"
        />
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
        <SelectionTypeDocumentation
          :privacy-rating="3"
          description="Focuses heavily on privacy by disabling some non-critical functions that could leak data."
          recommendation="Recommended for advanced users who prioritize privacy over non-essential functionality."
          :includes="[
            'Disables optional OS and app services that could leak data.',
            'Clears non-essential caches, histories, temporary files while retaining browser bookmarks.',
            'Keeps vital security services and critical application functionality.',
          ]"
          :considerations="[
            'Review each script to make sure you are comfortable with the disabled functionality.',
            'Some non-critical applications or features may no longer function as expected.',
          ]"
        />
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
        <SelectionTypeDocumentation
          :privacy-rating="4"
          description="Strongest privacy by disabling any functionality that may risk data exposure."
          recommendation="Recommended for extreme use cases where no data leak is acceptable like crime labs."
          :considerations="[
            'Not recommended for daily use as it breaks important functionality.',
            'Do not run it without having backups and system snapshots, unless you\'re on a disposable system.',
          ]"
        />
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
import SelectionTypeDocumentation from './SelectionTypeDocumentation.vue';

export default defineComponent({
  components: {
    MenuOptionList,
    MenuOptionListItem,
    TooltipWrapper,
    SelectionTypeDocumentation,
  },
  setup() {
    const {
      currentSelection, modifyCurrentSelection,
    } = injectKey((keys) => keys.useUserSelectionState);
    const { currentState } = injectKey((keys) => keys.useCollectionState);

    const currentCollection = computed<ICategoryCollection>(() => currentState.value.collection);

    const currentSelectionType = computed<SelectionType>({
      get: () => getCurrentSelectionType({
        selection: currentSelection.value.scripts,
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
          selection: mutableSelection.scripts,
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
