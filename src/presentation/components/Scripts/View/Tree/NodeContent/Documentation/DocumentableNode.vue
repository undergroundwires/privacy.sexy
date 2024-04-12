<template>
  <div class="container">
    <div class="header">
      <div class="content">
        <slot />
      </div>
      <ToggleDocumentationButton
        v-if="docs && docs.length > 0"
        @show="isExpanded = true"
        @hide="isExpanded = false"
      />
    </div>
    <ExpandCollapseTransition>
      <div
        v-if="docs && docs.length > 0 && isExpanded"
        class="docs"
        :class="{
          'docs-expanded': isExpanded,
          'docs-collapsed': !isExpanded,
        }"
      >
        <DocumentationText
          :docs="docs"
          class="text"
          :class="{
            expanded: isExpanded,
            collapsed: !isExpanded,
          }"
        />
      </div>
    </ExpandCollapseTransition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';
import ExpandCollapseTransition from '@/presentation/components/Shared/ExpandCollapse/ExpandCollapseTransition.vue';
import DocumentationText from './DocumentationText.vue';
import ToggleDocumentationButton from './ToggleDocumentationButton.vue';

export default defineComponent({
  components: {
    DocumentationText,
    ToggleDocumentationButton,
    ExpandCollapseTransition,
  },
  props: {
    docs: {
      type: Array as PropType<readonly string[]>,
      required: true,
    },
  },
  setup() {
    const isExpanded = ref(false);

    return {
      isExpanded,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.container {
  display: flex;
  flex-direction: column;
  flex: 1; // Expands the container to fill available horizontal space, enabling alignment of child items.
  max-width: 100%; // Prevents horizontal expansion of inner content (e.g., when a code block is shown)
  *:not(:first-child) {
    margin-left: $spacing-absolute-small;
  }
  .header {
    display: flex;
    flex-direction: row;
    .content {
      flex: 1; // Expands the content to fill available width, aligning the documentation button to the right.
    }
  }
  .docs {
    background: $color-primary-darkest;
    margin-top: $spacing-relative-x-small;
    color: $color-on-primary;
    text-transform: none;
    padding: $spacing-absolute-medium;
    &-collapsed {
      display: none;
    }
    cursor: auto;
    user-select: text;
  }
}
</style>
