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
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;

  &__content {
    margin: 5%;
  }

  .dialog__close-button {
    color: $color-primary-dark;
    width: auto;
    font-size: $font-size-absolute-large;
    margin-right: 0.25em;
    align-self: flex-start;
  }
}
</style>
