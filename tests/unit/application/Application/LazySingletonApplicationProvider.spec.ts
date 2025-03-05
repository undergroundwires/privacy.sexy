import { describe, it, expect } from 'vitest';
import { createOrGetApplication, invalidateApplication } from '@/application/Application/LazySingletonApplicationProvider';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';
import type { ApplicationProvider } from '@/application/Application/ApplicationProvider';
import { ApplicationLoaderStub } from '@tests/unit/shared/Stubs/ApplicationLoaderStub';
import type { ApplicationLoader } from '@/application/Application/Loader/ApplicationLoader';

describe('ApplicationProvider', () => {
  describe('createOrGetApplication', () => {
    beforeEach(() => {
      invalidateApplication();
    });
    it('returns same instance for all calls', async () => {
      // arrange
      const expected = new ApplicationStub();
      const loader = new ApplicationLoaderStub()
        .withApplicationResult(expected)
        .getStub();
      const context = new TestContext()
        .withLoader(loader);
      // act
      const actual = await Promise.all([
        context.provide(),
        context.provide(),
        context.provide(),
        context.provide(),
      ]);
      // assert
      expect(actual.every((value) => value === expected));
    });
    it('executes getter exactly once for calls', async () => {
      // arrange
      const loader = new ApplicationLoaderStub();
      const context = new TestContext()
        .withLoader(loader.getStub());
      // act
      await Promise.all([
        context.provide(),
        context.provide(),
        context.provide(),
        context.provide(),
      ]);
      // assert
      const totalExecution = loader.totalCalls;
      expect(totalExecution).to.equal(1);
    });
  });
});

class TestContext {
  private loader: ApplicationLoader = () => new ApplicationStub();

  public withLoader(loader: ApplicationLoader): this {
    this.loader = loader;
    return this;
  }

  public provide(): ReturnType<ApplicationProvider> {
    return createOrGetApplication(
      this.loader,
    );
  }
}
