import { describe, it, expect } from 'vitest';
import {
  useAnimationFrameLimiter, type AnimationFrameId, type AnimationFrameRequestCallback,
  type CancelAnimationFrameFunction, type RegisterTeardownCallbackFunction,
  type RequestAnimationFrameFunction,
} from '@/presentation/components/Shared/Hooks/Resize/UseAnimationFrameLimiter';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('useAnimationFrameLimiter', () => {
  describe('resetNextFrame', () => {
    it('schedules the callback in the next animation frame', () => {
      // arrange
      const expectedCallback = () => {};
      let scheduledCallback: AnimationFrameRequestCallback | undefined;
      const requestAnimationFrame: RequestAnimationFrameFunction = (callback) => {
        scheduledCallback = callback;
        return 0;
      };
      const context = new TestContext()
        .withRequestAnimationFrameFunction(requestAnimationFrame);
      // act
      const { resetNextFrame } = context.useAnimationFrameLimiter();
      resetNextFrame(expectedCallback);
      // assert
      expect(scheduledCallback).to.equal(expectedCallback);
    });
    it('cancels the existing animation frame before scheduling a new one', () => {
      // arrange
      const expectedCancelledAnimationFrameId: AnimationFrameId = 5;
      let actualCancelledAnimationFrameId: AnimationFrameId | undefined;
      const requestAnimationFrame: RequestAnimationFrameFunction = () => {
        return expectedCancelledAnimationFrameId;
      };
      const cancelAnimationFrame: CancelAnimationFrameFunction = (animationFrameId) => {
        actualCancelledAnimationFrameId = animationFrameId;
      };
      const context = new TestContext()
        .withRequestAnimationFrameFunction(requestAnimationFrame)
        .withCancelAnimationFrame(cancelAnimationFrame);
      // act
      const { resetNextFrame } = context.useAnimationFrameLimiter();
      resetNextFrame(() => {}); // Nothing to cancel in first call
      resetNextFrame(() => {});
      // assert
      expect(actualCancelledAnimationFrameId).to.equal(expectedCancelledAnimationFrameId);
    });
  });
  describe('cancelNextFrame', () => {
    it('cancels the scheduled animation frame if one exists', () => {
      // arrange
      const expectedCancelledAnimationFrameId: AnimationFrameId = 5;
      let actualCancelledAnimationFrameId: AnimationFrameId | undefined;
      const requestAnimationFrame: RequestAnimationFrameFunction = () => {
        return expectedCancelledAnimationFrameId;
      };
      const cancelAnimationFrame: CancelAnimationFrameFunction = (animationFrameId) => {
        actualCancelledAnimationFrameId = animationFrameId;
      };
      const context = new TestContext()
        .withRequestAnimationFrameFunction(requestAnimationFrame)
        .withCancelAnimationFrame(cancelAnimationFrame);
      // act
      const { resetNextFrame, cancelNextFrame } = context.useAnimationFrameLimiter();
      resetNextFrame(() => {}); // Schedule the initial one
      cancelNextFrame();
      // assert
      expect(actualCancelledAnimationFrameId).to.equal(expectedCancelledAnimationFrameId);
    });
  });
  it('automatically cancels the animation frame on cleanup', () => {
    // arrange
    let actualCancelledAnimationFrameId: AnimationFrameId | undefined;
    let actualCleanupCallback: (() => void) | undefined;
    const onTeardownCallback: RegisterTeardownCallbackFunction = (cleanupCallback) => {
      actualCleanupCallback = cleanupCallback;
    };
    const expectedCancelledAnimationFrameId: AnimationFrameId = 5;
    const requestAnimationFrame: RequestAnimationFrameFunction = () => {
      return expectedCancelledAnimationFrameId;
    };
    const cancelAnimationFrame: CancelAnimationFrameFunction = (animationFrameId) => {
      actualCancelledAnimationFrameId = animationFrameId;
    };
    const testContext = new TestContext()
      .withOnTeardownCallback(onTeardownCallback)
      .withRequestAnimationFrameFunction(requestAnimationFrame)
      .withCancelAnimationFrame(cancelAnimationFrame);
    // act
    const { resetNextFrame } = testContext.useAnimationFrameLimiter();
    resetNextFrame(() => {}); // Schedule the initial one
    // assert
    expectExists(actualCleanupCallback);
    actualCleanupCallback();
    expect(actualCancelledAnimationFrameId).to.equal(expectedCancelledAnimationFrameId);
  });
});

class TestContext {
  private cancelAnimationFrame: CancelAnimationFrameFunction = () => {};

  private requestAnimationFrameFunction: RequestAnimationFrameFunction = () => Math.random();

  private onTeardownCallback: RegisterTeardownCallbackFunction = () => {};

  public withRequestAnimationFrameFunction(
    requestAnimationFrameFunction: RequestAnimationFrameFunction,
  ): this {
    this.requestAnimationFrameFunction = requestAnimationFrameFunction;
    return this;
  }

  public withCancelAnimationFrame(
    cancelAnimationFrame: CancelAnimationFrameFunction,
  ): this {
    this.cancelAnimationFrame = cancelAnimationFrame;
    return this;
  }

  public withOnTeardownCallback(
    registerCleanupCallback: RegisterTeardownCallbackFunction,
  ): this {
    this.onTeardownCallback = registerCleanupCallback;
    return this;
  }

  public useAnimationFrameLimiter(): ReturnType<typeof useAnimationFrameLimiter> {
    return useAnimationFrameLimiter(
      this.cancelAnimationFrame,
      this.requestAnimationFrameFunction,
      this.onTeardownCallback,
    );
  }
}
