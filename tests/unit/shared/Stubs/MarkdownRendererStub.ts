import type { MarkdownRenderer } from '@/presentation/components/Scripts/View/Tree/NodeContent/Markdown/MarkdownRenderer';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class MarkdownRendererStub
  extends StubWithObservableMethodCalls<MarkdownRenderer>
  implements MarkdownRenderer {
  private renderOutput = `[${MarkdownRendererStub.name}]render output`;

  public render(markdownContent: string): string {
    this.registerMethodCall({
      methodName: 'render',
      args: [markdownContent],
    });
    return this.renderOutput;
  }

  public withRenderOutput(renderOutput: string): this {
    this.renderOutput = renderOutput;
    return this;
  }

  public assertRenderWasCalledOnceWith(expectedInput: string): void {
    const calls = this.callHistory.filter((c) => c.methodName === 'render');
    expect(calls).to.have.lengthOf(1);
    const [call] = calls;
    expectExists(call);
    const [actualInput] = call.args;
    expect(actualInput).to.equal(expectedInput);
  }
}
