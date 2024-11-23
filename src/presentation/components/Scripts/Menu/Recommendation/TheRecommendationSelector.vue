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

    <!-- Load from file -->
    <TooltipWrapper>
      <MenuOptionListItem
        label="Import"
        :enabled="!isImporting"
        @click="loadFromFile"
      />
      <template #tooltip>
        <RecommendationDocumentation
          :privacy-rating="0"
          description="Restores a previously saved script selection from a JSON file."
          recommendation="..."
          :considerations="[
            'All current selections will be cleared before import',
            'Only .json files exported by privacy.sexy are supported',
          ]"
        />
      </template>
    </TooltipWrapper>
  </MenuOptionList>
</template>

<script lang="ts">
import {
  defineComponent, computed, ref,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import MenuOptionList from '../MenuOptionList.vue';
import MenuOptionListItem from '../MenuOptionListItem.vue';
import { setCurrentRecommendationStatus, getCurrentRecommendationStatus } from './RecommendationStatusHandler';
import { RecommendationStatusType } from './RecommendationStatusType';
import RecommendationDocumentation from './RecommendationDocumentation.vue';

interface SavedSelection {
  version?: string;
  timestamp?: string;
  selectedScripts: string[];
}

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
    const { dialog } = injectKey((keys) => keys.useDialog);

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

    const isImporting = ref(false);

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

    async function loadFromFile() {
      if (isImporting.value) {
        return;
      }

      try {
        isImporting.value = true;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        const file = await new Promise<File>((resolve, reject) => {
          input.onchange = (event) => {
            const { files } = (event.target as HTMLInputElement);
            if (files && files.length > 0) {
              resolve(files[0]);
            } else {
              reject(new Error('No file selected'));
            }
          };
          input.click();
        });

        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });

        let savedSelection: SavedSelection;
        try {
          savedSelection = JSON.parse(content) as SavedSelection;
          if (!Array.isArray(savedSelection.selectedScripts)) {
            throw new Error('Invalid file format: missing or invalid scripts array');
          }
        } catch (parseError) {
          dialog.showError('Import Error', 'The selected file is not a valid selection file.');
          return;
        }

        // Update the current selection state
        await modifyCurrentSelection((selection) => {
          // First deselect all scripts
          selection.scripts.deselectAll();

          // Validate and apply each script selection
          const validScripts = savedSelection.selectedScripts.filter(
            (scriptId) => {
              try {
                return currentCollection.value.getScript(scriptId) !== undefined;
              } catch {
                return false;
              }
            },
          );

          if (validScripts.length === 0) {
            throw new Error('No valid scripts found in the imported selection');
          }

          if (validScripts.length !== savedSelection.selectedScripts.length) {
            dialog.showError(
              'Import Warning',
              'Some scripts from the imported selection were not found in the current collection.',
            );
          }

          // Apply valid script selections
          validScripts.forEach((scriptId) => {
            selection.scripts.processChanges({
              changes: [{
                scriptId,
                newStatus: {
                  isSelected: true,
                  isReverted: false,
                },
              }],
            });
          });
        });
      } catch (error) {
        if (error instanceof Error && error.message !== 'No file selected') {
          dialog.showError('Import Error', `Failed to import selection: ${error.message}`);
          console.error('Failed to load selection:', error);
        }
      } finally {
        isImporting.value = false;
      }
    }

    return {
      RecommendationStatusType,
      currentRecommendationStatusType,
      selectRecommendationStatusType,
      loadFromFile,
      isImporting,
    };
  },
});
</script>
