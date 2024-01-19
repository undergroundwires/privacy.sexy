<template>
  <ol>
    <slot />
  </ol>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InstructionSteps', // Define component name for empty component for Vue build and ESLint compatibility.
});
</script>
