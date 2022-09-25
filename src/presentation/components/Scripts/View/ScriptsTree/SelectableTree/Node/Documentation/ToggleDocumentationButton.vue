<template>
  <a
    class="button"
    target="_blank"
    v-bind:class="{ 'button-on': this.isOn }"
    v-on:click.stop
    v-on:click="toggle()"
  >
    <font-awesome-icon :icon="['fas', 'info-circle']" />
  </a>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class ToggleDocumentationButton extends Vue {
  public isOn = false;

  public toggle() {
    this.isOn = !this.isOn;
    if (this.isOn) {
      this.$emit('show');
    } else {
      this.$emit('hide');
    }
  }
}

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.button {
  @include clickable;
  vertical-align: middle;
  color: $color-primary;
  @include hover-or-touch {
    color: $color-primary-darker;
  }
  &-on {
    color: $color-primary-light;
  }
}

</style>
