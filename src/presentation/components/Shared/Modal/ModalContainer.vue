<template>
  <div
    v-if="isRendered"
    class="modal-container"
  >
    <ModalOverlay
      :show="isOpen"
      @transitioned-out="onOverlayTransitionedOut"
      @click="onBackgroundOverlayClick"
    />
    <ModalContent
      :show="isOpen"
      @transitioned-out="onContentTransitionedOut"
    >
      <slot />
    </ModalContent>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, watchEffect,
  nextTick, inject,
} from 'vue';
import ModalOverlay from './ModalOverlay.vue';
import ModalContent from './ModalContent.vue';
import { useLockBodyBackgroundScroll } from './Hooks/ScrollLock/UseLockBodyBackgroundScroll';
import { useCurrentFocusToggle } from './Hooks/UseCurrentFocusToggle';
import { useEscapeKeyListener } from './Hooks/UseEscapeKeyListener';
import { useAllTrueWatcher } from './Hooks/UseAllTrueWatcher';

export const INJECTION_KEY_ESCAPE_LISTENER = Symbol('useEscapeKeyListener');

export default defineComponent({
  components: {
    ModalOverlay,
    ModalContent,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    closeOnOutsideClick: {
      type: Boolean,
      default: true,
    },
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    'update:modelValue': (isOpen: boolean) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(props, { emit }) {
    const listenEscapeKey: typeof useEscapeKeyListener = inject(
      INJECTION_KEY_ESCAPE_LISTENER,
      useEscapeKeyListener,
    );

    const isRendered = ref(false);
    const isOpen = ref(false);
    const overlayTransitionedOut = ref(false);
    const contentTransitionedOut = ref(false);

    useLockBodyBackgroundScroll(isOpen);
    useCurrentFocusToggle(isOpen);
    listenEscapeKey(() => handleEscapeKeyUp());

    const {
      onAllConditionsMet: onModalFullyTransitionedOut,
      resetAllConditions: resetTransitionStatus,
    } = useAllTrueWatcher(overlayTransitionedOut, contentTransitionedOut);

    onModalFullyTransitionedOut(() => {
      isRendered.value = false;
      resetTransitionStatus();
      if (props.modelValue) {
        emit('update:modelValue', false);
      }
    });

    watchEffect(() => {
      if (props.modelValue) {
        open();
      } else {
        close();
      }
    });

    function onOverlayTransitionedOut() {
      overlayTransitionedOut.value = true;
    }

    function onContentTransitionedOut() {
      contentTransitionedOut.value = true;
    }

    function handleEscapeKeyUp() {
      close();
    }

    function close() {
      if (!isRendered.value) {
        return;
      }

      isOpen.value = false;

      if (props.modelValue) {
        emit('update:modelValue', false);
      }
    }

    function open() {
      if (isRendered.value) {
        return;
      }

      isRendered.value = true;

      nextTick(() => { // Let the modal render first
        isOpen.value = true;
      });

      if (!props.modelValue) {
        emit('update:modelValue', true);
      }
    }

    function onBackgroundOverlayClick() {
      if (props.closeOnOutsideClick) {
        close();
      }
    }

    return {
      isRendered,
      onBackgroundOverlayClick,
      onOverlayTransitionedOut,
      onContentTransitionedOut,
      isOpen,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.modal-container {
  position: fixed;
  box-sizing: border-box;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 999;
}
</style>
