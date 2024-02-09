import { describe, it, expect } from 'vitest';
import { InlineReferenceLabelsToSuperscriptConverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Markdown/Renderers/InlineReferenceLabelsToSuperscriptConverter';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { renderMarkdownUsingRenderer } from './MarkdownRenderingTester';

describe('InlineReferenceLabelsToSuperscriptConverter', () => {
  describe('modify', () => {
    describe('retains original content where no conversion is required', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly markdownContent: string;
      }> = [
        {
          description: 'text without references',
          markdownContent: 'No references here to convert.',
        },
        {
          description: 'numeric references outside brackets',
          markdownContent: [
            'This is a test 1.',
            'Please refer to note 2.',
            '1: Reference I',
            '1: Reference II',
          ].join('\n'),
        },
        {
          description: 'references without definitions',
          markdownContent: [
            'This is a test [1].',
            'Please refer to note [2].',
          ].join('\n'),
        },
      ];
      testScenarios.forEach(({ description, markdownContent }) => {
        it(description, () => {
          // arrange
          const expectedOutput = markdownContent; // No change expected

          // act
          const convertedContent = renderMarkdownUsingRenderer(
            InlineReferenceLabelsToSuperscriptConverter,
            markdownContent,
          );

          // assert
          expect(convertedContent).to.equal(expectedOutput);
        });
      });
    });

    describe('converts references in square brackets to superscript', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly markdownContent: string;
        readonly expectedOutput: string;
      }> = [
        {
          description: 'converts a single numeric reference',
          markdownContent: [
            'See reference [1].',
            createMarkdownLinkReferenceDefinition('1'),
          ].join('\n'),
          expectedOutput: [
            'See reference <sup>[1]</sup>.',
            createMarkdownLinkReferenceDefinition('1'),
          ].join('\n'),
        },
        {
          description: 'converts a single non-numeric reference',
          markdownContent: [
            'For more information, check [Reference A].',
            createMarkdownLinkReferenceDefinition('Reference A'),
          ].join('\n'),
          expectedOutput: [
            'For more information, check <sup>[Reference A]</sup>.',
            createMarkdownLinkReferenceDefinition('Reference A'),
          ].join('\n'),
        },
        {
          description: 'converts multiple numeric references on the same line',
          markdownContent: [
            'Refer to [1], [2], and [3] for more details.',
            createMarkdownLinkReferenceDefinition('1'), createMarkdownLinkReferenceDefinition('2'), createMarkdownLinkReferenceDefinition('3'),
          ].join('\n'),
          expectedOutput: [
            'Refer to <sup>[1]</sup>, <sup>[2]</sup>, and <sup>[3]</sup> for more details.',
            createMarkdownLinkReferenceDefinition('1'), createMarkdownLinkReferenceDefinition('2'), createMarkdownLinkReferenceDefinition('3'),
          ].join('\n'),
        },
        {
          description: 'converts multiple numeric references on different lines',
          markdownContent: [
            'Details can be found in [5].', 'Additional data in [6].',
            createMarkdownLinkReferenceDefinition('5'), createMarkdownLinkReferenceDefinition('6'),
          ].join('\n'),
          expectedOutput: [
            'Details can be found in <sup>[5]</sup>.', 'Additional data in <sup>[6]</sup>.',
            createMarkdownLinkReferenceDefinition('5'), createMarkdownLinkReferenceDefinition('6'),
          ].join('\n'),
        },
        {
          description: 'handles adjacent references without spaces',
          markdownContent: [
            'start[first][2][3]end',
            createMarkdownLinkReferenceDefinition('first'), createMarkdownLinkReferenceDefinition('2'), createMarkdownLinkReferenceDefinition('3'),
          ].join('\n'),
          expectedOutput: [
            'start<sup>[first]</sup><sup>[2]</sup><sup>[3]</sup>end',
            createMarkdownLinkReferenceDefinition('first'), createMarkdownLinkReferenceDefinition('2'), createMarkdownLinkReferenceDefinition('3'),
          ].join('\n'),
        },
        {
          description: 'handles references with special characters',
          markdownContent: [
            '[reference-name!]',
            createMarkdownLinkReferenceDefinition('reference-name!'),
          ].join('\n'),
          expectedOutput: [
            '<sup>[reference-name!]</sup>',
            createMarkdownLinkReferenceDefinition('reference-name!'),
          ].join('\n'),
        },
        {
          description: 'handles colon after reference without mistaking for definition',
          markdownContent: [
            'It said [1]: "No I\'m not AI!"',
            createMarkdownLinkReferenceDefinition('1'),
          ].join('\n'),
          expectedOutput: [
            'It said <sup>[1]</sup>: "No I\'m not AI!"',
            createMarkdownLinkReferenceDefinition('1'),
          ].join('\n'),
        },
      ];
      testScenarios.forEach(({ description, markdownContent, expectedOutput }) => {
        it(description, () => {
          // act
          const convertedContent = renderMarkdownUsingRenderer(
            InlineReferenceLabelsToSuperscriptConverter,
            markdownContent,
          );

          // assert
          expect(convertedContent).to.equal(expectedOutput, formatAssertionMessage([
            `Expected output: ${expectedOutput}`,
            `Actual output: ${expectedOutput}`,
          ]));
        });
      });
    });
  });
});

function createMarkdownLinkReferenceDefinition(label: string): string {
  return `[${label}]: https://test.url`;
}
