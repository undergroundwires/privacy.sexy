<template>
  <div id="container">
    <h1 class="child title">
      {{ title }}
    </h1>
    <h2 class="child subtitle">
      {{ subtitle }}
    </h2>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';

export default defineComponent({
  setup() {
    const { info } = injectKey((keys) => keys.useApplication);

    const title = computed(() => info.name);
    const subtitle = computed(() => info.slogan);

    return {
      title,
      subtitle,
    };
  },
});

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
    font-size: $font-size-absolute-xx-large;
  }
  .subtitle {
    margin: 0;
    font-size: $font-size-absolute-x-large;
    color: $color-primary;
    font-family: $font-artistic;
    font-weight: 500;
  }
}
</style>
