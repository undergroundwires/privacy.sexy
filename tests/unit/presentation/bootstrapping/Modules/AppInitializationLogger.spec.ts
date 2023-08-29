import { describe, it, expect } from 'vitest';
import { AppInitializationLogger } from '@/presentation/bootstrapping/Modules/AppInitializationLogger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';

describe('AppInitializationLogger', () => {
  it('logs the app initialization marker upon bootstrap', () => {
    // arrange
    const marker = '[APP_INIT]';
    const loggerStub = new LoggerStub();
    const sut = new AppInitializationLogger(loggerStub);
    // act
    sut.bootstrap();
    // assert
    expect(loggerStub.callHistory).to.have.lengthOf(1);
    expect(loggerStub.callHistory[0].args).to.have.lengthOf(1);
    expect(loggerStub.callHistory[0].args[0]).to.include(marker);
  });
});
