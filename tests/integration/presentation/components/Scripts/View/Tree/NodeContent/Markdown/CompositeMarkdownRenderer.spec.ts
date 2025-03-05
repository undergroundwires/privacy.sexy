import { describe, it, expect } from 'vitest';
import { CompositeMarkdownRenderer } from '@/presentation/components/Scripts/View/Tree/NodeContent/Markdown/CompositeMarkdownRenderer';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { parseHtml } from '@tests/shared/HtmlParser';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';

describe('CompositeMarkdownRenderer', () => {
  describe('can render all docs', () => {
    // arrange
    const renderer = new CompositeMarkdownRenderer();
    for (const node of collectAllDocumentedExecutables()) {
      it(`${node.executableLabel}`, () => {
        // act
        const html = renderer.render(node.docs);
        const result = analyzeHtmlContentForCorrectFormatting(html);
        // assert
        expect(result.isCorrectlyFormatted).to.equal(true, formatAssertionMessage([
          'HTML validation failed',
          `Executable Label: ${node.executableLabel}`,
          `Generated HTML: ${result.generatedHtml}`,
        ]));
      });
    }
  });
  it('should convert plain URLs to hyperlinks and apply markdown formatting', () => {
    // arrange
    const renderer = new CompositeMarkdownRenderer();
    const expectedPlainUrl = 'https://privacy.sexy';
    const expectedLabel = 'privacy.sexy';
    const markdownContent = `Visit ${expectedPlainUrl} for privacy scripts.`;

    // act
    const renderedOutput = renderer.render(markdownContent);

    // assert
    const links = extractHyperlinksFromHtmlContent(renderedOutput);
    assertExpectedNumberOfHyperlinksInContent({
      links, expectedLength: 1, markdownContent, renderedOutput,
    });
    assertHyperlinkWithExpectedLabelUrlAndAttributes({
      link: links[0], expectedHref: expectedPlainUrl, expectedLabel,
    });
  });
  it('should correctly handle inline reference labels converting them to superscript', () => {
    // arrange
    const renderer = new CompositeMarkdownRenderer();
    const expectedInlineReferenceUrlHref = 'https://undergroundwires.dev';
    const expectedInlineReferenceUrlLabel = '1';
    const markdownContent = [
      `See reference [${expectedInlineReferenceUrlLabel}].`,
      '\n',
      `[${expectedInlineReferenceUrlLabel}]: ${expectedInlineReferenceUrlHref} "Example"`,
    ].join('\n');

    // act
    const renderedOutput = renderer.render(markdownContent);

    // assert
    assertSuperscriptReference({
      renderedOutput,
      markdownContent,
      expectedHref: expectedInlineReferenceUrlHref,
      expectedLabel: expectedInlineReferenceUrlLabel,
    });
  });
  it('should process mixed content, converting URLs and references within complex Markdown', () => {
    // arrange
    const renderer = new CompositeMarkdownRenderer();
    const expectedInlineReferenceUrlHref = 'https://undergroundwires.dev';
    const expectedInlineReferenceUrlLabel = 'Example Reference';
    const expectedPlainUrlHref = 'https://privacy.sexy';
    const expectedPlainUrlLabel = 'privacy.sexy';
    const markdownContent = [
      `This is a test of [inline references][${expectedInlineReferenceUrlLabel}] and plain URLs ${expectedPlainUrlHref}`,
      '\n',
      `[${expectedInlineReferenceUrlLabel}]: ${expectedInlineReferenceUrlHref} "Example"`,
    ].join('\n');

    // act
    const renderedOutput = renderer.render(markdownContent);

    // assert
    const links = extractHyperlinksFromHtmlContent(renderedOutput);
    assertExpectedNumberOfHyperlinksInContent({
      links, expectedLength: 2, markdownContent, renderedOutput,
    });
    assertHyperlinkWithExpectedLabelUrlAndAttributes({
      link: links[0],
      expectedHref: expectedInlineReferenceUrlHref,
      expectedLabel: expectedInlineReferenceUrlLabel,
    });
    assertHyperlinkWithExpectedLabelUrlAndAttributes({
      link: links[1],
      expectedHref: expectedPlainUrlHref,
      expectedLabel: expectedPlainUrlLabel,
    });
    assertSuperscriptReference({
      renderedOutput,
      markdownContent,
      expectedHref: expectedInlineReferenceUrlHref,
      expectedLabel: expectedInlineReferenceUrlLabel,
    });
  });
  it('ensures no <br> tags are inserted for single line breaks', () => {
    // arrange
    const renderer = new CompositeMarkdownRenderer();
    const markdownContent = 'Line 1\nLine 2';

    // act
    const renderedOutput = renderer.render(markdownContent);

    // assert
    expect(renderedOutput).not.to.include('<br>', formatAssertionMessage([
      'Expected no <br> tags for single line breaks',
      `Rendered content: ${renderedOutput}`,
    ]));
  });
  it('applies default anchor attributes for all links including dynamically converted ones', () => {
    // arrange
    const renderer = new CompositeMarkdownRenderer();
    const markdownContent = '[Example](https://example.com) and https://privacy.sexy.';

    // act
    const renderedOutput = renderer.render(markdownContent);

    // assert
    const links = extractHyperlinksFromHtmlContent(renderedOutput);
    assertExpectedNumberOfHyperlinksInContent({
      links, expectedLength: 2, markdownContent, renderedOutput,
    });
    Array.from(links).forEach((link) => {
      assertHyperlinkOpensInNewTabWithSecureRelAttributes({ link });
    });
  });
});

function assertExpectedNumberOfHyperlinksInContent(context: {
  readonly links: HTMLAnchorElement[];
  readonly expectedLength: number;
  readonly markdownContent: string;
  readonly renderedOutput: string;
}): void {
  expect(context.links.length).to.equal(context.expectedLength, formatAssertionMessage([
    `Expected exactly "${context.expectedLength}" hyperlinks in the rendered output`,
    `Found ${context.links.length} hyperlinks instead.`,
    `Markdown content: ${context.markdownContent}`,
    `Rendered output: ${context.renderedOutput}`,
  ]));
}

function assertHyperlinkWithExpectedLabelUrlAndAttributes(context: {
  readonly link: HTMLAnchorElement;
  readonly expectedHref: string;
  readonly expectedLabel: string;
}): void {
  expect(context.link.href).to.include(context.expectedHref, formatAssertionMessage([
    'The hyperlink href does not match the expected URL',
    `Expected URL: ${context.expectedHref}`,
    `Actual URL: ${context.link.href}`,
  ]));
  expect(context.link.textContent).to.equal(context.expectedLabel, formatAssertionMessage([
    `Expected text content of the hyperlink to be ${context.expectedLabel}`,
    `Actual text content: ${context.link.textContent}`,
  ]));
  assertHyperlinkOpensInNewTabWithSecureRelAttributes({ link: context.link });
}

function assertHyperlinkOpensInNewTabWithSecureRelAttributes(context: {
  readonly link: HTMLAnchorElement;
}): void {
  expect(context.link.target).to.equal('_blank', formatAssertionMessage([
    'Expected the hyperlink to open in new tabs (target="_blank")',
    `Actual target attribute of a link: ${context.link.target}`,
  ]));
  expect(context.link.rel).to.include('noopener noreferrer', formatAssertionMessage([
    'Expected the hyperlink to have rel="noopener noreferrer" for security',
    `Actual rel attribute of a link: ${context.link.rel}`,
  ]));
}

function assertSuperscriptReference(context: {
  readonly renderedOutput: string;
  readonly markdownContent: string;
  readonly expectedHref: string;
  readonly expectedLabel: string;
}): void {
  const html = parseHtml(context.renderedOutput);
  const superscript = html.getElementsByTagName('sup')[0];
  expectExists(superscript, formatAssertionMessage([
    'Expected at least single superscript.',
    `Rendered content does not contain any superscript: ${context.renderedOutput}`,
    `Markdown content: ${context.markdownContent}`,
  ]));
  const links = extractHyperlinksFromHtmlContent(superscript.innerHTML);
  assertExpectedNumberOfHyperlinksInContent({
    links,
    expectedLength: 1,
    markdownContent: context.markdownContent,
    renderedOutput: context.renderedOutput,
  });
  assertHyperlinkWithExpectedLabelUrlAndAttributes({
    link: links[0],
    expectedHref: context.expectedHref,
    expectedLabel: context.expectedLabel,
  });
}

function extractHyperlinksFromHtmlContent(htmlText: string): HTMLAnchorElement[] {
  const html = parseHtml(htmlText);
  const links = html.getElementsByTagName('a');
  return Array.from(links);
}

interface DocumentedExecutable {
  readonly executableLabel: string
  readonly docs: string
}

function collectAllDocumentedExecutables(): DocumentedExecutable[] {
  const app = loadApplicationComposite();
  const allExecutables = app.collections.flatMap((collection) => [
    ...collection.getAllScripts(),
    ...collection.getAllCategories(),
  ]);
  const allDocumentedExecutables = allExecutables.filter((e) => e.docs.length > 0);
  return allDocumentedExecutables.map((executable): DocumentedExecutable => ({
    executableLabel: `${executable.name} (${executable.executableId})`,
    docs: executable.docs.join('\n'),
  }));
}

interface HTMLValidationResult {
  readonly isCorrectlyFormatted: boolean;
  readonly generatedHtml: string;
}

function analyzeHtmlContentForCorrectFormatting(value: string): HTMLValidationResult {
  const doc = parseHtml(value);
  return {
    isCorrectlyFormatted: Array.from(doc.body.childNodes).some((node) => node.nodeType === 1),
    generatedHtml: doc.body.innerHTML,
  };
}
