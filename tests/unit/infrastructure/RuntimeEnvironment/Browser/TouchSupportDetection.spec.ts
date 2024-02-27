import { describe, it, expect } from 'vitest';
import { type BrowserTouchSupportAccessor, isTouchEnabledDevice } from '@/infrastructure/RuntimeEnvironment/Browser/TouchSupportDetection';

describe('TouchSupportDetection', () => {
  describe('isTouchEnabledDevice', () => {
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly accessor: BrowserTouchSupportAccessor;
      readonly expectedTouch: boolean;
    }> = [
      {
        description: 'detects no touch capabilities',
        accessor: createMockAccessor(),
        expectedTouch: false,
      },
      {
        description: 'detects touch capability with defined document.ontouchend',
        accessor: createMockAccessor({ documentOntouchend: () => 'not-undefined' }),
        expectedTouch: true,
      },
      {
        description: 'detects touch capability with navigator.maxTouchPoints > 0',
        accessor: createMockAccessor({ navigatorMaxTouchPoints: () => 1 }),
        expectedTouch: true,
      },
      {
        description: 'detects touch capability when matchMedia for pointer coarse is true',
        accessor: createMockAccessor({
          windowMatchMediaMatches: (query: string) => {
            return query === '(any-pointer: coarse)';
          },
        }),
        expectedTouch: true,
      },
    ];
    testScenarios.forEach(({ description, accessor, expectedTouch }) => {
      it(`${description} - returns ${expectedTouch}`, () => {
        // act
        const isTouchDetected = isTouchEnabledDevice(accessor);
        // assert
        expect(isTouchDetected).to.equal(expectedTouch);
      });
    });
  });
});

function createMockAccessor(
  touchSupportFeatures: Partial<BrowserTouchSupportAccessor> = {},
): BrowserTouchSupportAccessor {
  const defaultTouchSupport: BrowserTouchSupportAccessor = {
    navigatorMaxTouchPoints: () => undefined,
    windowMatchMediaMatches: () => false,
    documentOntouchend: () => undefined,
  };
  return {
    ...defaultTouchSupport,
    ...touchSupportFeatures,
  };
}
