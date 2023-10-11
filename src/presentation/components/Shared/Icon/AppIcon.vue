<template>
  <div v-html="svgContent" class="inline-icon" />
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
  setup(props) {
    const useSvgLoaderHook = inject('useSvgLoaderHook', useSvgLoader);
    const { svgContent } = useSvgLoaderHook(() => props.icon);
    return { svgContent };
  },
});

</script>

<style lang="scss" scoped>
.inline-icon {
  display: inline-block;
  ::v-deep svg { // using ::v-deep because when v-html is used the content doesn't go through Vue's template compiler.
    display: inline-block;
    height: 1em;
    overflow: visible;
    vertical-align: -0.125em;
  }
}
</style>
