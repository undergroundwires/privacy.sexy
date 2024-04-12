<template>
  <button
    ref="handleElementRef"
    class="handle"
    type="button"
  >
    <div class="line" />
    <AppIcon
      class="icon"
      icon="left-right"
    />
    <div class="line" />
  </button>
</template>

<script lang="ts">
import { defineComponent, shallowRef, watch } from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { useDragHandler } from './UseDragHandler';
import { useGlobalCursor } from './UseGlobalCursor';

export default defineComponent({
  components: {
    AppIcon,
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    resized: (displacementX: number) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(_, { emit }) {
    const cursorCssValue = 'ew-resize';

    const handleElementRef = shallowRef<HTMLElement | undefined>();

    const { displacementX, isDragging } = useDragHandler(handleElementRef);

    useGlobalCursor(isDragging, cursorCssValue);

    watch(displacementX, (value) => {
      emit('resized', value);
    });

    return {
      handleElementRef,
      isDragging,
      cursorCssValue,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "@/presentation/assets/styles/main" as *;

$color          : $color-primary-dark;
$color-hover    : $color-primary;
$cursor         : v-bind(cursorCssValue);

.handle {
  @include reset-button;
  @include clickable($cursor: $cursor);
  @include hover-or-touch {
    .line {
      background: $color-hover;
    }
    .image {
      color: $color-hover;
    }
  }
  cursor: $cursor;

  display: flex;
  flex-direction: column;
  align-items: center;
  .line {
    flex: 1;
    background: $color;
    width: 3px;
  }
  .icon {
    color: $color;
  }
  margin-right: $spacing-absolute-small;
  margin-left: $spacing-absolute-small;
}
</style>
