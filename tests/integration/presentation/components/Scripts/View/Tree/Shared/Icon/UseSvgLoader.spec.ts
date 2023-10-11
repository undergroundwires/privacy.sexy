import {
  describe, it, expect,
} from 'vitest';
import { IconNames } from '@/presentation/components/Shared/Icon/IconName';
import { useSvgLoader } from '@/presentation/components/Shared/Icon/UseSvgLoader';
import { waitForValueChange } from '@tests/shared/WaitForValueChange';

describe('useSvgLoader', () => {
  describe('can load all SVGs', () => {
    for (const iconName of IconNames) {
      it(iconName, async () => {
        // act
        const { svgContent } = useSvgLoader(() => iconName);
        await waitForValueChange(svgContent);
        // assert
        expect(svgContent.value).toBeTruthy();
      });
    }
  });
});
