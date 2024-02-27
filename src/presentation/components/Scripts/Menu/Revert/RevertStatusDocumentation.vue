<template>
  <section>
    <p class="description">
      <AppIcon :icon="icon" class="icon" />
      <span>{{ description }}</span>
    </p>
    <p
      v-if="considerations.length > 0"
      class="considerations"
    >
      <AppIcon icon="triangle-exclamation" class="icon" />
      <span>
        Considerations:
        <ul>
          <li
            v-for="considerationItem in considerations"
            :key="considerationItem"
          >
            {{ considerationItem }}
          </li>
        </ul>
      </span>
    </p>
  </section>
</template>

<script lang="ts">
import { type PropType, defineComponent } from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import type { IconName } from '@/presentation/components/Shared/Icon/IconName';

export default defineComponent({
  components: {
    AppIcon,
  },
  props: {
    icon: {
      type: String as PropType<IconName>,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    considerations: {
      type: Array as PropType<ReadonlyArray<string>>,
      required: true,
    },
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

@mixin horizontal-stack {
  display: flex;
  gap: 0.5em;
}

@mixin apply-icon-color($color) {
  .icon {
    color: $color;
  }
}

.considerations {
  @include horizontal-stack;
  @include apply-icon-color($color-caution);
}
.description {
  @include horizontal-stack;
  @include apply-icon-color($color-success);
  align-items: center;
}
</style>
