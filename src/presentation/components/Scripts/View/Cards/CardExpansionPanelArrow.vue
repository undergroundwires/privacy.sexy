<template>
  <div class="arrow-container">
    <div class="arrow" />
  </div>
</template>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$arrow-size             : 15px;

.arrow-container {
  position: relative;
  .arrow {
    position: absolute;
    left: calc(50% - $arrow-size * 1.5);
    top: calc(1.5 * $arrow-size);
    border: solid $color-primary-darker;
    border-width: 0 $arrow-size $arrow-size 0;
    padding: $arrow-size;
    transform: rotate(-135deg);
  }
}
</style>
