<template>
    <span id="container">
        <span v-if="nodes != null && nodes.length > 0">
            <SelectableTree 
                :initialNodes="nodes"
                :selectedNodeIds="selectedNodeIds"
                :filterPredicate="filterPredicate"
                :filterText="filterText"
                v-on:nodeSelected="toggleNodeSelectionAsync($event)"
                >
            </SelectableTree>
        </span>
        <span v-else>Nooo 😢</span>
    </span>
</template>

<script lang="ts">
  import { Component, Prop, Watch } from 'vue-property-decorator';
  import { StatefulVue } from '@/presentation/StatefulVue';
  import { IScript } from '@/domain/IScript';
  import { ICategory } from '@/domain/ICategory';
  import { IApplicationState } from '@/application/State/IApplicationState';
  import { IFilterResult } from '@/application/State/Filter/IFilterResult';
  import { parseAllCategories, parseSingleCategory, getScriptNodeId, getCategoryNodeId, getCategoryId, getScriptId } from './ScriptNodeParser';
  import SelectableTree from './SelectableTree/SelectableTree.vue';
  import { INode, NodeType } from './SelectableTree/Node/INode';
  import { SelectedScript } from '@/application/State/Selection/SelectedScript';
  import { INodeSelectedEvent } from './SelectableTree/INodeSelectedEvent';

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

    public async toggleNodeSelectionAsync(event: INodeSelectedEvent) {
        const state = await this.getCurrentStateAsync();
        switch (event.node.type) {
          case NodeType.Category:
            toggleCategoryNodeSelection(event, state);
            break;
          case NodeType.Script:
            toggleScriptNodeSelection(event, state);
            break;
          default:
            throw new Error(`Unknown node type: ${event.node.id}`);
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
        .map((selected) => getScriptNodeId(selected.script));
    }

    public filterPredicate(node: INode): boolean {
      return this.filtered.scriptMatches.some(
        (script: IScript) => node.id === getScriptNodeId(script))
        || this.filtered.categoryMatches.some(
          (category: ICategory) => node.id === getCategoryNodeId(category));
    }

    private handleSelectionChanged(selectedScripts: ReadonlyArray<SelectedScript>): void {
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

  function toggleCategoryNodeSelection(event: INodeSelectedEvent, state: IApplicationState): void {
    const categoryId = getCategoryId(event.node.id);
    if (event.isSelected) {
      state.selection.addOrUpdateAllInCategory(categoryId, false);
    } else {
      state.selection.removeAllInCategory(categoryId);
    }
  }
  function toggleScriptNodeSelection(event: INodeSelectedEvent, state: IApplicationState): void {
    const scriptId = getScriptId(event.node.id);
    const actualToggleState = state.selection.isSelected(scriptId);
    const targetToggleState = event.isSelected;
    if (targetToggleState && !actualToggleState) {
      state.selection.addSelectedScript(scriptId, false);
    } else if (!targetToggleState && actualToggleState) {
      state.selection.removeSelectedScript(scriptId);
    }
  }
</script>

<style scoped lang="scss">

</style>
