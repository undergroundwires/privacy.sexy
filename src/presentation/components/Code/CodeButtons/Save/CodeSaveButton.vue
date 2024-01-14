<template>
  <div>
    <IconButton
      :text="isRunningAsDesktopApplication ? 'Save' : 'Download'"
      :icon-name="isRunningAsDesktopApplication ? 'floppy-disk' : 'file-arrow-down'"
      @click="saveCode"
    />
    <ModalDialog v-if="instructions" v-model="areInstructionsVisible">
      <InstructionList :data="instructions" />
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
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptFilename } from '@/application/CodeRunner/ScriptFilename';
import { Dialog, FileType } from '@/presentation/common/Dialog';
import IconButton from '../IconButton.vue';
import InstructionList from './Instructions/InstructionList.vue';
import { IInstructionListData } from './Instructions/InstructionListData';
import { getInstructions } from './Instructions/InstructionListDataFactory';

export default defineComponent({
  components: {
    IconButton,
    InstructionList,
    ModalDialog,
  },
  setup() {
    const { currentState } = injectKey((keys) => keys.useCollectionState);
    const { isRunningAsDesktopApplication } = injectKey((keys) => keys.useRuntimeEnvironment);
    const { dialog } = injectKey((keys) => keys.useDialog);

    const areInstructionsVisible = ref(false);
    const filename = computed<string>(() => buildFilename(currentState.value.collection.scripting));
    const instructions = computed<IInstructionListData | undefined>(() => getInstructions(
      currentState.value.collection.os,
      filename.value,
    ));

    async function saveCode() {
      const { success, error } = await dialog.saveFile(
        currentState.value.code.current,
        filename.value,
        getType(currentState.value.collection.scripting.language),
      );
      if (!success) {
        showScriptSaveError(dialog, `${error.type}: ${error.message}`);
        return;
      }
      areInstructionsVisible.value = true;
    }

    return {
      isRunningAsDesktopApplication,
      instructions,
      areInstructionsVisible,
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

function showScriptSaveError(dialog: Dialog, technicalDetails: string) {
  dialog.showError(
    'Error Saving Script',
    [
      'An error occurred while saving the script.',
      'This issue may arise from insufficient permissions, limited disk space, or interference from security software.',
      '\n',
      'To address this:',
      '- Verify your permissions for the selected save directory.',
      '- Check available disk space.',
      '- Review your antivirus or security settings; adding an exclusion for privacy.sexy might be necessary.',
      '- Try saving the script to a different location or modifying your selection.',
      '- If the problem persists, reach out to the community for further assistance.',
      '\n',
      'Technical Details:',
      technicalDetails,
    ].join('\n'),
  );
}
</script>
