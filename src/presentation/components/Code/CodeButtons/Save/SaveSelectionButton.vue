<template>
  <IconButton
    text="Save Selection"
    icon-name="floppy-disk-gear"
    @click="saveSelection"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { FileType } from '@/presentation/common/Dialog';
import IconButton from '../IconButton.vue';
import { createScriptErrorDialog } from '../ScriptErrorDialog';

interface SelectionConfig {
  version: string;
  timestamp: string;
  selectedScripts: string[];
}

export default defineComponent({
  components: {
    IconButton,
  },
  setup() {
    const { currentSelection } = injectKey((keys) => keys.useUserSelectionState);
    const { dialog } = injectKey((keys) => keys.useDialog);
    const { projectDetails } = injectKey((keys) => keys.useApplication);
    const { scriptDiagnosticsCollector } = injectKey((keys) => keys.useScriptDiagnosticsCollector);

    async function saveSelection() {
      const config: SelectionConfig = {
        version: projectDetails.version.toString(),
        timestamp: new Date().toISOString(),
        selectedScripts: currentSelection.value.scripts.selectedScripts.map((script) => script.id),
      };

      const { success, error } = await dialog.saveFile(
        JSON.stringify(config, null, 2),
        'privacy-selection.json',
        FileType.Json,
      );

      if (!success) {
        dialog.showError(...(await createScriptErrorDialog({
          errorContext: 'save',
          errorType: error.type,
          errorMessage: error.message,
          isFileReadbackError: error.type === 'FileReadbackVerificationError',
        }, scriptDiagnosticsCollector)));
      }
    }

    return {
      saveSelection,
    };
  },
});
</script>
