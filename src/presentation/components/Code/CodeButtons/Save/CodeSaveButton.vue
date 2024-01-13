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
import { ScriptFileName } from '@/application/CodeRunner/ScriptFileName';
import { FileType } from '@/presentation/common/Dialog';
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
    const fileName = computed<string>(() => buildFileName(currentState.value.collection.scripting));
    const instructions = computed<IInstructionListData | undefined>(() => getInstructions(
      currentState.value.collection.os,
      fileName.value,
    ));

    async function saveCode() {
      await dialog.saveFile(
        currentState.value.code.current,
        fileName.value,
        getType(currentState.value.collection.scripting.language),
      );
      areInstructionsVisible.value = true;
    }

    return {
      isRunningAsDesktopApplication,
      instructions,
      fileName,
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

function buildFileName(scripting: IScriptingDefinition) {
  if (scripting.fileExtension) {
    return `${ScriptFileName}.${scripting.fileExtension}`;
  }
  return ScriptFileName;
}
</script>
