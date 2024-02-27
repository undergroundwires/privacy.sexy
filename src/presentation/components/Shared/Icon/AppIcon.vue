<template>
  <div
    class="icon-container"
    @click="onClicked"
  >
    <!-- eslint-disable vue/no-v-html -->
    <div class="inline-icon" v-html="svgContent" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  type PropType,
  inject,
} from 'vue';
import { useSvgLoader } from './UseSvgLoader';
import type { IconName } from './IconName';

export default defineComponent({
  props: {
    icon: {
      type: String as PropType<IconName>,
      required: true,
    },
  },
  emits: [
    'click',
  ],
  setup(props, { emit }) {
    const useSvgLoaderHook = inject('useSvgLoaderHook', useSvgLoader);

    const { svgContent } = useSvgLoaderHook(() => props.icon);

    function onClicked() {
      emit('click');
    }

    return { svgContent, onClicked };
  },
});

</script>

<style lang="scss" scoped>
.icon-container {
  display: inline-block;
  .inline-icon {
    :deep(svg) { // using :deep because when v-html is used the content doesn't go through Vue's template compiler.
      height: 1em;
      overflow: visible;
      vertical-align: -0.125em;
    }
  }
}
</style>
