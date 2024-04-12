<template>
  <span class="circle-rating">
    <RatingCircle
      v-for="i in maxRating"
      :key="i"
      :filled="i <= rating"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RatingCircle from './RatingCircle.vue';

const minRating = 0;
const maxRating = 4;

export default defineComponent({
  components: {
    RatingCircle,
  },
  props: {
    rating: {
      type: Number,
      required: true,
      validator: (value: number) => {
        return value >= minRating && value <= maxRating;
      },
    },
  },
  setup() {
    return {
      maxRating,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.circle-rating {
  display: inline-flex;
  gap: $spacing-relative-x-small;
}
</style>
