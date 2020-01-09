<template>
    <div>
        <div class="help-container">
            <TheSelector class="left" />
            <TheGrouper class="right"
                v-on:groupingChanged="onGroupingChanged($event)" />
        </div>
        <CardList v-if="showCards" />
        <ScriptsTree v-if="showList" />
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
    import { Category } from '@/domain/Category';
    import { StatefulVue } from '@/presentation/StatefulVue';
    import TheGrouper from '@/presentation/Scripts/Grouping/TheGrouper.vue';
    import TheSelector from '@/presentation/Scripts/Selector/TheSelector.vue';
    import ScriptsTree from '@/presentation/Scripts/ScriptsTree/ScriptsTree.vue';
    import CardList from '@/presentation/Scripts/Cards/CardList.vue';
    import { Grouping } from './Grouping/Grouping';

    /** Shows content of single category or many categories */
    @Component({
    components: {
        TheGrouper,
        TheSelector,
        ScriptsTree,
        CardList,
    },
    })
    export default class TheScripts extends StatefulVue {
        public showCards = true;
        public showList = false;

        @Prop() public data!: Category | Category[];

        public onGroupingChanged(group: Grouping) {
            switch (group) {
                case Grouping.Cards:
                    this.showCards = true;
                    this.showList = false;
                    break;
                case Grouping.None:
                    this.showCards = false;
                    this.showList = true;
                    break;
                default:
                    throw new Error('Unknown grouping');
            }
        }
    }
</script>

<style scoped lang="scss">
.help-container {
  display: flex;
  justify-content: space-between;

  .left {
      justify-content: flex-start;
  }
  .right {
      justify-content: flex-end;
  }
}
</style>
