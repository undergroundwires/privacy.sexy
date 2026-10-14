import {
  afterEach, describe, expect, it,
} from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import HierarchicalTreeNode from '@/presentation/components/Scripts/View/Tree/TreeView/Node/HierarchicalTreeNode.vue';
import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { TreeRootManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRootManager';
import { provideDependencies } from '@/presentation/bootstrapping/DependencyProvider';
import { ApplicationContextStub } from '@tests/unit/shared/Stubs/ApplicationContextStub';
import type { NodeRenderingStrategy } from '@/presentation/components/Scripts/View/Tree/TreeView/Rendering/Scheduling/NodeRenderingStrategy';

describe('HierarchicalTreeNode', () => {
  it('uses one focusable wrapper that toggles its node check state', async () => {
    // arrange
    const treeRoot = createTreeRoot();
    const context = mountHierarchicalNode(treeRoot);
    const expectedFocusableNodeCount = 1;
    const node = treeRoot.collection.nodes.getNodeById('root');
    // act
    await context.wrapper.get('.focusable-node').trigger('click');
    await nextTick();
    // assert
    expect(context.wrapper.findAll('.focusable-node')).to.have.length(expectedFocusableNodeCount);
    expect(node.state.current.checkState).to.equal(TreeNodeCheckState.Checked);
  });
});

let disposeMountedComponent: (() => void) | undefined;

afterEach(() => {
  disposeMountedComponent?.();
  disposeMountedComponent = undefined;
});

function createTreeRoot(): TreeRootManager {
  const treeRoot = new TreeRootManager();
  treeRoot.collection.updateRootNodes([{ id: 'root' }]);
  return treeRoot;
}

function mountHierarchicalNode(treeRoot: TreeRootManager) {
  const renderingStrategy: NodeRenderingStrategy = {
    shouldRender: () => true,
  };
  const mountPoint = document.createElement('div');
  document.body.append(mountPoint);
  const wrapper = mount(defineComponent({
    components: {
      HierarchicalTreeNode,
    },
    setup() {
      provideDependencies(new ApplicationContextStub());
      return {
        renderingStrategy,
        treeRoot,
      };
    },
    template: `
      <HierarchicalTreeNode
        node-id="root"
        :tree-root="treeRoot"
        :rendering-strategy="renderingStrategy"
      />
    `,
  }), { attachTo: mountPoint });
  disposeMountedComponent = () => {
    wrapper.unmount();
    mountPoint.remove();
  };
  return { wrapper };
}
