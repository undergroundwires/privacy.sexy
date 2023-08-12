<template>
  <span> <!-- Parent wrapper allows adding content inside with CSS without making it clickable -->
    <span
      v-bind:class="{
        disabled: !enabled,
        enabled: enabled,
      }"
      v-non-collapsing
      @click="onClicked()">{{label}}</span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NonCollapsing } from '@/presentation/components/Scripts/View/Cards/NonCollapsingDirective';

export default defineComponent({
  directives: { NonCollapsing },
  props: {
    enabled: {
      type: Boolean,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  emits: [
    'click',
  ],
  setup(props, { emit }) {
    const onClicked = () => {
      if (!props.enabled) {
        return;
      }
      emit('click');
    };

    return {
      onClicked,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.enabled {
  @include clickable;
  @include hover-or-touch {
    font-weight:bold;
    text-decoration:underline;
  }
}
.disabled {
  color: $color-primary-light;
}
</style>
