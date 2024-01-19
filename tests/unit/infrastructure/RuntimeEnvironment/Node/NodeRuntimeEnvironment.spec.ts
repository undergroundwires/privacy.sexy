// eslint-disable-next-line max-classes-per-file
import { describe, it, expect } from 'vitest';
import { NodeJSProcessAccessor, NodeRuntimeEnvironment, PlatformToOperatingSystemConverter } from '@/infrastructure/RuntimeEnvironment/Node/NodeRuntimeEnvironment';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { OperatingSystem } from '@/domain/OperatingSystem';

describe('NodeRuntimeEnvironment', () => {
  describe('constructor', () => {
    describe('throws with missing process', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing process';
        const absentProcess = absentValue;
        // act
        const act = () => new NodeRuntimeEnvironmentBuilder()
          .withProcess(absentProcess as never)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeUndefined: true });
    });
  });
  describe('os', () => {
    it('matches specified OS', () => {
      // arrange
      const expectedOs = OperatingSystem.Android;
      const osConverterMock: PlatformToOperatingSystemConverter = () => expectedOs;
      // act
      const environment = new NodeRuntimeEnvironmentBuilder()
        .withOsConverter(osConverterMock)
        .build();
      // assert
      expect(environment.os).to.equal(expectedOs);
    });
    it('uses process platform to determine OS', () => {
      // arrange
      const expectedPlatform: NodeJS.Platform = 'win32';
      let actualPlatform: NodeJS.Platform | undefined;
      const osConverterMock: PlatformToOperatingSystemConverter = (platform) => {
        actualPlatform = platform;
        return undefined;
      };
      const nodeProcessMock = new NodeJSProcessAccessorStub()
        .withPlatform(expectedPlatform);
      // act
      new NodeRuntimeEnvironmentBuilder()
        .withOsConverter(osConverterMock)
        .withProcess(nodeProcessMock)
        .build();
      // assert
      expect(expectedPlatform).to.equal(actualPlatform);
    });
    it('is undefined for unknown platforms', () => {
      // arrange
      const expectedOs = undefined;
      const osConverterMock: PlatformToOperatingSystemConverter = () => undefined;
      // act
      const environment = new NodeRuntimeEnvironmentBuilder()
        .withOsConverter(osConverterMock)
        .build();
      // assert
      expect(environment.os).to.equal(expectedOs);
    });
  });
  describe('isRunningAsDesktopApplication', () => {
    it('is always true', () => {
      // arrange
      const expectedDesktopCondition = true;
      // act
      const environment = new NodeRuntimeEnvironment();
      /// assert
      expect(environment.isRunningAsDesktopApplication).to.equal(expectedDesktopCondition);
    });
  });
  describe('isNonProduction', () => {
    it('identifies development mode', () => {
      // arrange
      const expectedNonProductionCondition = true;
      const nodeProcess = new NodeJSProcessAccessorStub()
        .withNodeEnv('development');
      // act
      const environment = new NodeRuntimeEnvironmentBuilder()
        .withProcess(nodeProcess)
        .build();
      /// assert
      expect(environment.isNonProduction).to.equal(expectedNonProductionCondition);
    });
    it('identifies production mode', () => {
      // arrange
      const expectedNonProductionCondition = false;
      const nodeProcess = new NodeJSProcessAccessorStub()
        .withNodeEnv('production');
      // act
      const environment = new NodeRuntimeEnvironmentBuilder()
        .withProcess(nodeProcess)
        .build();
      /// assert
      expect(environment.isNonProduction).to.equal(expectedNonProductionCondition);
    });
  });
});

class NodeJSProcessAccessorStub implements NodeJSProcessAccessor {
  private nodeEnv?: string = 'development';

  public platform: NodeJS.Platform = 'linux';

  public get env() {
    return {
      NODE_ENV: this.nodeEnv,
    };
  }

  public withNodeEnv(nodeEnv?: string): this {
    this.nodeEnv = nodeEnv;
    return this;
  }

  public withPlatform(platform: NodeJS.Platform): this {
    this.platform = platform;
    return this;
  }
}

class NodeRuntimeEnvironmentBuilder {
  private process?: NodeJSProcessAccessor = new NodeJSProcessAccessorStub();

  private osConverter?: PlatformToOperatingSystemConverter = () => OperatingSystem.Windows;

  public withProcess(process?: NodeJSProcessAccessor): this {
    this.process = process;
    return this;
  }

  public withOsConverter(osConverter?: PlatformToOperatingSystemConverter): this {
    this.osConverter = osConverter;
    return this;
  }

  public build(): NodeRuntimeEnvironment {
    return new NodeRuntimeEnvironment(
      this.process,
      this.osConverter,
    );
  }
}
