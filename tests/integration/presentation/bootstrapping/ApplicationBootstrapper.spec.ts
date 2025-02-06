import { describe, it } from 'vitest';
import { createApp } from 'vue';
import { ApplicationBootstrapper } from '@/presentation/bootstrapping/ApplicationBootstrapper';
import { expectDoesNotThrowAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/unit/shared/TestTiming';

describe('ApplicationBootstrapper', () => {
  it('can bootstrap without errors', {
    timeout: BASE_APP_COMPILATION_TIMEOUT_MS + 30 /* seconds */ * 1000,
  }, async () => {
    // arrange
    const sut = new ApplicationBootstrapper();
    const vueApp = createApp({});
    // act
    const act = () => sut.bootstrap(vueApp);
    // assert
    await expectDoesNotThrowAsync(act);
  });
});
