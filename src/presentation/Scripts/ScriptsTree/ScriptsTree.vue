<template>
    <span id="container">
        <span v-if="nodes != null && nodes.length > 0">
            <SelectableTree 
                :initialNodes="nodes"
                :selectedNodeIds="selectedNodeIds"
                :filterPredicate="filterPredicate"
                :filterText="filterText"
                v-on:nodeSelected="checkNodeAsync($event)">
            </SelectableTree>
        </span>
        <span v-else>Nooo 😢</span>
    </span>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
  import { StatefulVue } from '@/presentation/StatefulVue';
  import { Category } from '@/domain/Category';
  import { IRepository } from '@/infrastructure/Repository/IRepository';
  import { IScript } from '@/domain/IScript';
  import { ICategory } from '@/domain/ICategory';
  import { IApplicationState, IUserSelection } from '@/application/State/IApplicationState';
  import { IFilterResult } from '@/application/State/Filter/IFilterResult';
  import { parseAllCategories, parseSingleCategory, getScriptNodeId, getCategoryNodeId } from './ScriptNodeParser';
  import SelectableTree, { FilterPredicate } from './SelectableTree/SelectableTree.vue';
  import { INode } from './SelectableTree/INode';

  @Component({
    components: {
      SelectableTree,
    },
  })
  export default class ScriptsTree extends StatefulVue {
    @Prop() public categoryId?: number;

    public nodes?: ReadonlyArray<INode> = null;
    public selectedNodeIds?: ReadonlyArray<string> = [];
    public filterText?: string = null;

    private filtered?: IFilterResult;

    public async mounted() {
      const state = await this.getCurrentStateAsync();
      // React to state changes
      state.selection.changed.on(this.handleSelectionChanged);
      state.filter.filterRemoved.on(this.handleFilterRemoved);
      state.filter.filtered.on(this.handleFiltered);
      // Update initial state
      await this.initializeNodesAsync(this.categoryId);
    }

    public async checkNodeAsync(node: INode) {
        if (node.children != null && node.children.length > 0) {
            return; // only interested in script nodes
        }
        const state = await this.getCurrentStateAsync();
        if (!this.selectedNodeIds.some((id) => id === node.id)) {
            state.selection.addSelectedScript(node.id);
        } else {
            state.selection.removeSelectedScript(node.id);
        }
    }

    @Watch('categoryId')
    public async initializeNodesAsync(categoryId?: number) {
      const state = await this.getCurrentStateAsync();
      if (categoryId) {
        this.nodes = parseSingleCategory(categoryId, state.app);
      } else {
        this.nodes = parseAllCategories(state.app);
      }
      this.selectedNodeIds = state.selection.selectedScripts
        .map((script) => getScriptNodeId(script));
    }

    public filterPredicate(node: INode): boolean {
      return this.filtered.scriptMatches.some(
        (script: IScript) => node.id === getScriptNodeId(script))
        || this.filtered.categoryMatches.some(
          (category: ICategory) => node.id === getCategoryNodeId(category));
    }

    private handleSelectionChanged(selectedScripts: ReadonlyArray<IScript>): void {
      this.selectedNodeIds = selectedScripts
          .map((node) => node.id);
    }

    private handleFilterRemoved() {
      this.filterText = '';
    }

    private handleFiltered(result: IFilterResult) {
      this.filterText = result.query;
      this.filtered = result;
    }
  }

</script>

<style scoped lang="scss">

</style>
