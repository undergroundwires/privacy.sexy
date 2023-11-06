<template>
  <div
    class="inline-icon"
    v-html="svgContent"
    @click="onClicked"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  inject,
} from 'vue';
import { useSvgLoader } from './UseSvgLoader';
import { IconName } from './IconName';

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
.inline-icon {
  display: inline-block;
  :deep(svg) { // using :deep because when v-html is used the content doesn't go through Vue's template compiler.
    display: inline-block;
    height: 1em;
    overflow: visible;
    vertical-align: -0.125em;
  }
}
</style>
