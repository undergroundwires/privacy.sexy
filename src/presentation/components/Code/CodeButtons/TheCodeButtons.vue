<template>
    <div class="container" v-if="hasCode">
        <IconButton
            v-if="this.canRun"
            text="Run"
            v-on:click="executeCode"
            icon-prefix="fas" icon-name="play">
        </IconButton>
        <IconButton
            :text="this.isDesktopVersion ? 'Save' : 'Download'"
            v-on:click="saveCode"
            icon-prefix="fas" 
            :icon-name="this.isDesktopVersion ? 'save' : 'file-download'">
        </IconButton>
        <IconButton
            text="Copy"
            v-on:click="copyCode"
            icon-prefix="fas" icon-name="copy">
        </IconButton>
        <Dialog v-if="this.isMacOsCollection" ref="instructionsDialog">
          <MacOsInstructions :fileName="this.fileName" />
        </Dialog>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { SaveFileDialog, FileType } from '@/infrastructure/SaveFileDialog';
import { Clipboard } from '@/infrastructure/Clipboard';
import Dialog from '@/presentation/components/Shared/Dialog.vue';
import IconButton from './IconButton.vue';
import MacOsInstructions from './MacOsInstructions.vue';
import { Environment } from '@/application/Environment/Environment';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CodeRunner } from '@/infrastructure/CodeRunner';
import { IApplicationContext } from '@/application/Context/IApplicationContext';

@Component({
  components: {
    IconButton,
    MacOsInstructions,
    Dialog,
  },
})
export default class TheCodeButtons extends StatefulVue {
  public readonly isDesktopVersion = Environment.CurrentEnvironment.isDesktop;
  public canRun = false;
  public hasCode = false;
  public isMacOsCollection = false;
  public fileName = '';

  public async copyCode() {
    const code = await this.getCurrentCode();
    Clipboard.copyText(code.current);
  }
  public async saveCode() {
    const context = await this.getCurrentContext();
    saveCode(this.fileName, context.state);
    if (this.isMacOsCollection) {
      (this.$refs.instructionsDialog as any).show();
    }
  }
  public async executeCode() {
    const context = await this.getCurrentContext();
    await executeCode(context);
  }

  protected handleCollectionState(newState: ICategoryCollectionState): void {
    this.canRun = this.isDesktopVersion && newState.collection.os === Environment.CurrentEnvironment.os;
    this.isMacOsCollection = newState.collection.os === OperatingSystem.macOS;
    this.fileName = buildFileName(newState.collection.scripting);
    this.react(newState.code);
  }

  private async getCurrentCode(): Promise<IApplicationCode> {
    const context = await this.getCurrentContext();
    const code = context.state.code;
    return code;
  }
  private async react(code: IApplicationCode) {
    this.hasCode = code.current && code.current.length > 0;
    this.events.unsubscribeAll();
    this.events.register(code.changed.on((newCode) => {
      this.hasCode = newCode && newCode.code.length > 0;
    }));
  }
}

function saveCode(fileName: string, state: ICategoryCollectionState) {
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

async function executeCode(context: IApplicationContext) {
  const runner = new CodeRunner();
  await runner.runCode(
    /*code*/ context.state.code.current,
    /*appName*/ context.app.info.name,
    /*fileExtension*/ context.state.collection.scripting.fileExtension,
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
