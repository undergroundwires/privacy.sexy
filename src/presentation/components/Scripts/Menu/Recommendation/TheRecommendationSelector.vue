<template>
  <MenuOptionList label="Select">
    <TooltipWrapper>
      <!-- None -->
      <MenuOptionListItem
        label="None"
        :enabled="currentRecommendationStatusType !== RecommendationStatusType.None"
        @click="selectRecommendationStatusType(RecommendationStatusType.None)"
      />
      <template #tooltip>
        <RecommendationDocumentation
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
        :enabled="currentRecommendationStatusType !== RecommendationStatusType.Standard"
        @click="selectRecommendationStatusType(RecommendationStatusType.Standard)"
      />
      <template #tooltip>
        <RecommendationDocumentation
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
        :enabled="currentRecommendationStatusType !== RecommendationStatusType.Strict"
        @click="selectRecommendationStatusType(RecommendationStatusType.Strict)"
      />
      <template #tooltip>
        <RecommendationDocumentation
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
        :enabled="currentRecommendationStatusType !== RecommendationStatusType.All"
        @click="selectRecommendationStatusType(RecommendationStatusType.All)"
      />
      <template #tooltip>
        <RecommendationDocumentation
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
import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import MenuOptionList from '../MenuOptionList.vue';
import MenuOptionListItem from '../MenuOptionListItem.vue';
import { setCurrentRecommendationStatus, getCurrentRecommendationStatus } from './RecommendationStatusHandler';
import { RecommendationStatusType } from './RecommendationStatusType';
import RecommendationDocumentation from './RecommendationDocumentation.vue';

export default defineComponent({
  components: {
    MenuOptionList,
    MenuOptionListItem,
    TooltipWrapper,
    RecommendationDocumentation,
  },
  setup() {
    const {
      currentSelection, modifyCurrentSelection,
    } = injectKey((keys) => keys.useUserSelectionState);
    const { currentState } = injectKey((keys) => keys.useCollectionState);

    const currentCollection = computed<ICategoryCollection>(() => currentState.value.collection);

    const currentRecommendationStatusType = computed<RecommendationStatusType>({
      get: () => getCurrentRecommendationStatus({
        selection: currentSelection.value.scripts,
        collection: currentCollection.value,
      }),
      set: (type: RecommendationStatusType) => {
        selectRecommendationStatusType(type);
      },
    });

    function selectRecommendationStatusType(type: RecommendationStatusType) {
      if (currentRecommendationStatusType.value === type) {
        return;
      }
      modifyCurrentSelection((mutableSelection) => {
        setCurrentRecommendationStatus(type, {
          selection: mutableSelection.scripts,
          collection: currentCollection.value,
        });
      });
    }

    return {
      RecommendationStatusType,
      currentRecommendationStatusType,
      selectRecommendationStatusType,
    };
  },
});
</script>
