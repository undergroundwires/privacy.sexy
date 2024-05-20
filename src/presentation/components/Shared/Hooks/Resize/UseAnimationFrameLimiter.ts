import { onBeforeUnmount } from 'vue';

export function useAnimationFrameLimiter(
  cancelAnimationFrame: CancelAnimationFrameFunction = window.cancelAnimationFrame,
  requestAnimationFrame: RequestAnimationFrameFunction = window.requestAnimationFrame,
  onTeardown: RegisterTeardownCallbackFunction = onBeforeUnmount,
): AnimationFrameLimiter {
  let requestId: AnimationFrameId | null = null;
  const cancelNextFrame = () => {
    if (requestId === null) {
      return;
    }
    cancelAnimationFrame(requestId);
  };
  const resetNextFrame = (callback: AnimationFrameRequestCallback) => {
    cancelNextFrame();
    requestId = requestAnimationFrame(callback);
  };
  onTeardown(() => {
    cancelNextFrame();
  });
  return {
    cancelNextFrame,
    resetNextFrame,
  };
}

export type CancelAnimationFrameFunction = typeof window.cancelAnimationFrame;

export type RequestAnimationFrameFunction = (callback: AnimationFrameRequestCallback) => number;

export type RegisterTeardownCallbackFunction = (callback: () => void) => void;

export type AnimationFrameId = ReturnType<typeof requestAnimationFrame>;

export type AnimationFrameRequestCallback = () => void;

export interface AnimationFrameLimiter {
  cancelNextFrame(): void;
  resetNextFrame(callback: AnimationFrameRequestCallback): void;
}
