<template>
  <transition name="card-expand-collapse-transition">
    <slot />
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  // Empty component for ESLint compatibility, workaround for https://github.com/vuejs/vue-eslint-parser/issues/125.
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.card-expand-collapse-transition-enter-active {
  transition:
    opacity 0.3s ease-in-out,
    max-height 0.3s ease-in-out;
}

.card-expand-collapse-transition-enter-from {
  opacity: 0; // Fade-in
  max-height: 0; // Expand
}
</style>
