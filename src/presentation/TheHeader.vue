<template>
    <div id="container">
      <h1 class="child title" >{{ title }}</h1>
      <h2 class="child subtitle">Enforce privacy & security on Windows</h2>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { StatefulVue } from './StatefulVue';

@Component
export default class TheHeader extends StatefulVue {
  public title = '';
  public subtitle = '';

  public async mounted() {
    const state = await this.getCurrentStateAsync();
    this.title = state.app.name;
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";
#container {
  display: flex;
  align-items: center;
  flex-direction: column;

  .child {
    display: flex;
    text-align: center;
  }

  .title {
    margin: 0;
    color: $black;
    text-transform: uppercase;
    font-family: $main-font;
    font-size: 2.5em;
    line-height: 1.1;
  }
  .subtitle {
    margin: 0;
    font-size: 1.5em;
    color: $gray;
    font-family: $artistic-font;
    font-weight: 500;
    line-height: 1.2;
  }
}
 
</style>
