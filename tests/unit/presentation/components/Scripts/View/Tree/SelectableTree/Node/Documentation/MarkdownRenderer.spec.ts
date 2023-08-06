import 'mocha';
import { expect } from 'chai';
import { createRenderer } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/Documentation/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  describe('createRenderer', () => {
    it('can create', () => {
      // arrange & act
      const renderer = createRenderer();
      // assert
      expect(renderer !== undefined);
    });
    describe('sets expected anchor attributes', () => {
      const attributes: ReadonlyArray<{
        readonly name: string,
        readonly expectedValue: string,
        readonly invalidMarkdown: string
      }> = [
        {
          name: 'target',
          expectedValue: '_blank',
          invalidMarkdown: '<a href="https://undergroundwires.dev" target="_self">example</a>',
        },
        {
          name: 'rel',
          expectedValue: 'noopener noreferrer',
          invalidMarkdown: '<a href="https://undergroundwires.dev" rel="nooverride">example</a>',
        },
      ];
      for (const attribute of attributes) {
        const { name, expectedValue, invalidMarkdown } = attribute;

        it(`adds "${name}" attribute to anchor elements`, () => {
          // arrange
          const renderer = createRenderer();
          const markdown = '[undergroundwires.dev](https://undergroundwires.dev)';

          // act
          const htmlString = renderer.render(markdown);

          // assert
          const html = parseHtml(htmlString);
          const aElement = html.getElementsByTagName('a')[0];
          expect(aElement.getAttribute(name)).to.equal(expectedValue);
        });

        it(`overrides existing "${name}" attribute`, () => {
          // arrange
          const renderer = createRenderer();

          // act
          const htmlString = renderer.render(invalidMarkdown);

          // assert
          const html = parseHtml(htmlString);
          const aElement = html.getElementsByTagName('a')[0];
          expect(aElement.getAttribute(name)).to.equal(expectedValue);
        });
      }
    });
    it('does not convert single linebreak to <br>', () => {
      // arrange
      const renderer = createRenderer();
      const markdown = 'Text with\nSingle\nLinebreaks';
      // act
      const htmlString = renderer.render(markdown);
      // assert
      const html = parseHtml(htmlString);
      const totalBrElements = html.getElementsByTagName('br').length;
      expect(totalBrElements).to.equal(0);
    });
    it('creates links for plain URL', () => {
      // arrange
      const renderer = createRenderer();
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
    it('it generates beautiful labels for auto-linkified URL', () => {
      // arrange
      const renderer = createRenderer();
      const url = 'https://privacy.sexy';
      const expectedText = 'privacy.sexy';
      const markdown = `Visit ${url} now!`;
      // act
      const htmlString = renderer.render(markdown);
      // assert
      const html = parseHtml(htmlString);
      const aElement = html.getElementsByTagName('a')[0];
      expect(aElement.text).to.equal(expectedText);
    });
  });
});

function parseHtml(htmlString: string): Document {
  const parser = new window.DOMParser();
  const htmlDoc = parser.parseFromString(htmlString, 'text/html');
  return htmlDoc;
}
