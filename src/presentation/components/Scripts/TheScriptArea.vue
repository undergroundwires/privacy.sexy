<template>
<div class="scripts">
    <TheScriptsMenu v-on:viewChanged="currentView = $event" />
    <HorizontalResizeSlider class="row">
        <template v-slot:left>
            <TheScriptsView :currentView="currentView" />
        </template>
        <template v-slot:right>
            <TheCodeArea theme="xcode" />
        </template>
    </HorizontalResizeSlider>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TheCodeArea from '@/presentation/components/Code/TheCodeArea.vue';
import TheScriptsView from '@/presentation/components/Scripts/View/TheScriptsView.vue';
import TheScriptsMenu from '@/presentation/components/Scripts/Menu/TheScriptsMenu.vue';
import HorizontalResizeSlider from '@/presentation/components/Scripts/Slider/HorizontalResizeSlider.vue';
import { ViewType } from '@/presentation/components/Scripts/Menu/View/ViewType';

@Component({
  components: {
    TheCodeArea,
    TheScriptsView,
    TheScriptsMenu,
    HorizontalResizeSlider,
  },
})
export default class TheScriptArea extends Vue {
    public currentView = ViewType.Cards;
}
</script>

<style scoped lang="scss">
.scripts {
    > * + * {
        margin-top: 15px;
    }
}
::v-deep .left {
    width: 55%; // initial width
    min-width: 20%;
}
::v-deep .right {
    min-width: 20%;
}
</style>
