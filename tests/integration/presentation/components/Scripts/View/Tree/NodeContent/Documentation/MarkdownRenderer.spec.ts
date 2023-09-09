import { describe, it, expect } from 'vitest';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { createRenderer } from '@/presentation/components/Scripts/View/Tree/NodeContent/Documentation/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  describe('can render all docs', () => {
    // arrange
    const renderer = createRenderer();
    for (const node of collectAllDocumentableNodes()) {
      it(`${node.nodeLabel}`, () => {
        // act
        const html = renderer.render(node.docs);
        const result = validateHtml(html);
        // assert
        expect(result.isValid, result.generatedHtml);
      });
    }
  });
});

interface IDocumentableNode {
  readonly nodeLabel: string
  readonly docs: string
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

interface IHTMLValidationResult {
  readonly isValid: boolean;
  readonly generatedHtml: string;
}

function validateHtml(value: string): IHTMLValidationResult {
  const doc = new window.DOMParser()
    .parseFromString(value, 'text/html');
  return {
    isValid: Array.from(doc.body.childNodes).some((node) => node.nodeType === 1),
    generatedHtml: doc.body.innerHTML,
  };
}
