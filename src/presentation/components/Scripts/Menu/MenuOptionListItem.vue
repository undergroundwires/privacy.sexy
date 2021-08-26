<template>
    <span> <!-- Parent wrapper allows adding content inside with CSS without making it clickable -->
        <span
            v-bind:class="{ 'disabled': !enabled, 'enabled': enabled}"
            v-non-collapsing
            @click="enabled && onClicked()">{{label}}</span>
    </span>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator';
import { NonCollapsing } from '@/presentation/components/Scripts/Cards/NonCollapsingDirective';

@Component({
    directives: { NonCollapsing },
})
export default class MenuOptionListItem extends Vue {
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