import { describe, it, expect } from 'vitest';
import {
  type AnimationFunction, TRANSITION_DURATION_MILLISECONDS,
  useExpandCollapseAnimation, type MutatedStyleProperties,
} from '@/presentation/components/Shared/ExpandCollapse/UseExpandCollapseAnimation';
import { TimerStub } from '@tests/unit/shared/Stubs/TimerStub';
import { watchPromiseState, flushPromiseResolutionQueue } from '@tests/unit/shared/PromiseInspection';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

describe('UseExpandCollapseAnimation', () => {
  describe('useExpandCollapseAnimation', () => {
    describe('collapse', () => {
      describe('animations', () => {
        runSharedTestsForAnimation((hook) => hook.collapse);
      });
    });
    describe('expand', () => {
      describe('animations', () => {
        runSharedTestsForAnimation((hook) => hook.expand);
      });
    });
  });
});

function runSharedTestsForAnimation(
  getAnimator: (hookResult: ReturnType<typeof useExpandCollapseAnimation>) => AnimationFunction,
) {
  it('completes after transition duration', async () => {
    // arrange
    const timer = new TimerStub();
    const element = createElementMock();
    const passedDurationInMs = TRANSITION_DURATION_MILLISECONDS;
    const hookResult = useExpandCollapseAnimation(timer);
    const animator = getAnimator(hookResult);
    // act
    const promiseState = watchPromiseState(animator(element));
    timer.tickNext(passedDurationInMs);
    await flushPromiseResolutionQueue();
    // assert
    expect(promiseState.isPending()).to.equal(true);
  });
  it('remains unresolved before transition duration', async () => {
    // arrange
    const timer = new TimerStub();
    const element = createElementMock();
    const passedDurationInMs = TRANSITION_DURATION_MILLISECONDS / 2;
    const hookResult = useExpandCollapseAnimation(timer);
    const animator = getAnimator(hookResult);
    // act
    const promiseState = watchPromiseState(animator(element));
    timer.tickNext(passedDurationInMs);
    await flushPromiseResolutionQueue();
    // assert
    expect(promiseState.isFulfilled()).to.equal(false);
  });
  it('restores original styles post-animation', async () => {
    // arrange
    const expectedStyleValues: MutatedStyleProperties = {
      height: 'auto',
      overflow: 'scroll',
      paddingBottom: '5px',
      paddingTop: '5px',
      transition: 'all',
      visibility: 'visible',
      display: 'inline-block',
    };
    const element = document.createElement('div');
    Object.entries(expectedStyleValues).forEach(([key, value]) => {
      element.style[key] = value;
    });
    const timer = new TimerStub();
    const hookResult = useExpandCollapseAnimation(timer);
    const animator = getAnimator(hookResult);
    // act
    const promise = animator(element);
    timer.tickNext(TRANSITION_DURATION_MILLISECONDS);
    await promise;
    // assert
    Object.entries(expectedStyleValues).forEach(([key, expectedStyleValue]) => {
      const actualStyleValue = element.style[key];
      expect(actualStyleValue).to.equal(expectedStyleValue, formatAssertionMessage([
        `Style key: ${key}`,
        `Expected style value: ${expectedStyleValue}`,
        `Actual style value: ${actualStyleValue}`,
        `Initial style value: ${expectedStyleValues}`,
        'All styles:',
        ...Object.entries(expectedStyleValues)
          .map(([k, value]) => `\t- ${k} > actual: "${element.style[k]}" | expected: "${value}"`),
      ]));
    });
  });
}

function createElementMock(): HTMLElement {
  return document.createElement('div');
}
