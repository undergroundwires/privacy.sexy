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
import { Component, Vue, Prop } from 'vue-property-decorator';
import DocumentationText from './DocumentationText.vue';
import ToggleDocumentationButton from './ToggleDocumentationButton.vue';

@Component({
  components: {
    DocumentationText,
    ToggleDocumentationButton,
  },
})
export default class Documentation extends Vue {
  @Prop() public docs!: readonly string[];

  public isExpanded = false;
}
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
