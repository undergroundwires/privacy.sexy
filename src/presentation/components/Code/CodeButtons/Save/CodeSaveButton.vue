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
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptFilename } from '@/application/CodeRunner/ScriptFilename';
import { Dialog, FileType, SaveFileError } from '@/presentation/common/Dialog';
import IconButton from '../IconButton.vue';
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

    const areInstructionsVisible = ref(false);
    const filename = computed<string>(() => buildFilename(currentState.value.collection.scripting));

    async function saveCode() {
      const { success, error } = await dialog.saveFile(
        currentState.value.code.current,
        filename.value,
        getType(currentState.value.collection.scripting.language),
      );
      if (!success) {
        showScriptSaveError(dialog, error);
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

function showScriptSaveError(dialog: Dialog, error: SaveFileError) {
  const technicalDetails = `[${error.type}] ${error.message}`;
  dialog.showError(
    ...(
      error.type === 'FileReadbackVerificationError'
        ? createAntivirusErrorDialog(technicalDetails)
        : createGenericErrorDialog(technicalDetails)),
  );
}

function createGenericErrorDialog(technicalDetails: string): Parameters<Dialog['showError']> {
  return [
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
  ];
}

function createAntivirusErrorDialog(technicalDetails: string): Parameters<Dialog['showError']> {
  return [
    'Potential Antivirus Intervention',
    [
      [
        'It seems your antivirus software might have blocked the saving of the script.',
        'privacy.sexy is secure, transparent, and open-source, but the scripts might still be mistakenly flagged by antivirus software such as Defender.',
      ].join(' '),
      '\n',
      'To resolve this, consider:',
      '1. Checking your antivirus for any blocking notifications and allowing the script.',
      '2. Temporarily disabling real-time protection or adding an exclusion for privacy.sexy scripts.',
      '3. Re-attempting to save the script.',
      '4. If the problem continues, review your antivirus logs for more details.',
      '\n',
      'To handle false warnings in Defender: Open "Virus & threat protection" from the "Start" menu.',
      '\n',
      'Always ensure to re-enable your antivirus protection promptly.',
      'For more guidance, refer to your antivirus documentation.',
      '\n',
      'Technical Details:',
      technicalDetails,
    ].join('\n'),
  ];
}
</script>
