<template>
  <div>
    <div class="sections">
      <section class="description">
        <AppIcon :icon="icon" class="icon" />
        <span class="text">{{ description }}</span>
      </section>
      <section
        v-if="considerations.length > 0"
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
import { IconName } from '@/presentation/components/Shared/Icon/IconName';

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
  .considerations {
    display: flex;
    gap: 0.5em;
    .icon {
      color: $color-caution;
    }
  }
  .description {
    display: flex;
    align-items: center;
    gap: 0.5em;
    .icon {
      color: $color-success;
    }
  }
}
</style>
