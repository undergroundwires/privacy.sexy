import { describe, it, expect } from 'vitest';
import { useLogger } from '@/presentation/components/Shared/Hooks/UseLogger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { LoggerFactoryStub } from '@tests/unit/shared/Stubs/LoggerFactoryStub';

describe('UseLogger', () => {
  it('returns expected logger from factory', () => {
    // arrange
    const expectedLogger = new LoggerStub();
    const factory = new LoggerFactoryStub()
      .withLogger(expectedLogger);
    // act
    const { log: actualLogger } = useLogger(factory);
    // assert
    expect(actualLogger).to.equal(expectedLogger);
  });
});
