import 'mocha';
import { expect } from 'chai';
import { ApplicationFactory, ApplicationGetter } from '@/application/ApplicationFactory';
import { ApplicationStub } from '../stubs/ApplicationStub';

describe('ApplicationFactory', () => {
    describe('ctor', () => {
        it('throws if getter is undefined', () => {
            // arrange
            const expectedError = 'undefined getter';
            const getter = undefined;
            // act
            const act = () => new SystemUnderTest(getter);
            // assert
            expect(act).to.throw(expectedError);
        });
    });
    describe('getAppAsync', () => {
        it('returns result from the getter', async () => {
            // arrange
            const expected = new ApplicationStub();
            const getter: ApplicationGetter = () => expected;
            const sut = new SystemUnderTest(getter);
            // act
            const actual = await Promise.all( [
                sut.getAppAsync(),
                sut.getAppAsync(),
                sut.getAppAsync(),
                sut.getAppAsync(),
            ]);
            // assert
            expect(actual.every((value) => value === expected));
        });
        it('only executes getter once', async () => {
            // arrange
            let totalExecution = 0;
            const expected = new ApplicationStub();
            const getter: ApplicationGetter = () => {
                totalExecution++;
                return expected;
            };
            const sut = new SystemUnderTest(getter);
            // act
            await Promise.all( [
                sut.getAppAsync(),
                sut.getAppAsync(),
                sut.getAppAsync(),
                sut.getAppAsync(),
            ]);
            // assert
            expect(totalExecution).to.equal(1);
        });
    });
});

class SystemUnderTest extends ApplicationFactory {
    public constructor(costlyGetter: ApplicationGetter) {
        super(costlyGetter);
    }
}
