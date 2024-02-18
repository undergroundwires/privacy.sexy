<template>
  <transition
    @enter="onTransitionEnter"
    @leave="onTransitionLeave"
  >
    <slot />
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useExpandCollapseAnimation } from './UseExpandCollapseAnimation';

export default defineComponent({
  setup() {
    const { collapse, expand } = useExpandCollapseAnimation();

    async function onTransitionEnter(element: Element, done: () => void) {
      await collapse(element);
      done();
    }

    async function onTransitionLeave(element: Element, done: () => void) {
      await expand(element);
      done();
    }

    return {
      onTransitionEnter,
      onTransitionLeave,
    };
  },
});
</script>
./UseExpandCollapseAnimation
