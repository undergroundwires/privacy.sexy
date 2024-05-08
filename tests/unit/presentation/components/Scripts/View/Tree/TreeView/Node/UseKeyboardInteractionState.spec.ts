import { describe, it, expect } from 'vitest';
import { useKeyboardInteractionState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/UseKeyboardInteractionState';
import type { UseEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';
import { UseEventListenerStub } from '@tests/unit/shared/Stubs/UseEventListenerStub';

describe('useKeyboardInteractionState', () => {
  describe('isKeyboardBeingUsed', () => {
    it('initializes as `false`', () => {
      // arrange
      const expectedValue = false;
      const context = new TestContext();
      // act
      const { isKeyboardBeingUsed } = context.get();
      // assert
      expect(isKeyboardBeingUsed.value).to.equal(expectedValue);
    });

    it('becomes `true` on `keydown` event', () => {
      // arrange
      const expectedValue = true;
      const eventTarget = new EventTarget();
      const context = new TestContext()
        .withEventTarget(eventTarget);
      // act
      const { isKeyboardBeingUsed } = context.get();
      eventTarget.dispatchEvent(new Event('keydown'));
      // assert
      expect(isKeyboardBeingUsed.value).to.equal(expectedValue);
    });

    it('remains `false` on `click` event', () => {
      // arrange
      const expectedValue = false;
      const eventTarget = new EventTarget();
      const context = new TestContext()
        .withEventTarget(eventTarget);
      // act
      const { isKeyboardBeingUsed } = context.get();
      eventTarget.dispatchEvent(new Event('click'));
      // assert
      expect(isKeyboardBeingUsed.value).to.equal(expectedValue);
    });

    it('transitions back to `false` on `click` event after `keydown` event', () => {
      // arrange
      const expectedValue = false;
      const eventTarget = new EventTarget();
      const context = new TestContext()
        .withEventTarget(eventTarget);
      // act
      const { isKeyboardBeingUsed } = context.get();
      eventTarget.dispatchEvent(new Event('keydown'));
      eventTarget.dispatchEvent(new Event('click'));
      // assert
      expect(isKeyboardBeingUsed.value).to.equal(expectedValue);
    });
  });
});

class TestContext {
  private eventTarget: EventTarget = new EventTarget();

  private useEventListener: UseEventListener = new UseEventListenerStub().get();

  public withEventTarget(eventTarget: EventTarget): this {
    this.eventTarget = eventTarget;
    return this;
  }

  public withUseEventListener(useEventListener: UseEventListener): this {
    this.useEventListener = useEventListener;
    return this;
  }

  public get() {
    return useKeyboardInteractionState(
      this.eventTarget,
      this.useEventListener,
    );
  }
}
