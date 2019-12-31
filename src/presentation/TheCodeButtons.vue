<template>
    <div class="container" v-if="hasCode">
        <IconButton
            text="Copy"
            v-on:click="copyCodeAsync"
            icon-prefix="fas" icon-name="copy">
        </IconButton>
        <IconButton
            text="Download"
            v-on:click="saveCodeAsync"
            icon-prefix="fas" icon-name="file-download">
        </IconButton>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatefulVue, IApplicationState } from './StatefulVue';
import { SaveFileDialog } from './../infrastructure/SaveFileDialog';
import { Clipboard } from './../infrastructure/Clipboard';
import IconButton from './IconButton.vue';


@Component({
  components: {
    IconButton,
  },
})
export default class TheCodeButtons extends StatefulVue {
  public hasCode = false;

  public async mounted() {
    const state = await this.getCurrentStateAsync();
    this.hasCode = state.code.current && state.code.current.length > 0;
    state.code.changed.on((code) => {
      this.hasCode = code && code.length > 0;
    });
  }

  public async copyCodeAsync() {
      const state = await this.getCurrentStateAsync();
      Clipboard.copyText(state.code.current);
  }

  public async saveCodeAsync() {
      const state = await this.getCurrentStateAsync();
      SaveFileDialog.saveText(state.code.current, 'privacy-script.bat');
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
