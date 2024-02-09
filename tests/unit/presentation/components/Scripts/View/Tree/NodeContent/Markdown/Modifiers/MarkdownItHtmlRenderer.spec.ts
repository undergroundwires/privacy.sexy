import { describe, it, expect } from 'vitest';
import { MarkdownItHtmlRenderer } from '@/presentation/components/Scripts/View/Tree/NodeContent/Markdown/Renderers/MarkdownItHtmlRenderer';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { parseHtml } from '@tests/shared/HtmlParser';
import { renderMarkdownUsingRenderer } from './MarkdownRenderingTester';

describe('MarkdownItHtmlRenderer', () => {
  describe('modify', () => {
    describe('sets default anchor attributes', () => {
      const testScenarios: ReadonlyArray<{
        readonly attributeName: string;
        readonly expectedValue: string;
        readonly markdownWithNonCompliantAnchorAttributes: string;
      }> = [
        {
          attributeName: 'target',
          expectedValue: '_blank',
          markdownWithNonCompliantAnchorAttributes: '[URL](https://undergroundwires.dev){ target="_self" }',
        },
        {
          attributeName: 'rel',
          expectedValue: 'noopener noreferrer',
          markdownWithNonCompliantAnchorAttributes: '[URL](https://undergroundwires.dev){ rel="nooverride" }',
        },
      ];
      testScenarios.forEach(({
        attributeName, expectedValue, markdownWithNonCompliantAnchorAttributes,
      }) => {
        it(`adds "${attributeName}" attribute to anchors`, () => {
          // arrange
          const markdown = '[undergroundwires.dev](https://undergroundwires.dev)';

          // act
          const renderedOutput = renderMarkdownUsingRenderer(MarkdownItHtmlRenderer, markdown);

          // assert
          assertAnchorElementAttribute({
            renderedOutput,
            attributeName,
            expectedValue,
            markdownContent: markdown,
          });
        });

        it(`overrides existing "${attributeName}" attribute`, () => {
          // arrange & act
          const renderedOutput = renderMarkdownUsingRenderer(
            MarkdownItHtmlRenderer,
            markdownWithNonCompliantAnchorAttributes,
          );

          // assert
          assertAnchorElementAttribute({
            renderedOutput,
            attributeName,
            expectedValue,
            markdownContent: markdownWithNonCompliantAnchorAttributes,
          });
        });
      });
    });
    it('does not convert single line breaks to <br> elements', () => {
      // arrange
      const markdown = 'Text with\nSingle\nLinebreaks';
      // act
      const renderedOutput = renderMarkdownUsingRenderer(MarkdownItHtmlRenderer, markdown);
      // assert
      const html = parseHtml(renderedOutput);
      const totalBrElements = html.getElementsByTagName('br').length;
      expect(totalBrElements).to.equal(0);
    });
  });
});

function assertAnchorElementAttribute(context: {
  readonly renderedOutput: string;
  readonly attributeName: string;
  readonly expectedValue: string;
  readonly markdownContent: string;
}) {
  const html = parseHtml(context.renderedOutput);
  const aElement = html.getElementsByTagName('a')[0];
  expectExists(aElement, formatAssertionMessage([
    'Missing expected `<a>` element',
    `Markdown input to render: ${context.markdownContent}`,
    `Actual render output: ${context.renderedOutput}`,
  ]));
  const actualValue = aElement.getAttribute(context.attributeName);
  expect(context.expectedValue).to.equal(actualValue, formatAssertionMessage([
    `Expected attribute value: ${context.expectedValue}`,
    `Actual attribute value: ${actualValue}`,
    `Attribute name: ${context.attributeName}`,
    `Markdown input to render: ${context.markdownContent}`,
    `Actual render output:\n${context.renderedOutput}`,
    `Actual \`<a>\` element HTML: ${aElement.outerHTML}`,
  ]));
}
