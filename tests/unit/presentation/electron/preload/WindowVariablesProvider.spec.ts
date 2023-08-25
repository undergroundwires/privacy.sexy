import { describe, it, expect } from 'vitest';
import { provideWindowVariables } from '@/presentation/electron/preload/WindowVariablesProvider';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISystemOperations } from '@/infrastructure/Environment/SystemOperations/ISystemOperations';

describe('WindowVariablesProvider', () => {
  describe('provideWindowVariables', () => {
    it('returns expected system', () => {
      // arrange
      const expectedValue = new SystemOperationsStub();
      // act
      const variables = new TestContext()
        .withSystem(expectedValue)
        .provideWindowVariables();
      // assert
      expect(variables.system).to.equal(expectedValue);
    });
    it('returns expected os', () => {
      // arrange
      const expectedValue = OperatingSystem.WindowsPhone;
      // act
      const variables = new TestContext()
        .withOs(expectedValue)
        .provideWindowVariables();
      // assert
      expect(variables.os).to.equal(expectedValue);
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

  public withSystem(system: ISystemOperations): this {
    this.system = system;
    return this;
  }

  public withOs(os: OperatingSystem): this {
    this.os = os;
    return this;
  }

  public provideWindowVariables() {
    return provideWindowVariables(
      () => this.system,
      () => this.os,
    );
  }
}
