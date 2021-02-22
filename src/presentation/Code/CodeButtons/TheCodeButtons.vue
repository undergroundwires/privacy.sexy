<template>
    <div class="container" v-if="hasCode">
        <IconButton
            v-if="this.canRun"
            text="Run"
            v-on:click="executeCodeAsync"
            icon-prefix="fas" icon-name="play">
        </IconButton>
        <IconButton
            :text="this.isDesktopVersion ? 'Save' : 'Download'"
            v-on:click="saveCodeAsync"
            icon-prefix="fas" 
            :icon-name="this.isDesktopVersion ? 'save' : 'file-download'">
        </IconButton>
        <IconButton
            text="Copy"
            v-on:click="copyCodeAsync"
            icon-prefix="fas" icon-name="copy">
        </IconButton>
        <modal :name="macOsModalName" height="auto" :scrollable="true" :adaptive="true"
          v-if="this.isMacOsCollection">
          <div class="modal">
            <div class="modal__content">
                <MacOsInstructions :fileName="this.fileName" />
            </div>
            <div class="modal__close-button">
              <font-awesome-icon :icon="['fas', 'times']"  @click="$modal.hide(macOsModalName)"/>
            </div>
          </div>
        </modal>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import { SaveFileDialog, FileType } from '@/infrastructure/SaveFileDialog';
import { Clipboard } from '@/infrastructure/Clipboard';
import IconButton from './IconButton.vue';
import MacOsInstructions from './MacOsInstructions.vue';
import { Environment } from '@/application/Environment/Environment';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { runCodeAsync } from '@/infrastructure/CodeRunner';
import { IApplicationContext } from '@/application/Context/IApplicationContext';

@Component({
  components: {
    IconButton,
    MacOsInstructions,
  },
})
export default class TheCodeButtons extends StatefulVue {
  public readonly macOsModalName = 'macos-instructions';

  public readonly isDesktopVersion = Environment.CurrentEnvironment.isDesktop;
  public canRun = false;
  public hasCode = false;
  public isMacOsCollection = false;
  public fileName = '';

  public async copyCodeAsync() {
    const code = await this.getCurrentCodeAsync();
    Clipboard.copyText(code.current);
  }
  public async saveCodeAsync() {
    const context = await this.getCurrentContextAsync();
    saveCode(this.fileName, context.state);
    if (this.isMacOsCollection) {
      this.$modal.show(this.macOsModalName);
    }
  }
  public async executeCodeAsync() {
    const context = await this.getCurrentContextAsync();
    await executeCodeAsync(context);
  }

  protected handleCollectionState(newState: ICategoryCollectionState): void {
    this.canRun = this.isDesktopVersion && newState.collection.os === Environment.CurrentEnvironment.os;
    this.isMacOsCollection = newState.collection.os === OperatingSystem.macOS;
    this.fileName = buildFileName(newState.collection.scripting);
    this.react(newState.code);
  }

  private async getCurrentCodeAsync(): Promise<IApplicationCode> {
    const context = await this.getCurrentContextAsync();
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

async function executeCodeAsync(context: IApplicationContext) {
    await runCodeAsync(
        /*code*/ context.state.code.current,
        /*appName*/ context.app.info.name,
        /*fileExtension*/ context.state.collection.scripting.fileExtension,
      );
}

</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";

.container {
    display: flex;
    flex-direction: row;
    justify-content: center;
}
.container > * + * {
  margin-left: 30px;
}
.modal {
    font-family: $normal-font;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;

    &__content {
      width: 100%;
      margin: 5%;
    }

    &__close-button {
      width: auto;
      font-size: 1.5em;
      margin-right:0.25em;
      align-self: flex-start;
      cursor: pointer;
      &:hover {
        opacity: 0.9;
      }
    }
}
</style>
