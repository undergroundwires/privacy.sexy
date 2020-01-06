<template>
    <div id="footer">
        {{text}}
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatefulVue } from './StatefulVue';

@Component
export default class TheFooter extends StatefulVue {
  private text: string = '';

  public async mounted() {
    const state = await this.getCurrentStateAsync();
    this.text = `v${state.app.version}`;
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";
#footer {
    color: $gray;
    font-size: 0.7em;
    font-family: $artistic-font;
    text-align: center;
}
</style>
