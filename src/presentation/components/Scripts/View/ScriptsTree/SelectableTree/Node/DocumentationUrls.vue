<template>
  <div class="documentationUrls">
    <a v-for="url of this.documentationUrls"
      v-bind:key="url"
      :href="url"
      :alt="url"
      target="_blank" class="documentationUrl"
      v-tooltip.top-center="url"
      v-on:click.stop>
      <font-awesome-icon :icon="['fas', 'info-circle']" />
    </a>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
/** Wrapper for Liquor Tree, reveals only abstracted INode for communication */
@Component
export default class DocumentationUrls extends Vue {
  @Prop() public documentationUrls: string[];
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.documentationUrls {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}
.documentationUrl {
  display: flex;
  color: $color-primary;
  vertical-align: middle;
  @include clickable;
  @include hover-or-touch {
    color: $color-primary-darker;
  }
  &:not(:first-child) {
    margin-left: 0.1em;
  }
}
</style>
