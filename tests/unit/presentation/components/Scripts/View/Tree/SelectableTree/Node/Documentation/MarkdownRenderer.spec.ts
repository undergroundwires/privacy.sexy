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
    it('opens URLs in new tab', () => {
      // arrange
      const renderer = createRenderer();
      const markdown = '[undergroundwires.dev](https://undergroundwires.dev)';
      // act
      const htmlString = renderer.render(markdown);
      // assert
      const html = parseHtml(htmlString);
      const aElement = html.getElementsByTagName('a')[0];
      const href = aElement.getAttribute('target');
      expect(href).to.equal('_blank');
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
