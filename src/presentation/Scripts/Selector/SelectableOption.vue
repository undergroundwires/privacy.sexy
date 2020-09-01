<template>
    <span
        v-bind:class="{ 'disabled': enabled, 'enabled': !enabled}"
        v-non-collapsing
        @click="onClicked()">{{label}}</span>
</template>

<script lang="ts">
import { Component, Prop, Emit } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import { NonCollapsing } from '@/presentation/Scripts/Cards/NonCollapsingDirective';

@Component({
    directives: { NonCollapsing },
})
export default class SelectableOption extends StatefulVue {
  @Prop() public enabled: boolean;
  @Prop() public label: string;
  @Emit('click') public onClicked() { return; }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";

.enabled {
    cursor: pointer;
    &:hover {
        font-weight:bold;
        text-decoration:underline;
    }
}
.disabled {
    color:$gray;
}
</style>