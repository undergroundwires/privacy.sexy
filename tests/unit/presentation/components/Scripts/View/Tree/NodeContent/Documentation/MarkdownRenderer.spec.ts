import { describe, it, expect } from 'vitest';
import { createMarkdownRenderer } from '@/presentation/components/Scripts/View/Tree/NodeContent/Documentation/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  describe('createMarkdownRenderer', () => {
    it('creates renderer instance', () => {
      // arrange & act
      const renderer = createMarkdownRenderer();
      // assert
      expect(renderer !== undefined);
    });
    describe('sets default anchor attributes', () => {
      const attributes: ReadonlyArray<{
        readonly attributeName: string,
        readonly expectedValue: string,
        readonly invalidMarkdown: string
      }> = [
        {
          attributeName: 'target',
          expectedValue: '_blank',
          invalidMarkdown: '<a href="https://undergroundwires.dev" target="_self">example</a>',
        },
        {
          attributeName: 'rel',
          expectedValue: 'noopener noreferrer',
          invalidMarkdown: '<a href="https://undergroundwires.dev" rel="nooverride">example</a>',
        },
      ];
      for (const attribute of attributes) {
        const { attributeName, expectedValue, invalidMarkdown } = attribute;

        it(`adds "${attributeName}" attribute to anchors`, () => {
          // arrange
          const renderer = createMarkdownRenderer();
          const markdown = '[undergroundwires.dev](https://undergroundwires.dev)';

          // act
          const htmlString = renderer.render(markdown);

          // assert
          const html = parseHtml(htmlString);
          const aElement = html.getElementsByTagName('a')[0];
          expect(aElement.getAttribute(attributeName)).to.equal(expectedValue);
        });

        it(`overrides existing "${attributeName}" attribute`, () => {
          // arrange
          const renderer = createMarkdownRenderer();

          // act
          const htmlString = renderer.render(invalidMarkdown);

          // assert
          const html = parseHtml(htmlString);
          const aElement = html.getElementsByTagName('a')[0];
          expect(aElement.getAttribute(attributeName)).to.equal(expectedValue);
        });
      }
    });
    it('does not convert single line breaks to <br> elements', () => {
      // arrange
      const renderer = createMarkdownRenderer();
      const markdown = 'Text with\nSingle\nLinebreaks';
      // act
      const htmlString = renderer.render(markdown);
      // assert
      const html = parseHtml(htmlString);
      const totalBrElements = html.getElementsByTagName('br').length;
      expect(totalBrElements).to.equal(0);
    });
    it('converts plain URLs into hyperlinks', () => {
      // arrange
      const renderer = createMarkdownRenderer();
      const expectedUrl = 'https://privacy.sexy/';
      const markdown = `Visit ${expectedUrl} now!`;
      // act
      const htmlString = renderer.render(markdown);
      // assert
      const html = parseHtml(htmlString);
      const aElement = html.getElementsByTagName('a')[0];
      const href = aElement.getAttribute('href');
      expect(href).to.equal(expectedUrl);
    });
    describe('generates readable labels for automatically linked URLs', () => {
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
          const renderer = createMarkdownRenderer();
          const markdown = `Visit ${urlText} now!`;
          // act
          const htmlString = renderer.render(markdown);
          // assert
          const html = parseHtml(htmlString);
          const aElement = html.getElementsByTagName('a')[0];
          expect(aElement.text).to.equal(expectedLabel);
        });
      });
    });
  });
});

function parseHtml(htmlString: string): Document {
  const parser = new window.DOMParser();
  const htmlDoc = parser.parseFromString(htmlString, 'text/html');
  return htmlDoc;
}
