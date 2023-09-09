import {
  describe, it, expect,
} from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import TreeView from '@/presentation/components/Scripts/View/Tree/TreeView/TreeView.vue';
import { TreeInputNodeData } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputNodeData';
import { provideDependencies } from '@/presentation/bootstrapping/DependencyProvider';
import { ApplicationContextStub } from '@tests/unit/shared/Stubs/ApplicationContextStub';

describe('TreeView', () => {
  it('should render all provided root nodes correctly', async () => {
    // arrange
    const nodes = createSampleNodes();
    const wrapper = createTreeViewWrapper(nodes);
    // act
    await waitForStableDom(wrapper.element);
    // assert
    const expectedTotalRootNodes = nodes.length;
    expect(wrapper.findAll('.node').length).to.equal(expectedTotalRootNodes, wrapper.html());
    const rootNodeTexts = nodes.map((node) => node.data.label);
    rootNodeTexts.forEach((label) => {
      expect(wrapper.text()).to.include(label);
    });
  });
});

function createTreeViewWrapper(initialNodeData: readonly TreeInputNodeData[]) {
  return mount(defineComponent({
    components: {
      TreeView,
    },
    setup() {
      provideDependencies(new ApplicationContextStub());

      const initialNodes = ref(initialNodeData);
      const selectedLeafNodeIds = ref<readonly string[]>([]);
      return {
        initialNodes,
        selectedLeafNodeIds,
      };
    },
    template: `
    <TreeView
      :initialNodes="initialNodes"
      :selectedLeafNodeIds="selectedLeafNodeIds"
    >
      <template v-slot:node-content="{ nodeMetadata }">
        {{ nodeMetadata.label }}
      </template>
    </TreeView>`,
  }));
}

function createSampleNodes() {
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
    let lastTimeoutId;
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
