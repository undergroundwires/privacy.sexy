<template>
  <transition
    name="modal-overlay-transition"
    @after-leave="onAfterTransitionLeave"
  >
    <div
      v-if="show"
      class="modal-overlay-background"
      aria-expanded="true"
      @click.self.stop="onClick"
    />
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'click',
    'transitionedOut',
  ],
  setup(_, { emit }) {
    function onAfterTransitionLeave() {
      emit('transitionedOut');
    }

    function onClick() {
      emit('click');
    }

    return {
      onAfterTransitionLeave,
      onClick,
    };
  },
});

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$modal-overlay-transition-duration: 50ms;
$modal-overlay-color-background: $color-on-surface;

.modal-overlay-background {
  position: fixed;
  box-sizing: border-box;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  background: rgba($modal-overlay-color-background, 0.3);
  opacity: 1;
}

@include fade-slide-transition('modal-overlay-transition', $modal-overlay-transition-duration);
</style>
