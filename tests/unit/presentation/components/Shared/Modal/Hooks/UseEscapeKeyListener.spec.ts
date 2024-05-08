import {
  describe, it, expect,
} from 'vitest';
import { useEscapeKeyListener } from '@/presentation/components/Shared/Modal/Hooks/UseEscapeKeyListener';
import type { UseEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';
import { UseEventListenerStub } from '@tests/unit/shared/Stubs/UseEventListenerStub';

describe('useEscapeKeyListener', () => {
  it('executes the callback when the Escape key is pressed', () => {
    // arrange
    let callbackCalled = false;
    const callback = () => {
      callbackCalled = true;
    };
    const escapeEvent = new KeyboardEvent('keyup', { key: 'Escape' });
    const eventTarget = new EventTarget();
    const context = new TestContext()
      .withEventTarget(eventTarget)
      .withCallback(callback);

    // act
    context.get();
    eventTarget.dispatchEvent(escapeEvent);

    // assert
    expect(callbackCalled).to.equal(true);
  });

  it('does not execute the callback for other key presses', () => {
    // arrange
    let callbackCalled = false;
    const callback = () => {
      callbackCalled = true;
    };
    const enterKeyEvent = new KeyboardEvent('keyup', { key: 'Enter' });
    const eventTarget = new EventTarget();
    const context = new TestContext()
      .withEventTarget(eventTarget)
      .withCallback(callback);

    // act
    context.get();
    eventTarget.dispatchEvent(enterKeyEvent);

    // assert
    expect(callbackCalled).to.equal(false);
  });
});

class TestContext {
  private callback: () => void = () => { /* NOOP */ };

  private useEventListener: UseEventListener = new UseEventListenerStub().get();

  private eventTarget: EventTarget = new EventTarget();

  public withCallback(callback: () => void): this {
    this.callback = callback;
    return this;
  }

  public withUseEventListener(useEventListener: UseEventListener): this {
    this.useEventListener = useEventListener;
    return this;
  }

  public withEventTarget(eventTarget: EventTarget = new EventTarget()): this {
    this.eventTarget = eventTarget;
    return this;
  }

  public get(): ReturnType<typeof useEscapeKeyListener> {
    return useEscapeKeyListener(
      this.callback,
      this.eventTarget,
      this.useEventListener,
    );
  }
}
