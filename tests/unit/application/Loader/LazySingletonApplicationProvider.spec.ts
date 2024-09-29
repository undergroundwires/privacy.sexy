import { describe, it, expect } from 'vitest';
import { createOrGetApplication } from '@/application/Loader/LazySingletonApplicationProvider';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';
import type { ApplicationLoader } from '@/application/Loader/ApplicationLoader';

describe('LazySingletonApplicationProvider', () => {
  describe('createOrGetApplication', () => {
    it('returns result from the getter', async () => {
      // arrange
      const expected = new ApplicationStub();
      const creator: ApplicationLoader = () => expected;
      const context = new TestContext()
        .withCreator(creator);
      // act
      const actual = await Promise.all([
        context.run(),
        context.run(),
        context.run(),
        context.run(),
      ]);
      // assert
      expect(actual.every((value) => value === expected));
    });
    it('only executes getter once', async () => {
      // arrange
      let totalExecution = 0;
      const expected = new ApplicationStub();
      const creator: ApplicationLoader = () => {
        totalExecution++;
        return expected;
      };
      const context = new TestContext()
        .withCreator(creator);
      // act
      await Promise.all([
        context.run(),
        context.run(),
        context.run(),
        context.run(),
      ]);
      // assert
      expect(totalExecution).to.equal(1);
    });
  });
});

class TestContext {
  private loader: ApplicationLoader = () => new ApplicationStub();

  public withCreator(loader: ApplicationLoader): this {
    this.loader = loader;
    return this;
  }

  public run(): ReturnType<typeof createOrGetApplication> {
    return createOrGetApplication(this.loader);
  }
}
