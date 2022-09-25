import 'mocha';
import { expect } from 'chai';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { createRenderer } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/Documentation/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  describe('can render all docs', () => {
    // arrange
    const renderer = createRenderer();
    for (const node of collectAllDocumentableNodes()) {
      it(`${node.nodeLabel}`, () => {
        // act
        const html = renderer.render(node.docs);
        // assert
        expect(isValidHtml(html));
      });
    }
  });
});

interface IDocumentableNode {
  nodeLabel: string
  docs: string
}
function* collectAllDocumentableNodes(): Generator<IDocumentableNode> {
  const app = parseApplication();
  for (const collection of app.collections) {
    const documentableNodes = [
      ...collection.getAllScripts(),
      ...collection.getAllCategories(),
    ];
    for (const node of documentableNodes) {
      const documentable: IDocumentableNode = {
        nodeLabel: `${OperatingSystem[collection.os]} | ${node.name} (${node.id})`,
        docs: node.docs.join('\n'),
      };
      yield documentable;
    }
  }
}

function isValidHtml(value: string): boolean {
  const doc = new window.DOMParser().parseFromString(value, 'text/html');
  return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1);
}
