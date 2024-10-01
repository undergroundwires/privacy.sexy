<template>
  <ModalContainer
    v-model="showDialog"
  >
    <div class="dialog">
      <div class="dialog__content">
        <slot />
      </div>
      <FlatButton
        icon="xmark"
        class="dialog__close-button"
        @click="hide"
      />
    </div>
  </ModalContainer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import FlatButton from '@/presentation/components/Shared/FlatButton.vue';
import ModalContainer from './ModalContainer.vue';

export default defineComponent({
  components: {
    ModalContainer,
    FlatButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    'update:modelValue': (isOpen: boolean) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(props, { emit }) {
    const showDialog = computed({
      get: () => props.modelValue,
      set: (value) => {
        if (value !== props.modelValue) {
          emit('update:modelValue', value);
        }
      },
    });

    function hide() {
      showDialog.value = false;
    }

    return {
      showDialog,
      hide,
    };
  },
});

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.dialog {
  margin-bottom: $spacing-absolute-medium;
  display: flex;
  flex-direction: row;

  &__content {
    margin: $spacing-absolute-xx-large;
    @media screen and (max-width: $media-screen-big-width) {
      margin: $spacing-absolute-x-large;
    }
    @media screen and (max-width: $media-screen-medium-width) {
      margin: $spacing-absolute-large;
    }
  }

  .dialog__close-button {
    color: $color-primary-dark;
    width: auto;
    font-size: $font-size-absolute-large;
    margin-right: $spacing-absolute-small;

    @mixin keep-visible-above-scrollbar { // Prevents close button from being obscured by scrollbar on small screens.
      position: absolute;
      top: 0;
      right: 0; // Aligns right
    }

    @include keep-visible-above-scrollbar;
  }
}
</style>
