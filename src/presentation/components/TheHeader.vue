<template>
    <div id="container">
      <h1 class="child title" >{{ title }}</h1>
      <h2 class="child subtitle">Enforce privacy &amp; security on Windows and macOS</h2>
    </div>
</template>

<script lang="ts">
import { ApplicationFactory } from '@/application/ApplicationFactory';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class TheHeader extends Vue {
  public title = '';
  public subtitle = '';

  public async created() {
    const app = await ApplicationFactory.Current.getAppAsync();
    this.title = app.info.name;
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
    text-transform: uppercase;
    font-family: $main-font;
    font-size: 2.5em;
    line-height: 1.1;
  }
  .subtitle {
    margin: 0;
    font-size: 1.5em;
    color: $color-primary;
    font-family: $artistic-font;
    font-weight: 500;
    line-height: 1.2;
  }
}
 
</style>
