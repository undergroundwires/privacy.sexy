import { describe, it, expect } from 'vitest';
import { MarkdownRendererStub } from '@tests/unit/shared/Stubs/MarkdownRendererStub';
import type { MarkdownRenderer } from '@/presentation/components/Scripts/View/Tree/NodeContent/Markdown/MarkdownRenderer';
import { CompositeMarkdownRenderer } from '@/presentation/components/Scripts/View/Tree/NodeContent/Markdown/CompositeMarkdownRenderer';

describe('CompositeMarkdownRenderer', () => {
  describe('constructor', () => {
    it('throws error without renderers', () => {
      // arrange
      const expectedError = 'missing renderers';
      const renderers = new Array<MarkdownRenderer>();
      const context = new MarkdownRendererTestBuilder()
        .withMarkdownRenderers(renderers);
      // act
      const act = () => context.render();
      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('render', () => {
    describe('applies modifications', () => {
      describe('with single renderer', () => {
        it('calls the renderer', () => {
          // arrange
          const expectedInput = 'initial content';
          const renderer = new MarkdownRendererStub();
          const context = new MarkdownRendererTestBuilder()
            .withMarkdownInput(expectedInput)
            .withMarkdownRenderers([renderer]);
          // act
          context.render();
          // assert
          renderer.assertRenderWasCalledOnceWith(expectedInput);
        });
        it('matches single renderer output', () => {
          // arrange
          const expectedOutput = 'expected output';
          const renderer = new MarkdownRendererStub()
            .withRenderOutput(expectedOutput);
          const context = new MarkdownRendererTestBuilder()
            .withMarkdownRenderers([renderer]);
          // act
          const actualOutput = context.render();
          // assert
          expect(actualOutput).to.equal(expectedOutput);
        });
      });
      describe('with multiple renderers', () => {
        it('calls all renderers in the provided order', () => {
          // arrange
          const initialInput = 'initial content';
          const firstRendererOutput = 'initial content';
          const firstRenderer = new MarkdownRendererStub()
            .withRenderOutput(firstRendererOutput);
          const secondRenderer = new MarkdownRendererStub();
          const context = new MarkdownRendererTestBuilder()
            .withMarkdownInput(initialInput)
            .withMarkdownRenderers([firstRenderer, secondRenderer]);
          // act
          context.render();
          // assert
          firstRenderer.assertRenderWasCalledOnceWith(initialInput);
          secondRenderer.assertRenderWasCalledOnceWith(firstRendererOutput);
        });
        it('matches final output from sequence', () => {
          // arrange
          const expectedOutput = 'final content';
          const firstRenderer = new MarkdownRendererStub();
          const secondRenderer = new MarkdownRendererStub()
            .withRenderOutput(expectedOutput);
          const context = new MarkdownRendererTestBuilder()
            .withMarkdownRenderers([firstRenderer, secondRenderer]);
          // act
          const actualOutput = context.render();
          // assert
          expect(actualOutput).to.equal(expectedOutput);
        });
      });
    });
  });
});

class MarkdownRendererTestBuilder {
  private markdownInput = `[${MarkdownRendererTestBuilder.name}] Markdown text`;

  private markdownRenderers: readonly MarkdownRenderer[] = [
    new MarkdownRendererStub(),
  ];

  public withMarkdownInput(markdownInput: string): this {
    this.markdownInput = markdownInput;
    return this;
  }

  public withMarkdownRenderers(markdownRenderers: readonly MarkdownRenderer[]): this {
    this.markdownRenderers = markdownRenderers;
    return this;
  }

  public render(): ReturnType<MarkdownRenderer['render']> {
    const renderer = new CompositeMarkdownRenderer(this.markdownRenderers);
    return renderer.render(this.markdownInput);
  }
}
