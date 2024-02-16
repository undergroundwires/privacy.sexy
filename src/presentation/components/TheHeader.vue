<template>
  <div class="container">
    <h1 class="child brand">
      {{ title }}
    </h1>
    <h2 class="child slogan">
      <!--
        Keep the slogan without a period for impact and continuity.
        Slogans should be punchy and memorable, not punctuated like full sentences.
      -->
      {{ subtitle }}
    </h2>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';

export default defineComponent({
  setup() {
    const { projectDetails } = injectKey((keys) => keys.useApplication);

    const title = computed(() => projectDetails.name);
    const subtitle = computed(() => projectDetails.slogan);

    return {
      title,
      subtitle,
    };
  },
});

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.container {
  display: flex;
  align-items: center;
  flex-direction: column;

  .child {
    display: flex;
    text-align: center;
  }

  .brand {
    margin: 0;
    text-transform: uppercase;
    font-family: $font-family-logo;
    font-size: $font-size-absolute-xx-large;
  }
  .slogan {
    margin: 0;
    font-size: $font-size-absolute-x-large;
    color: $color-primary;
    font-family: $font-family-cursive;
    font-weight: normal; // Resets the browser default bold (700) font weight for <h/> elements
  }
}
</style>
