<template>
  <div class="list">
    <div v-if="label">{{ label }}:</div>
    <div class="items">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class MenuOptionList extends Vue {
  @Prop() public label: string;
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$gap: 0.25rem;
.list {
  font-family: $font-normal;
  display: flex;
  align-items: center;
  .items {
    * + *::before {
      content: '|';
      padding-right: $gap;
      padding-left: $gap;
    }
  }
  > *:not(:last-child) {
    margin-right: $gap;
  }
}
</style>
