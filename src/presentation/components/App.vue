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
import { defineAsyncComponent, defineComponent, Component } from 'vue';
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

#app {
  margin-right: auto;
  margin-left: auto;
  max-width: 1600px;
  .app__wrapper {
    margin: 0% 2% 0% 2%;
    background-color: $color-surface;
    color: $color-on-surface;
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.06);
    padding: 2%;
    display:flex;
    flex-direction: column;
    .app__row {
      margin-bottom: 10px;
    }
    .app__code-buttons {
      padding-bottom: 10px;
    }
  }
}
</style>
