<template>
  <section>
    <p class="privacy-rating">
      Privacy: <CircleRating :rating="privacyRating" />
    </p>
    <hr />
    <p>
      {{ description }}
    </p>
    <p class="recommendation">
      <AppIcon icon="lightbulb" class="icon" />
      <span>{{ recommendation }}</span>
    </p>
    <p
      v-if="includes?.length > 0"
      class="includes"
    >
      <AppIcon icon="square-check" class="icon" />
      <span>
        Includes:
        <ul>
          <li
            v-for="inclusionItem in includes"
            :key="inclusionItem"
          >
            {{ inclusionItem }}
          </li>
        </ul>
      </span>
    </p>
    <p
      v-if="considerations?.length > 0"
      class="considerations"
    >
      <AppIcon icon="triangle-exclamation" class="icon" />
      <span>
        <strong>Considerations:</strong>
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
import { PropType, defineComponent } from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import CircleRating from './Rating/CircleRating.vue';

export default defineComponent({
  components: {
    CircleRating,
    AppIcon,
  },
  props: {
    privacyRating: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
    },
    includes: {
      type: Array as PropType<ReadonlyArray<string>>,
      default: () => [],
    },
    considerations: {
      type: Array as PropType<ReadonlyArray<string>>,
      default: () => [],
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

.privacy-rating {
  text-align: center;
}

.includes {
  @include horizontal-stack;
  @include apply-icon-color($color-success);
}
.considerations {
  @include horizontal-stack;
  @include apply-icon-color($color-danger);
}
.recommendation {
  @include horizontal-stack;
  @include apply-icon-color($color-caution);
  align-items: center;
}
</style>
