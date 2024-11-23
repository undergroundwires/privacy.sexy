<template>
  <IconButton
    text="Save Selection"
    icon-name="content-save"
    @click="saveSelection"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { FileType } from '@/presentation/common/Dialog';
import IconButton from '../IconButton.vue';

export default defineComponent({
  components: {
    IconButton,
  },
  setup() {
    const { currentSelection } = injectKey((keys) => keys.useUserSelectionState);
    const { dialog } = injectKey((keys) => keys.useDialog);
    const { projectDetails } = injectKey((keys) => keys.useApplication);

    async function saveSelection() {
      // Create a config object with the current selection state
      const config = {
        version: projectDetails.version,
        selectedScripts: currentSelection.value.scripts.selectedScripts.map((script) => script.id),
        timestamp: new Date().toISOString(),
      };

      const configJson = JSON.stringify(config, null, 2);

      const { success, error } = await dialog.saveFile(
        configJson,
        'privacy-selection.json',
        FileType.Json,
      );

      if (!success && error) {
        console.error('Failed to save selection:', error);
      }
    }

    return {
      saveSelection,
    };
  },
});
</script>
