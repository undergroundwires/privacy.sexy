import 'mocha';
import { expect } from 'chai';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';

describe('AsyncLazy', () => {
    it('returns value from lambda', async () => {
        // arrange
        const expected = 'test';
        const lambda = () => Promise.resolve(expected);
        const sut = new AsyncLazy(lambda);
        // act
        const actual = await sut.getValueAsync();
        // assert
        expect(actual).to.equal(expected);
    });
    describe('when running multiple times', () => {
        // arrange
        let totalExecuted: number = 0;
        beforeEach(() => totalExecuted = 0);
        it('when running sync', async () => {
            // act
            const sut = new AsyncLazy(() => {
                totalExecuted++;
                return Promise.resolve(totalExecuted);
            });
            const results = new Array<number>();
            for (let i = 0; i < 5; i++) {
                results.push(await sut.getValueAsync());
            }
            // assert
            expect(totalExecuted).to.equal(1);
            expect(results).to.deep.equal([1, 1, 1, 1, 1]);
        });
        it('when running long-running task in parallel', async () => {
            // act
            const sleepAsync = (time: number) => new Promise(((resolve) => setTimeout(resolve, time)));
            const sut = new AsyncLazy(async () => {
                await sleepAsync(100);
                totalExecuted++;
                return Promise.resolve(totalExecuted);
            });
            const results = await Promise.all([
                sut.getValueAsync(),
                sut.getValueAsync(),
                sut.getValueAsync(),
                sut.getValueAsync(),
                sut.getValueAsync()]);
            // assert
            expect(totalExecuted).to.equal(1);
            expect(results).to.deep.equal([1, 1, 1, 1, 1]);
        });
    });
});
