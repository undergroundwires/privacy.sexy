import {
  beforeEach, afterEach, vi, expect,
} from 'vitest';
import type { FunctionKeys } from '@/TypeHelpers';

export function failTestOnConsoleError() {
  const consoleMethodsToCheck: readonly FunctionKeys<Console>[] = [
    'warn',
    'error',
  ];

  beforeEach(() => {
    consoleMethodsToCheck.forEach((methodName) => {
      vi.spyOn(console, methodName).mockClear();
    });
  });

  afterEach(() => {
    consoleMethodsToCheck.forEach((methodName) => {
      expect(console[methodName]).not.toHaveBeenCalled();
    });
  });
}
