<template>
    <div class="container">
        <MenuOptionList
            label="Group by"
            class="part">
            <MenuOptionListItem
                label="Cards"
                :enabled="!cardsSelected"
                @click="groupByCard()"
            />
            <MenuOptionListItem
                label="None"
                :enabled="!noneSelected"
                @click="groupByNone()"
            />
        </MenuOptionList>
        <span class="part">
        </span>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Grouping } from './Grouping';
import MenuOptionList from './../MenuOptionList.vue';
import MenuOptionListItem from './../MenuOptionListItem.vue';

const DefaultGrouping = Grouping.Cards;

@Component({
  components: {
    MenuOptionList,
    MenuOptionListItem,
  },
})
export default class TheGrouper extends Vue {
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

</style>
