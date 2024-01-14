<template>
  <IconButton
    v-if="canRun"
    text="Run"
    icon-name="play"
    @click="runCode"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { Dialog } from '@/presentation/common/Dialog';
import IconButton from './IconButton.vue';

export default defineComponent({
  components: {
    IconButton,
  },
  setup() {
    const { currentState, currentContext } = injectKey((keys) => keys.useCollectionState);
    const { os, isRunningAsDesktopApplication } = injectKey((keys) => keys.useRuntimeEnvironment);
    const { codeRunner } = injectKey((keys) => keys.useCodeRunner);
    const { dialog } = injectKey((keys) => keys.useDialog);

    const canRun = computed<boolean>(() => getCanRunState(
      currentState.value.os,
      isRunningAsDesktopApplication,
      os,
    ));

    async function runCode() {
      if (!codeRunner) { throw new Error('missing code runner'); }
      const { success, error } = await codeRunner.runCode(
        currentContext.state.code.current,
        currentContext.state.collection.scripting.fileExtension,
      );
      if (!success) {
        showScriptRunError(dialog, `${error.type}: ${error.message}`);
      }
    }

    return {
      canRun,
      runCode,
    };
  },
});

function getCanRunState(
  selectedOs: OperatingSystem,
  isRunningAsDesktopApplication: boolean,
  hostOs: OperatingSystem | undefined,
): boolean {
  const isRunningOnSelectedOs = selectedOs === hostOs;
  return isRunningAsDesktopApplication && isRunningOnSelectedOs;
}

function showScriptRunError(dialog: Dialog, technicalDetails: string) {
  dialog.showError(
    'Error Running Script',
    [
      'We encountered an issue while running the script.',
      'This could be due to a variety of factors such as system permissions, resource constraints, or security software interventions.',
      '\n',
      'Here are some steps you can take:',
      '- Confirm that you have the necessary permissions to execute scripts on your system.',
      '- Check if there is sufficient disk space and system resources available.',
      '- Antivirus or security software can sometimes mistakenly block script execution. If you suspect this, verify your security settings, or temporarily disable the security software to see if that resolves the issue.',
      '- If possible, try running a different script to determine if the issue is specific to a particular script.',
      '- Should the problem persist, reach out to the community for further assistance.',
      '\n',
      'For your reference, here are the technical details of the error:',
      technicalDetails,
    ].join('\n'),
  );
}
</script>
