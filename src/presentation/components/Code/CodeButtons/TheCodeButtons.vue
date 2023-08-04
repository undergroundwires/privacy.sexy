<template>
  <div class="container" v-if="hasCode">
    <IconButton
      v-if="this.canRun"
      text="Run"
      v-on:click="executeCode"
      icon-prefix="fas"
      icon-name="play"
    />
    <IconButton
      :text="this.isDesktopVersion ? 'Save' : 'Download'"
      v-on:click="saveCode"
      icon-prefix="fas"
      :icon-name="this.isDesktopVersion ? 'save' : 'file-download'"
    />
    <IconButton
      text="Copy"
      v-on:click="copyCode"
      icon-prefix="fas"
      icon-name="copy"
    />
    <Dialog v-if="this.hasInstructions" ref="instructionsDialog">
      <InstructionList :data="this.instructions" />
    </Dialog>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { SaveFileDialog, FileType } from '@/infrastructure/SaveFileDialog';
import { Clipboard } from '@/infrastructure/Clipboard';
import Dialog from '@/presentation/components/Shared/Dialog.vue';
import { Environment } from '@/application/Environment/Environment';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { CodeRunner } from '@/infrastructure/CodeRunner';
import { IReadOnlyApplicationContext } from '@/application/Context/IApplicationContext';
import InstructionList from './Instructions/InstructionList.vue';
import IconButton from './IconButton.vue';
import { IInstructionListData } from './Instructions/InstructionListData';
import { getInstructions, hasInstructions } from './Instructions/InstructionListDataFactory';

@Component({
  components: {
    IconButton,
    InstructionList,
    Dialog,
  },
})
export default class TheCodeButtons extends StatefulVue {
  public readonly isDesktopVersion = Environment.CurrentEnvironment.isDesktop;

  public canRun = false;

  public hasCode = false;

  public instructions: IInstructionListData | undefined;

  public hasInstructions = false;

  public fileName = '';

  public async copyCode() {
    const code = await this.getCurrentCode();
    Clipboard.copyText(code.current);
  }

  public async saveCode() {
    const context = await this.getCurrentContext();
    saveCode(this.fileName, context.state);
    if (this.hasInstructions) {
      (this.$refs.instructionsDialog as Dialog).show();
    }
  }

  public async executeCode() {
    const context = await this.getCurrentContext();
    await executeCode(context);
  }

  protected handleCollectionState(newState: IReadOnlyCategoryCollectionState): void {
    this.updateRunState(newState.os);
    this.updateDownloadState(newState.collection);
    this.updateCodeState(newState.code);
  }

  private async getCurrentCode(): Promise<IApplicationCode> {
    const context = await this.getCurrentContext();
    const { code } = context.state;
    return code;
  }

  private updateRunState(selectedOs: OperatingSystem) {
    const isRunningOnSelectedOs = selectedOs === Environment.CurrentEnvironment.os;
    this.canRun = this.isDesktopVersion && isRunningOnSelectedOs;
  }

  private updateDownloadState(collection: ICategoryCollection) {
    this.fileName = buildFileName(collection.scripting);
    this.hasInstructions = hasInstructions(collection.os);
    if (this.hasInstructions) {
      this.instructions = getInstructions(collection.os, this.fileName);
    }
  }

  private updateCodeState(code: IApplicationCode) {
    this.hasCode = code.current && code.current.length > 0;
    this.events.unsubscribeAll();
    this.events.register(code.changed.on((newCode) => {
      this.hasCode = newCode && newCode.code.length > 0;
    }));
  }
}

function saveCode(fileName: string, state: IReadOnlyCategoryCollectionState) {
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

async function executeCode(context: IReadOnlyApplicationContext) {
  const runner = new CodeRunner();
  await runner.runCode(
    /* code: */ context.state.code.current,
    /* appName: */ context.app.info.name,
    /* fileExtension: */ context.state.collection.scripting.fileExtension,
  );
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.container > * + * {
  margin-left: 30px;
}
</style>
