import { describe, it, expect } from 'vitest';
import { BootstrapperStub } from '@tests/unit/shared/Stubs/BootstrapperStub';
import { ApplicationBootstrapper } from '@/presentation/bootstrapping/ApplicationBootstrapper';
import { expectThrowsAsync } from '@tests/unit/shared/Assertions/ExpectThrowsAsync';
import type { App } from 'vue';

describe('ApplicationBootstrapper', () => {
  it('calls bootstrap on each bootstrapper', async () => {
    // arrange
    const bootstrapper1 = new BootstrapperStub();
    const bootstrapper2 = new BootstrapperStub();
    const sut = new ApplicationBootstrapper([bootstrapper1, bootstrapper2]);
    // act
    await sut.bootstrap({} as App);
    // assert
    expect(bootstrapper1.callHistory.map((c) => c.methodName === 'bootstrap')).to.have.lengthOf(1);
    expect(bootstrapper2.callHistory.map((c) => c.methodName === 'bootstrap')).to.have.lengthOf(1);
  });

  it('calls bootstrap in the correct order', async () => {
    // arrange
    const callOrder: number[] = [];
    const bootstrapper1 = {
      async bootstrap(): Promise<void> {
        callOrder.push(1);
      },
    };
    const bootstrapper2 = {
      async bootstrap(): Promise<void> {
        callOrder.push(2);
      },
    };
    const sut = new ApplicationBootstrapper([bootstrapper1, bootstrapper2]);
    // act
    await sut.bootstrap({} as App);
    // assert
    expect(callOrder).to.deep.equal([1, 2]);
  });

  it('stops if a bootstrapper fails', async () => {
    // arrange
    const expectedError = 'Bootstrap failed';
    const bootstrapper1 = {
      async bootstrap(): Promise<void> {
        throw new Error(expectedError);
      },
    };
    const bootstrapper2 = new BootstrapperStub();
    const sut = new ApplicationBootstrapper([bootstrapper1, bootstrapper2]);
    // act
    const act = async () => { await sut.bootstrap({} as App); };
    // assert
    await expectThrowsAsync(act, expectedError);
    expect(bootstrapper2.callHistory.map((c) => c.methodName === 'bootstrap')).to.have.lengthOf(0);
  });
});
