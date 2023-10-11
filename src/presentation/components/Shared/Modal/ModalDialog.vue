<template>
  <ModalContainer
    v-model="showDialog"
  >
    <div class="dialog">
      <div class="dialog__content">
        <slot />
      </div>
      <div
        class="dialog__close-button"
        @click="hide"
      >
        <AppIcon icon="xmark" />
      </div>
    </div>
  </ModalContainer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import ModalContainer from './ModalContainer.vue';

export default defineComponent({
  components: {
    ModalContainer,
    AppIcon,
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    input: (isOpen: boolean) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showDialog = computed({
      get: () => props.value,
      set: (value) => {
        if (value !== props.value) {
          emit('input', value);
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

  &__close-button {
    color: $color-primary-dark;
    width: auto;
    font-size: 1.5em;
    margin-right: 0.25em;
    align-self: flex-start;
    @include clickable;
    @include hover-or-touch {
      color: $color-primary;
    }
  }
}
</style>
