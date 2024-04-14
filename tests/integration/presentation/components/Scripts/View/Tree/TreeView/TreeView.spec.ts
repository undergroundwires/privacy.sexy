import {
  describe, it, expect,
} from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, shallowRef } from 'vue';
import TreeView from '@/presentation/components/Scripts/View/Tree/TreeView/TreeView.vue';
import type { TreeInputNodeData } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputNodeData';
import { provideDependencies } from '@/presentation/bootstrapping/DependencyProvider';
import { ApplicationContextStub } from '@tests/unit/shared/Stubs/ApplicationContextStub';

describe('TreeView', () => {
  it('renders all provided root nodes correctly', async () => {
    // arrange
    const nodes = createSampleNodes();
    const { wrapper } = mountWrapperComponent({
      initialNodeData: nodes,
    });

    // act
    await waitForStableDom(wrapper.element);

    // assert
    const expectedTotalRootNodes = nodes.length;
    expect(wrapper.findAll('.node').length).to.equal(expectedTotalRootNodes, wrapper.html());
    const rootNodeTexts = nodes.map((node) => (node.data as TreeInputMetadata).label);
    rootNodeTexts.forEach((label) => {
      expect(wrapper.text()).to.include(label);
    });
  });

  // Regression test for a bug where updating the nodes prop caused uncaught exceptions.
  it('updates nodes correctly when props change', async () => {
    // arrange
    const firstNodeLabel = 'Node 1';
    const secondNodeLabel = 'Node 2';
    const initialNodes: TreeInputNodeDataWithMetadata[] = [{ id: 'node1', data: { label: firstNodeLabel } }];
    const updatedNodes: TreeInputNodeDataWithMetadata[] = [{ id: 'node2', data: { label: secondNodeLabel } }];
    const { wrapper, nodes } = mountWrapperComponent({
      initialNodeData: initialNodes,
    });

    // act
    nodes.value = updatedNodes;
    await waitForStableDom(wrapper.element);

    // assert
    expect(wrapper.text()).toContain(secondNodeLabel);
    expect(wrapper.text()).not.toContain(firstNodeLabel);
  });
});

function mountWrapperComponent(options?: {
  readonly initialNodeData?: readonly TreeInputNodeDataWithMetadata[],
}) {
  const nodes = shallowRef(options?.initialNodeData ?? createSampleNodes());
  const wrapper = mount(defineComponent({
    components: {
      TreeView,
    },
    setup() {
      provideDependencies(new ApplicationContextStub());

      const selectedLeafNodeIds = shallowRef<readonly string[]>([]);

      return {
        nodes,
        selectedLeafNodeIds,
      };
    },
    template: `
      <TreeView
        :nodes="nodes"
        :selectedLeafNodeIds="selectedLeafNodeIds"
      >
        <template v-slot:node-content="{ nodeMetadata }">
          {{ nodeMetadata.label }}
        </template>
      </TreeView>
    `,
  }));
  return {
    wrapper,
    nodes,
  };
}

interface TreeInputMetadata {
  readonly label: string;
}

type TreeInputNodeDataWithMetadata = TreeInputNodeData & { readonly data?: TreeInputMetadata };

function createSampleNodes(): TreeInputNodeDataWithMetadata[] {
  return [
    {
      id: 'root1',
      data: {
        label: 'Root 1',
      },
      children: [
        {
          id: 'child1',
          data: {
            label: 'Child 1',
          },
        },
        {
          id: 'child2',
          data: {
            label: 'Child 2',
          },
        },
      ],
    },
    {
      id: 'root2',
      data: {
        label: 'Root 2',
      },
      children: [
        {
          id: 'child3',
          data: {
            label: 'Child 3',
          },
        },
      ],
    },
  ];
}

function waitForStableDom(rootElement, timeout = 3000, interval = 200): Promise<void> {
  return new Promise((resolve, reject) => {
    let lastTimeoutId: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      if (lastTimeoutId) {
        clearTimeout(lastTimeoutId);
      }

      lastTimeoutId = setTimeout(() => {
        observer.disconnect();
        resolve();
      }, interval);
    });

    observer.observe(rootElement, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error('Timeout waiting for DOM to stabilize'));
    }, timeout);
  });
}
