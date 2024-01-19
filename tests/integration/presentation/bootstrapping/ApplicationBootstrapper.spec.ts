import { describe, it } from 'vitest';
import { createApp } from 'vue';
import { ApplicationBootstrapper } from '@/presentation/bootstrapping/ApplicationBootstrapper';
import { expectDoesNotThrowAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';

describe('ApplicationBootstrapper', () => {
  it('can bootstrap without errors', async () => {
    // arrange
    const sut = new ApplicationBootstrapper();
    const vueApp = createApp({});
    // act
    const act = () => sut.bootstrap(vueApp);
    // assert
    await expectDoesNotThrowAsync(act);
  });
});
