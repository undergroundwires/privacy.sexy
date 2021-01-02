<template>
    <div class="container" v-if="hasCode">
        <IconButton
            :text="this.isDesktop ? 'Save' : 'Download'"
            v-on:click="saveCodeAsync"
            icon-prefix="fas" 
            :icon-name="this.isDesktop ? 'save' : 'file-download'">
        </IconButton>
        <IconButton
            text="Copy"
            v-on:click="copyCodeAsync"
            icon-prefix="fas" icon-name="copy">
        </IconButton>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { StatefulVue } from './StatefulVue';
import { SaveFileDialog, FileType } from '@/infrastructure/SaveFileDialog';
import { Clipboard } from '@/infrastructure/Clipboard';
import IconButton from './IconButton.vue';
import { Environment } from '@/application/Environment/Environment';
import { IApplicationCode } from '@/application/Context/State/ICategoryCollectionState';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { IApplicationContext } from '@/application/Context/IApplicationContext';

@Component({
  components: {
    IconButton,
  },
})
export default class TheCodeButtons extends StatefulVue {
  public hasCode = false;
  public isDesktop = false;

  public async mounted() {
    const code = await this.getCurrentCodeAsync();
    this.hasCode = code.current && code.current.length > 0;
    code.changed.on((newCode) => {
      this.hasCode = newCode && newCode.code.length > 0;
    });
    this.isDesktop = Environment.CurrentEnvironment.isDesktop;
  }

  public async copyCodeAsync() {
      const code = await this.getCurrentCodeAsync();
      Clipboard.copyText(code.current);
  }

  public async saveCodeAsync() {
      const context = await this.getCurrentContextAsync();
      saveCode(context);
  }

  private async getCurrentCodeAsync(): Promise<IApplicationCode> {
    const context = await this.getCurrentContextAsync();
    const code = context.state.code;
    return code;
  }
}

function saveCode(context: IApplicationContext) {
      const fileName = `privacy-script.${context.collection.scripting.fileExtension}`;
      const content = context.state.code.current;
      const type = getType(context.collection.scripting.language);
      SaveFileDialog.saveFile(content, fileName, type);
}

function getType(language: ScriptingLanguage) {
  switch (language) {
    case ScriptingLanguage.batchfile:
      return FileType.BatchFile;
    default:
      throw new Error('unknown file type');
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";

.container {
    display: flex;
    flex-direction: row;
    justify-content: center;
}
.container > * + * {
  margin-left: 30px;
}

</style>
