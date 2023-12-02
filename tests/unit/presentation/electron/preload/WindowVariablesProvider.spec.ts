import { describe, it, expect } from 'vitest';
import { provideWindowVariables } from '@/presentation/electron/preload/WindowVariablesProvider';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISystemOperations } from '@/infrastructure/SystemOperations/ISystemOperations';
import { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';

describe('WindowVariablesProvider', () => {
  describe('provideWindowVariables', () => {
    it('returns expected `system`', () => {
      // arrange
      const expectedValue = new SystemOperationsStub();
      // act
      const variables = new TestContext()
        .withSystem(expectedValue)
        .provideWindowVariables();
      // assert
      expect(variables.system).to.equal(expectedValue);
    });
    it('returns expected `os`', () => {
      // arrange
      const expectedValue = OperatingSystem.WindowsPhone;
      // act
      const variables = new TestContext()
        .withOs(expectedValue)
        .provideWindowVariables();
      // assert
      expect(variables.os).to.equal(expectedValue);
    });
    it('returns expected `log`', () => {
      // arrange
      const expectedValue = new LoggerStub();
      // act
      const variables = new TestContext()
        .withLogger(expectedValue)
        .provideWindowVariables();
      // assert
      expect(variables.log).to.equal(expectedValue);
    });
    it('`isDesktop` is true', () => {
      // arrange
      const expectedValue = true;
      // act
      const variables = new TestContext()
        .provideWindowVariables();
      // assert
      expect(variables.isDesktop).to.equal(expectedValue);
    });
  });
});

class TestContext {
  private system: ISystemOperations = new SystemOperationsStub();

  private os: OperatingSystem = OperatingSystem.Android;

  private log: Logger = new LoggerStub();

  public withSystem(system: ISystemOperations): this {
    this.system = system;
    return this;
  }

  public withOs(os: OperatingSystem): this {
    this.os = os;
    return this;
  }

  public withLogger(log: Logger): this {
    this.log = log;
    return this;
  }

  public provideWindowVariables() {
    return provideWindowVariables(
      () => this.system,
      () => this.log,
      () => this.os,
    );
  }
}
