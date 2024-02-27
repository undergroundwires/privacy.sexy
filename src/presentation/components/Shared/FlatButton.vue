<template>
  <!-- Use `button` instead of DIV as it is semantically correct and accessibility best-practice -->
  <button
    v-non-collapsing
    type="button"
    class="flat-button"
    :class="{
      disabled,
    }"
    @click="onClicked"
  >
    <AppIcon v-if="icon" :icon="icon" />
    <span v-if="label">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { NonCollapsing } from '@/presentation/components/Scripts/View/Cards/NonCollapsingDirective';
import type { IconName } from '@/presentation/components/Shared/Icon/IconName';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';

export default defineComponent({
  components: { AppIcon },
  directives: { NonCollapsing },
  props: {
    label: {
      type: String,
      default: undefined,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    icon: {
      type: String as PropType<IconName | undefined>,
      default: undefined,
      required: false,
    },
  },
  emits: [
    'click',
  ],
  setup(props, { emit }) {
    function onClicked() {
      if (props.disabled) {
        return;
      }
      emit('click');
    }
    return { onClicked };
  },
});

</script>

<style lang="scss" scoped>
@use "@/presentation/assets/styles/main" as *;

.flat-button {
  display: inline-flex;
  gap: 0.5em;
  &.disabled {
    @include flat-button($disabled: true);
  }
  &:not(.disabled) {
    @include flat-button($disabled: false);
  }
}
</style>
