<template>
  <span>
    <!--
      Parent wrapper allows `MenuOptionList` to safely add content inside
      such as adding content in `::before` block without making it clickable.
    -->
    <span
      v-non-collapsing
      :class="{
        disabled: !enabled,
        enabled: enabled,
      }"
      @click="onClicked()"
    >{{ label }}</span>
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
