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
import { CodeRunError } from '@/application/CodeRunner/CodeRunner';
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
        showScriptRunError(dialog, error);
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

function showScriptRunError(dialog: Dialog, error: CodeRunError) {
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
    'Error Running Script',
    [
      'We encountered an issue while running the script.',
      'This could be due to a variety of factors such as system permissions, resource constraints, or security software interventions.',
      '\n',
      'Here are some steps you can take:',
      '- Confirm that you have the necessary permissions to execute scripts on your system.',
      '- Check if there is sufficient disk space and system resources available.',
      [
        '- Antivirus or security software can sometimes mistakenly block script execution.',
        'Verify your security settings, or temporarily disable the security software to see if that resolves the issue.',
        'privacy.sexy is secure, transparent, and open-source, but the scripts might still be mistakenly flagged by antivirus software.',
      ].join(' '),
      '- If possible, try running a different script to determine if the issue is specific to a particular script.',
      '- Should the problem persist, reach out to the community for further assistance.',
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
        'We\'ve encountered a problem which may be due to your antivirus software intervening.',
        'privacy.sexy is secure, transparent, and open-source, but the scripts might still be mistakenly flagged by antivirus software such as Defender.',
      ].join(' '),
      '\n',
      'To address this, you can:',
      '1. Temporarily disable your antivirus (real-time protection) or add an exclusion for privacy.sexy scripts.',
      '2. Re-try running or downloading the script.',
      '3. If the issue persists, check your antivirus logs for more details and consider reporting this as a false positive to your antivirus provider.',
      '\n',
      'To handle false warnings in Defender: Open "Virus & threat protection" from the "Start" menu.',
      '\n',
      [
        'Remember to re-enable your antivirus protection as soon as possible for your security.',
        'For more guidance, refer to your antivirus documentation.',
      ].join(' '),
      '\n',
      'Technical Details:',
      technicalDetails,
    ].join('\n'),
  ];
}
</script>
