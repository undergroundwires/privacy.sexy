import { describe, it, expect } from 'vitest';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { useLogger } from '@/presentation/components/Shared/Hooks/Log/UseLogger';
import type { LoggerFactory } from '@/presentation/components/Shared/Hooks/Log/LoggerFactory';

describe('UseLogger', () => {
  it('returns expected logger from factory', () => {
    // arrange
    const expectedLogger = new LoggerStub();
    const factoryMock: LoggerFactory = {
      logger: expectedLogger,
    };
    // act
    const { log: actualLogger } = useLogger(factoryMock);
    // assert
    expect(actualLogger).to.equal(expectedLogger);
  });
});
