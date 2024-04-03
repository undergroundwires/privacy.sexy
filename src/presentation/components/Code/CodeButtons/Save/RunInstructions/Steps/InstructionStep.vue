<template>
  <li class="step">
    <slot />
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  // Empty component for ESLint compatibility, workaround for https://github.com/vuejs/vue-eslint-parser/issues/125.
});
</script>

<style scoped lang="scss">
</style>
