import { describe, it, expect } from 'vitest';
import { useCodeRunner } from '@/presentation/components/Shared/Hooks/UseCodeRunner';

describe('UseCodeRunner', () => {
  it('returns from the provided window object', () => {
    // arrange
    const mockCodeRunner = { run: () => {} };
    const mockWindow = { codeRunner: mockCodeRunner } as unknown as Window;

    // act
    const { codeRunner } = useCodeRunner(mockWindow);

    // assert
    expect(codeRunner).to.equal(mockCodeRunner);
  });

  it('returns undefined when not defined in the window object', () => {
    // Arrange
    const mockWindow = {} as unknown as Window;

    // Act
    const { codeRunner } = useCodeRunner(mockWindow);

    // Assert
    expect(codeRunner).toBeUndefined();
  });
});
