<template>
  <div class="scripts">
    <TheScriptsMenu @view-changed="currentView = $event" />
    <HorizontalResizeSlider
      class="row"
      vertical-margin="15px"
      first-initial-width="55%"
      first-min-width="20%"
      second-min-width="20%"
    >
      <template #first>
        <TheScriptsView :current-view="currentView" />
      </template>
      <template #second>
        <TheCodeArea theme="xcode" />
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
.scripts {
  > * + * {
    margin-top: 15px;
  }
}
</style>
