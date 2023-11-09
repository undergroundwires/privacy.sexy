<template>
  <div>
    <IconButton
      :text="isDesktopVersion ? 'Save' : 'Download'"
      @click="saveCode"
      :icon-name="isDesktopVersion ? 'floppy-disk' : 'file-arrow-down'"
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
import { SaveFileDialog, FileType } from '@/infrastructure/SaveFileDialog';
import ModalDialog from '@/presentation/components/Shared/Modal/ModalDialog.vue';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import IconButton from '../IconButton.vue';
import InstructionList from './Instructions/InstructionList.vue';
import { IInstructionListData } from './Instructions/InstructionListData';
import { getInstructions, hasInstructions } from './Instructions/InstructionListDataFactory';

export default defineComponent({
  components: {
    IconButton,
    InstructionList,
    ModalDialog,
  },
  setup() {
    const { currentState } = injectKey((keys) => keys.useCollectionState);
    const { isDesktop } = injectKey((keys) => keys.useRuntimeEnvironment);

    const areInstructionsVisible = ref(false);
    const fileName = computed<string>(() => buildFileName(currentState.value.collection.scripting));
    const instructions = computed<IInstructionListData | undefined>(() => getDownloadInstructions(
      currentState.value.collection.os,
      fileName.value,
    ));

    function saveCode() {
      saveCodeToDisk(fileName.value, currentState.value);
      areInstructionsVisible.value = true;
    }

    return {
      isDesktopVersion: isDesktop,
      instructions,
      fileName,
      areInstructionsVisible,
      saveCode,
    };
  },
});

function getDownloadInstructions(
  os: OperatingSystem,
  fileName: string,
): IInstructionListData | undefined {
  if (!hasInstructions(os)) {
    return undefined;
  }
  return getInstructions(os, fileName);
}

function saveCodeToDisk(fileName: string, state: IReadOnlyCategoryCollectionState) {
  const content = state.code.current;
  const type = getType(state.collection.scripting.language);
  SaveFileDialog.saveFile(content, fileName, type);
}

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
  const fileName = 'privacy-script';
  if (scripting.fileExtension) {
    return `${fileName}.${scripting.fileExtension}`;
  }
  return fileName;
}
</script>
