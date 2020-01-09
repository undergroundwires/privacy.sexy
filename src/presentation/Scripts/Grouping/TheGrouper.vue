<template>
    <div class="container">
        <span class="part">Group by:</span>
        <span class="part">
            <span 
                class="part"
                v-bind:class="{ 'disabled': isGrouped, 'enabled': !isGrouped}"
                @click="!isGrouped ? toggleGrouping() : undefined">Cards</span>
            <span class="part">|</span>
            <span class="part"
                v-bind:class="{ 'disabled': !isGrouped, 'enabled': isGrouped}"
                @click="isGrouped ? toggleGrouping() : undefined">None</span>
            </span>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import { IApplicationState } from '@/application/State/IApplicationState';
import { Grouping } from './Grouping';

@Component
export default class TheGrouper extends StatefulVue {
    public currentGrouping: Grouping;
    public isGrouped = true;

    public toggleGrouping() {
        this.currentGrouping = this.currentGrouping === Grouping.None ? Grouping.Cards : Grouping.None;
        this.isGrouped = this.currentGrouping === Grouping.Cards;
        this.$emit('groupingChanged', this.currentGrouping);
    }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";

.container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    font-family: $normal-font;
    .part {
        display: flex;
        margin-right:5px;
    }
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
