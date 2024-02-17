<template>
  <li class="step">
    <slot />
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InstructionSteps', // Define component name for empty component for Vue build and ESLint compatibility.
});
</script>

<style scoped lang="scss">
</style>
