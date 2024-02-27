<template>
  <div>
    <IconButton
      :text="isRunningAsDesktopApplication ? 'Save' : 'Download'"
      :icon-name="isRunningAsDesktopApplication ? 'floppy-disk' : 'file-arrow-down'"
      @click="saveCode"
    />
    <ModalDialog v-model="areInstructionsVisible">
      <RunInstructions :filename="filename" />
    </ModalDialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, computed,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import ModalDialog from '@/presentation/components/Shared/Modal/ModalDialog.vue';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { type IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptFilename } from '@/application/CodeRunner/ScriptFilename';
import { FileType } from '@/presentation/common/Dialog';
import IconButton from '../IconButton.vue';
import { createScriptErrorDialog } from '../ScriptErrorDialog';
import RunInstructions from './RunInstructions/RunInstructions.vue';

export default defineComponent({
  components: {
    IconButton,
    RunInstructions,
    ModalDialog,
  },
  setup() {
    const { currentState } = injectKey((keys) => keys.useCollectionState);
    const { isRunningAsDesktopApplication } = injectKey((keys) => keys.useRuntimeEnvironment);
    const { dialog } = injectKey((keys) => keys.useDialog);
    const { scriptDiagnosticsCollector } = injectKey((keys) => keys.useScriptDiagnosticsCollector);

    const areInstructionsVisible = ref(false);
    const filename = computed<string>(() => buildFilename(currentState.value.collection.scripting));

    async function saveCode() {
      const { success, error } = await dialog.saveFile(
        currentState.value.code.current,
        filename.value,
        getType(currentState.value.collection.scripting.language),
      );
      if (!success) {
        dialog.showError(...(await createScriptErrorDialog({
          errorContext: 'save',
          errorType: error.type,
          errorMessage: error.message,
          isFileReadbackError: error.type === 'FileReadbackVerificationError',
        }, scriptDiagnosticsCollector)));
        return;
      }
      areInstructionsVisible.value = true;
    }

    return {
      isRunningAsDesktopApplication,
      areInstructionsVisible,
      filename,
      saveCode,
    };
  },
});

function getType(language: ScriptingLanguage) {
  switch (language) {
    case ScriptingLanguage.batchfile:
      return FileType.BatchFile;
    case ScriptingLanguage.shellscript:
      return FileType.ShellScript;
    default:
      throw new Error('unknown file type');
  }
}

function buildFilename(scripting: IScriptingDefinition) {
  if (scripting.fileExtension) {
    return `${ScriptFilename}.${scripting.fileExtension}`;
  }
  return ScriptFilename;
}
</script>
