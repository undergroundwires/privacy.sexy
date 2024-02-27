import type { TreeInputNodeData } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputNodeData';
import type { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { parseTreeInput } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/TreeInputParser';
import { TreeNodeStub } from './TreeNodeStub';

interface StubScenario {
  readonly given: readonly TreeInputNodeData[],
  readonly result: TreeNode[],
}

export function createTreeNodeParserStub() {
  const scenarios = new Array<StubScenario>();
  function registerScenario(scenario: StubScenario) {
    scenarios.push(scenario);
  }
  const parseTreeInputStub: typeof parseTreeInput = (
    data: readonly TreeInputNodeData[],
  ): TreeNode[] => {
    const result = scenarios.find((scenario) => scenario.given === data);
    if (result !== undefined) {
      return result.result;
    }
    return data.map(() => new TreeNodeStub()
      .withId(`[${createTreeNodeParserStub.name}] parsed-node-stub`));
  };
  return {
    registerScenario,
    parseTreeInputStub,
  };
}
