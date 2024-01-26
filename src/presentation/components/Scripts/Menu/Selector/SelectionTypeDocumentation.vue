<template>
  <div>
    <p class="privacy-rating">
      Privacy: <CircleRating :rating="privacyRating" />
    </p>
    <hr />
    <div class="sections">
      <section>
        {{ description }}
      </section>
      <section class="recommendation">
        <AppIcon icon="lightbulb" class="icon" />
        <span class="text">{{ recommendation }}</span>
      </section>
      <section
        v-if="includes?.length > 0"
        class="includes"
      >
        <AppIcon icon="square-check" class="icon" />
        <span class="text">
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
      </section>
      <section
        v-if="considerations?.length > 0"
        class="considerations"
      >
        <AppIcon icon="triangle-exclamation" class="icon" />
        <span class="text">
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
      </section>
    </div>
  </div>
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

.privacy-rating {
  margin: 0.5em;
  text-align: center;
}
hr {
  margin: 1em 0;
  opacity: 0.6;
}
ul {
  @include reset-ul;
  padding-left: 0em;
  margin-top: 0.25em;
  list-style: disc;
  li {
    line-height: 1.2em;
  }
}
.sections {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  margin-bottom: 0.75em;
  .includes {
    display: flex;
    gap: 0.5em;
    font-weight: 500;
    .icon {
      color: $color-success;
    }
  }

  .considerations {
    display: flex;
    gap: 0.5em;
    .text {
      font-weight: 500;
    }
    .icon {
      color: $color-danger;
    }
  }
  .recommendation {
    display: flex;
    align-items: center;
    gap: 0.5em;
    .icon {
      color: $color-caution;
    }
  }
}
</style>
