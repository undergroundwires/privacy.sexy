<template>
  <div id="app">
    <div class="app__wrapper">
      <TheHeader class="app__row" />
      <TheSearchBar class="app__row" />
      <TheScriptArea class="app__row" />
      <TheCodeButtons class="app__row app__code-buttons" />
      <TheFooter />
    </div>
    <component
      :is="devToolkitComponent"
      v-if="devToolkitComponent"
    />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, type Component } from 'vue';
import TheHeader from '@/presentation/components/TheHeader.vue';
import TheFooter from '@/presentation/components/TheFooter/TheFooter.vue';
import TheCodeButtons from '@/presentation/components/Code/CodeButtons/TheCodeButtons.vue';
import TheScriptArea from '@/presentation/components/Scripts/TheScriptArea.vue';
import TheSearchBar from '@/presentation/components/TheSearchBar.vue';

export default defineComponent({
  components: {
    TheHeader,
    TheCodeButtons,
    TheScriptArea,
    TheSearchBar,
    TheFooter,
  },
  setup() {
    const devToolkitComponent = getOptionalDevToolkitComponent();

    return {
      devToolkitComponent,
    };
  },
});

function getOptionalDevToolkitComponent(): Component | undefined {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (!isDevelopment) {
    return undefined;
  }
  return defineAsyncComponent(() => import('@/presentation/components/DevToolkit/DevToolkit.vue'));
}
</script>

<style lang="scss">
@use "@/presentation/assets/styles/main" as *;
@use 'sass:math';

@mixin responsive-spacing {
  // Avoid using percentage-based values for spacing the avoid unintended layout shifts.
  margin-left: $spacing-absolute-medium;
  margin-right: $spacing-absolute-medium;
  padding: $spacing-absolute-xx-large;
  @media screen and (max-width: $media-screen-big-width) {
    margin-left: $spacing-absolute-small;
    margin-right: $spacing-absolute-small;
    padding: $spacing-absolute-x-large;
  }
  @media screen and (max-width: $media-screen-medium-width) {
    margin-left: $spacing-absolute-x-small;
    margin-right: $spacing-absolute-x-small;
    padding: $spacing-absolute-medium;
  }
  @media screen and (max-width: $media-screen-small-width) {
    margin-left: 0;
    margin-right: 0;
    padding: $spacing-absolute-small;
  }
}

#app {
  margin-right: auto;
  margin-left: auto;
  max-width: 1600px;

  .app__wrapper {
    display:flex;
    flex-direction: column;

    background-color: $color-surface;
    color: $color-on-surface;
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.06);

    @include responsive-spacing;

    .app__row {
      margin-bottom: $spacing-absolute-large;
    }
    .app__code-buttons {
      padding-bottom: $spacing-absolute-medium;
    }
  }
}
</style>
