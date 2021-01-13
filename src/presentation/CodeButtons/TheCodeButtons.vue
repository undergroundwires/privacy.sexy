<template>
    <div class="container" v-if="hasCode">
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
import { IApplication } from '@/domain/IApplication';
import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { IEventSubscription } from '@/infrastructure/Events/ISubscription';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';

@Component({
  components: {
    IconButton,
    MacOsInstructions,
  },
})
export default class TheCodeButtons extends StatefulVue {
  public readonly macOsModalName = 'macos-instructions';

  public hasCode = false;
  public isDesktopVersion = Environment.CurrentEnvironment.isDesktop;
  public isMacOsCollection = false;
  public fileName = '';

  private codeListener: IEventSubscription;

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
  public destroyed() {
    if (this.codeListener) {
      this.codeListener.unsubscribe();
    }
  }

  protected initialize(app: IApplication): void {
    return;
  }
  protected handleCollectionState(newState: ICategoryCollectionState): void {
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
    if (this.codeListener) {
      this.codeListener.unsubscribe();
    }
    this.codeListener = code.changed.on((newCode) => {
      this.hasCode = newCode && newCode.code.length > 0;
    });
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
