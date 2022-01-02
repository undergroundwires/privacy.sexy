import 'mocha';
import { expect } from 'chai';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { sleep } from '@/infrastructure/Threading/AsyncSleep';

describe('AsyncLazy', () => {
  it('returns value from lambda', async () => {
    // arrange
    const expected = 'test';
    const lambda = () => Promise.resolve(expected);
    const sut = new AsyncLazy(lambda);
    // act
    const actual = await sut.getValue();
    // assert
    expect(actual).to.equal(expected);
  });
  describe('when running multiple times', () => {
    // arrange
    let totalExecuted = 0;
    beforeEach(() => {
      totalExecuted = 0;
    });
    it('when running sync', async () => {
      // act
      const sut = new AsyncLazy(() => {
        totalExecuted++;
        return Promise.resolve(totalExecuted);
      });
      const results = new Array<number>();
      for (let i = 0; i < 5; i++) {
        // eslint-disable-next-line no-await-in-loop
        results.push(await sut.getValue());
      }
      // assert
      expect(totalExecuted).to.equal(1);
      expect(results).to.deep.equal([1, 1, 1, 1, 1]);
    });
    it('when running long-running task in parallel', async () => {
      // act
      const sut = new AsyncLazy(async () => {
        await sleep(100);
        totalExecuted++;
        return Promise.resolve(totalExecuted);
      });
      const results = await Promise.all([
        sut.getValue(),
        sut.getValue(),
        sut.getValue(),
        sut.getValue(),
        sut.getValue()]);
      // assert
      expect(totalExecuted).to.equal(1);
      expect(results).to.deep.equal([1, 1, 1, 1, 1]);
    });
  });
});
