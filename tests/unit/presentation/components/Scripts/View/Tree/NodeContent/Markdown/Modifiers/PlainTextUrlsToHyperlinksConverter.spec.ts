import { describe, it, expect } from 'vitest';
import { PlainTextUrlsToHyperlinksConverter } from '@/presentation/components/Scripts/View/Tree/NodeContent/Markdown/Renderers/PlainTextUrlsToHyperlinksConverter';
import { renderMarkdownUsingRenderer } from './MarkdownRenderingTester';

describe('PlainTextUrlsToHyperlinksConverter', () => {
  describe('modify', () => {
    describe('retains original content where no conversion is required', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly markdownContent: string;
      }> = [
        {
          description: 'URLs within markdown link syntax',
          markdownContent: 'URL: [privacy.sexy](https://privacy.sexy).',
        },
        {
          description: 'URLs within inline code blocks',
          markdownContent: 'URL as code: `https://privacy.sexy`.',
        },
        {
          description: 'reference-style links',
          markdownContent: [
            'This content has reference-style link [1].',
            '[1]: https://privacy.sexy',
          ].join('\n'),
        },
      ];
      testScenarios.forEach(({ description, markdownContent }) => {
        it(description, () => {
          // arrange
          const expectedOutput = markdownContent; // No change expected

          // act
          const convertedContent = renderMarkdownUsingRenderer(
            PlainTextUrlsToHyperlinksConverter,
            markdownContent,
          );

          // assert
          expect(convertedContent).to.equal(expectedOutput);
        });
      });
    });
    describe('converts plain URLs into hyperlinks', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly urlText: string;
        readonly expectedLabel: string;
      }> = [
        {
          description: 'displays only domain name for URLs without path or query',
          urlText: 'https://privacy.sexy',
          expectedLabel: 'privacy.sexy',
        },
        {
          description: 'includes subdomains in labels',
          urlText: 'https://subdomain.privacy.sexy',
          expectedLabel: 'subdomain.privacy.sexy',
        },
        {
          description: 'includes longer URL segment in label',
          urlText: 'https://privacy.sexy/LongerExpectedPart/ShorterPart',
          expectedLabel: 'privacy.sexy - LongerExpectedPart',
        },
        {
          description: 'capitalizes first letter of URL path in label',
          urlText: 'https://privacy.sexy/capitalized',
          expectedLabel: 'privacy.sexy - Capitalized',
        },
        ...['-', '%20', '+'].map((urlSegmentDelimiter) => ({
          description: `parses \`${urlSegmentDelimiter}\` as a delimiter in URL`,
          urlText: `https://privacy.sexy/privacy${urlSegmentDelimiter}scripts`,
          expectedLabel: 'privacy.sexy - Privacy Scripts',
        })),
        {
          description: 'treats multiple spaces as single in URLs',
          urlText: 'https://privacy.sexy/word--with-multiple---spaces',
          expectedLabel: 'privacy.sexy - Word With Multiple Spaces',
        },
        {
          description: 'handles query parameters in URLs correctly',
          urlText: 'https://privacy.sexy/?query=parameter',
          expectedLabel: 'privacy.sexy - Parameter',
        },
        {
          description: 'truncates long hostnames to a readable length',
          urlText: 'https://averylongwebsitedomainnamethatexceedsthetypicalthreshold.com',
          expectedLabel: '…exceedsthetypicalthreshold.com',
        },
        {
          description: 'ignores purely numeric path segments in labels',
          urlText: 'https://privacy.sexy/20230302/expected',
          expectedLabel: 'privacy.sexy - Expected',
        },
        {
          description: 'ignores non-standard ports in labels',
          urlText: 'https://privacy.sexy:8080/configure',
          expectedLabel: 'privacy.sexy - Configure',
        },
        {
          description: 'removes common file extensions from labels',
          urlText: 'https://privacy.sexy/image.png',
          expectedLabel: 'privacy.sexy - Image',
        },
        {
          description: 'handles complex queries in URLs by selecting the most descriptive part',
          urlText: 'https://privacy.sexy/?product=123&name=PrivacyTool',
          expectedLabel: 'privacy.sexy - PrivacyTool',
        },
        {
          description: 'decodes special encoded characters in URLs for labels',
          urlText: 'https://privacy.sexy/privacy%2Fscripts',
          expectedLabel: 'privacy.sexy - Privacy/scripts',
        },
      ];
      testScenarios.forEach(({
        description, urlText, expectedLabel,
      }) => {
        it(description, () => {
          // arrange
          const markdown = `Visit ${urlText} now!`;
          const expectedOutput = `Visit [${expectedLabel}](${urlText}) now!`;
          // act
          const actualOutput = renderMarkdownUsingRenderer(
            PlainTextUrlsToHyperlinksConverter,
            markdown,
          );
          // assert
          expect(actualOutput).to.equal(expectedOutput);
        });
      });
    });
  });
});
