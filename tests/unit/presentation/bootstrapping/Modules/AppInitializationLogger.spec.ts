import { describe, it } from 'vitest';
import { AppInitializationLogger } from '@/presentation/bootstrapping/Modules/AppInitializationLogger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';

describe('AppInitializationLogger', () => {
  it('logs the app initialization marker upon bootstrap', async () => {
    // arrange
    const marker = '[APP_INIT]';
    const loggerStub = new LoggerStub();
    const sut = new AppInitializationLogger(loggerStub);
    // act
    await sut.bootstrap();
    // assert
    loggerStub.assertLogsContainMessagePart('info', marker);
  });
});
