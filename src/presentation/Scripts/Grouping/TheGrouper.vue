<template>
    <div class="container">
        <span class="part">Group by:</span>
        <span class="part">
            <span 
                class="part"
                v-bind:class="{ 'disabled': cardsSelected, 'enabled': !cardsSelected}"
                @click="groupByCard()">Cards</span>
            <span class="part">|</span>
            <span class="part"
                v-bind:class="{ 'disabled': noneSelected, 'enabled': !noneSelected}"
                @click="groupByNone()">None</span>
            </span>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import { Grouping } from './Grouping';

const DefaultGrouping = Grouping.Cards;

@Component
export default class TheGrouper extends StatefulVue {

    public cardsSelected = false;
    public noneSelected = false;

    private currentGrouping: Grouping;

    public mounted() {
        this.changeGrouping(DefaultGrouping);
    }

    public groupByCard() {
        this.changeGrouping(Grouping.Cards);
    }

    public groupByNone() {
        this.changeGrouping(Grouping.None);
    }

    private changeGrouping(newGrouping: Grouping) {
        if (this.currentGrouping === newGrouping) {
            return;
        }
        this.currentGrouping = newGrouping;
        this.cardsSelected = newGrouping === Grouping.Cards;
        this.noneSelected = newGrouping === Grouping.None;
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
