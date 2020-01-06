<template>
    <div id="container">
      <h1 class="child title" >{{ title }}</h1>
      <h2 class="child subtitle">{{ subtitle }}</h2>
      <a :href="githubUrl" target="_blank" class="child github" >
          <font-awesome-icon :icon="['fab', 'github']" size="3x"  />
      </a>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatefulVue } from './StatefulVue';

@Component
export default class TheHeader extends StatefulVue {
  private title: string = '';
  private subtitle: string = '';
  @Prop() private githubUrl!: string;

  public async mounted() {
    const state = await this.getCurrentStateAsync();
    this.title = state.app.name;
    this.subtitle = 'Enforce privacy & security on Windows';
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
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
    font-size: 2.5em;
    font-weight: 500;
    line-height: 1.1;
  }
  .subtitle {
    margin: 0;
    font-size: 1.5em;
    color: $gray;
    font-family: 'Yesteryear', cursive;
    font-weight: 500;
    line-height: 1.2;
  }
  .github {
    color:inherit;
    cursor: pointer;
    &:hover {
        opacity: 0.9;
    }
  }
}
 
</style>
