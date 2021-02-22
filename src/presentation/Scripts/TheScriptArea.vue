<template>
<div class="scripts">
    <TheScriptsMenu v-on:groupingChanged="grouping = $event" />
    <HorizontalResizeSlider class="row">
        <template v-slot:left>
            <TheScriptsList :grouping="grouping" />
        </template>
        <template v-slot:right>
            <TheCodeArea theme="xcode" />
        </template>
    </HorizontalResizeSlider>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TheCodeArea from '@/presentation/Code/TheCodeArea.vue';
import TheScriptsList from '@/presentation/Scripts/TheScriptsList.vue';
import TheScriptsMenu from '@/presentation/Scripts/Menu/TheScriptsMenu.vue';
import HorizontalResizeSlider from '@/presentation/Scripts/Slider/HorizontalResizeSlider.vue';
import { Grouping } from '@/presentation/Scripts/Menu/Grouping/Grouping';

@Component({
  components: {
    TheCodeArea,
    TheScriptsList,
    TheScriptsMenu,
    HorizontalResizeSlider,
  },
})
export default class TheScriptArea extends Vue {
    public grouping = Grouping.Cards;
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
