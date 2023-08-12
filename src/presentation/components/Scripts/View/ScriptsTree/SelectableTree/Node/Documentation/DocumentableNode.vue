<template>
  <div class="container">
    <div class="header">
      <div class="content">
        <slot />
      </div>
      <ToggleDocumentationButton
        v-if="docs && docs.length > 0"
        v-on:show="isExpanded = true"
        v-on:hide="isExpanded = false"
      />
    </div>
    <div
      v-if="docs && docs.length > 0 && isExpanded"
      class="docs"
      v-bind:class="{ 'docs-expanded': isExpanded, 'docs-collapsed': !isExpanded }"
    >
      <DocumentationText
        :docs="docs"
        class="text"
        v-bind:class="{
          expanded: isExpanded,
          collapsed: !isExpanded,
        }" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import DocumentationText from './DocumentationText.vue';
import ToggleDocumentationButton from './ToggleDocumentationButton.vue';

export default defineComponent({
  components: {
    DocumentationText,
    ToggleDocumentationButton,
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
  *:not(:first-child) {
    margin-left: 5px;
  }
  .header {
    display: flex;
    flex-direction: row;
    .content {
        flex: 1;
    }
  }
  .docs {
    background: $color-primary-darkest;
    margin-top: 0.25em;
    color: $color-on-primary;
    text-transform: none;
    padding: 0.5em;
    &-collapsed {
      display: none;
    }
    cursor: auto;
    user-select: text;
  }
}
</style>
