<template>
    <span id="container">
        <span v-if="nodes != null && nodes.length > 0">
            <SelectableTree
              :nodes="nodes"
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
  import { IApplicationState, IUserSelection } from '@/application/State/IApplicationState';
  import { IFilterMatches } from '@/application/State/Filter/IFilterMatches';
  import { parseAllCategories, parseSingleCategory } from './ScriptNodeParser';
  import SelectableTree, { FilterPredicate } from './SelectableTree/SelectableTree.vue';
  import { INode } from './SelectableTree/INode';

  @Component({
    components: {
      SelectableTree,
    },
  })
  export default class ScriptsTree extends StatefulVue {
    @Prop() public categoryId?: number;

    public nodes?: INode[] = null;
    public selectedNodeIds?: string[] = null;
    public filterText?: string = null;

    private matches?: IFilterMatches;

    public async mounted() {
      // React to state changes
      const state = await this.getCurrentStateAsync();
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
        if (node.selected) {
            state.selection.addSelectedScript(node.id);
        } else {
            state.selection.removeSelectedScript(node.id);
        }
    }

    @Watch('categoryId')
    public async initializeNodesAsync(categoryId?: number) {
      const state = await this.getCurrentStateAsync();
      if (categoryId) {
        this.nodes = parseSingleCategory(categoryId, state);
      } else {
        this.nodes = parseAllCategories(state);
      }
    }

    public filterPredicate(node: INode): boolean {
      return this.matches.scriptMatches.some((script: IScript) => script.id === node.id);
    }

    private handleSelectionChanged(selectedScripts: ReadonlyArray<IScript>) {
      this.nodes = this.nodes.map((node: INode) => updateNodeSelection(node, selectedScripts));
    }

    private handleFilterRemoved() {
      this.filterText = '';
    }

    private handleFiltered(matches: IFilterMatches) {
      this.filterText = matches.query;
      this.matches = matches;
    }
  }

  function updateNodeSelection(node: INode, selectedScripts: ReadonlyArray<IScript>): INode {
    return {
      id: node.id,
      text: node.text,
      selected: selectedScripts.some((script) => script.id === node.id),
      children: node.children ? node.children.map((child) => updateNodeSelection(child, selectedScripts)) : [],
      documentationUrls: node.documentationUrls,
      };
  }

</script>

<style scoped lang="scss">

</style>
