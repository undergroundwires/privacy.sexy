<template>
  <div class="script-area">
    <TheScriptsMenu @view-changed="currentView = $event" />
    <HorizontalResizeSlider
      class="horizontal-slider"
      first-initial-width="55%"
      first-min-width="20%"
      second-min-width="20%"
    >
      <template #first>
        <TheScriptsView :current-view="currentView" />
      </template>
      <template #second>
        <TheCodeArea />
      </template>
    </HorizontalResizeSlider>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import TheCodeArea from '@/presentation/components/Code/TheCodeArea.vue';
import TheScriptsView from '@/presentation/components/Scripts/View/TheScriptsView.vue';
import TheScriptsMenu from '@/presentation/components/Scripts/Menu/TheScriptsMenu.vue';
import HorizontalResizeSlider from '@/presentation/components/Scripts/Slider/HorizontalResizeSlider.vue';
import { ViewType } from '@/presentation/components/Scripts/Menu/View/ViewType';

export default defineComponent({
  components: {
    TheCodeArea,
    TheScriptsView,
    TheScriptsMenu,
    HorizontalResizeSlider,
  },
  setup() {
    const currentView = ref(ViewType.Cards);

    return { currentView };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.script-area {
  display: flex;
  flex-direction: column;
  gap: $spacing-absolute-medium;
}

.horizontal-slider {
  // Add row gap between lines on mobile (smaller screens)
  // when the slider turns into rows.
  row-gap: $spacing-absolute-large;
}
</style>
