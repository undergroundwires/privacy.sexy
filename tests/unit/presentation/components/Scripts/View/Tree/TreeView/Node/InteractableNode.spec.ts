import {
  afterEach, describe, expect, it,
} from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import InteractableNode from '@/presentation/components/Scripts/View/Tree/TreeView/Node/InteractableNode.vue';
import { TreeRootManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRootManager';
import { provideDependencies } from '@/presentation/bootstrapping/DependencyProvider';
import { ApplicationContextStub } from '@tests/unit/shared/Stubs/ApplicationContextStub';

describe('InteractableNode', () => {
  it('focuses its DOM element when its tree node receives model focus', async () => {
    // arrange
    const treeRoot = createTreeRoot();
    const context = mountInteractableNode(treeRoot);
    const nodeElement = context.wrapper.get('.focusable-node').element;
    document.dispatchEvent(new KeyboardEvent('keydown'));
    const node = treeRoot.collection.nodes.getNodeById('root');
    // act
    treeRoot.focus.setSingleFocus(node);
    await nextTick();
    await nextTick();
    // assert
    expect(document.activeElement).to.equal(nodeElement);
    expect(nodeElement.classList.contains('keyboard-focus')).to.equal(true);
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

function mountInteractableNode(treeRoot: TreeRootManager) {
  const mountPoint = document.createElement('div');
  document.body.append(mountPoint);
  const wrapper = mount(defineComponent({
    components: {
      InteractableNode,
    },
    setup() {
      provideDependencies(new ApplicationContextStub());
      return { treeRoot };
    },
    template: `
      <InteractableNode node-id="root" :tree-root="treeRoot">
        Root node
      </InteractableNode>
    `,
  }), { attachTo: mountPoint });
  disposeMountedComponent = () => {
    wrapper.unmount();
    mountPoint.remove();
  };
  return { wrapper };
}
