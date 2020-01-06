<template>
    <div class="container">
        Group by: <span 
        v-bind:class="{ 'disabled': isGrouped, 'enabled': !isGrouped}"
            @click="changeGrouping()" >Cards</Span> |
        <span class="action"
            v-bind:class="{ 'disabled': !isGrouped, 'enabled': isGrouped}"
            @click="changeGrouping()">None</span>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import { IApplicationState } from '@/application/State/IApplicationState';

@Component
export default class TheGrouper extends StatefulVue {
    public isGrouped = true;

    public changeGrouping() {
        this.isGrouped = !this.isGrouped;
    }

}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";

.container {
    // text-align:left;
    font:$normal-font;

}
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
