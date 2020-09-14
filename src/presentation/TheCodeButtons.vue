<template>
    <div class="container" v-if="hasCode">
        </IconButton>
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

@Component({
  components: {
    IconButton,
  },
})
export default class TheCodeButtons extends StatefulVue {
  public hasCode = false;
  public isDesktop = false;

  public async mounted() {
    const state = await this.getCurrentStateAsync();
    this.isDesktop = Environment.CurrentEnvironment.isDesktop;
    this.hasCode = state.code.current && state.code.current.length > 0;
    state.code.changed.on((code) => {
      this.hasCode = code && code.code.length > 0;
    });
  }

  public async copyCodeAsync() {
      const state = await this.getCurrentStateAsync();
      Clipboard.copyText(state.code.current);
  }

  public async saveCodeAsync() {
      const state = await this.getCurrentStateAsync();
      SaveFileDialog.saveFile(state.code.current, 'privacy-script.bat', FileType.BatchFile);
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
