<template>
  <div id="container">
    <h1 class="child title" >{{ title }}</h1>
    <h2 class="child subtitle">Enforce privacy &amp; security on Windows and macOS</h2>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ApplicationFactory } from '@/application/ApplicationFactory';

@Component
export default class TheHeader extends Vue {
  public title = '';

  public subtitle = '';

  public async created() {
    const app = await ApplicationFactory.Current.getApp();
    this.title = app.info.name;
  }
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

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
    text-transform: uppercase;
    font-family: $font-main;
    font-size: 2.5em;
    line-height: 1.1;
  }
  .subtitle {
    margin: 0;
    font-size: 1.5em;
    color: $color-primary;
    font-family: $font-artistic;
    font-weight: 500;
    line-height: 1.2;
  }
}
</style>
