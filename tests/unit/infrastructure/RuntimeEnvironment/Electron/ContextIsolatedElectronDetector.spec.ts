import { describe, it, expect } from 'vitest';
import { ContextIsolatedElectronDetector } from '@/infrastructure/RuntimeEnvironment/Electron/ContextIsolatedElectronDetector';
import { ElectronProcessType } from '@/infrastructure/RuntimeEnvironment/Electron/ElectronEnvironmentDetector';

describe('ContextIsolatedElectronDetector', () => {
  describe('isRunningInsideElectron', () => {
    describe('detects Electron environment correctly', () => {
      it('returns true on Electron main process', () => {
        // arrange
        const expectedValue = true;
        const process = createProcessStub({ isElectron: true });
        const userAgent = undefined;
        const detector = new ContextIsolatedElectronDetectorBuilder()
          .withProcess(process)
          .withUserAgent(userAgent)
          .build();
        // act
        const actualValue = detector.isRunningInsideElectron();
        // assert
        expect(actualValue).to.equal(expectedValue);
      });
      it('returns true on Electron preloader process', () => {
        // arrange
        const expectedValue = true;
        const process = createProcessStub({ isElectron: true });
        const userAgent = getElectronUserAgent();
        const detector = new ContextIsolatedElectronDetectorBuilder()
          .withProcess(process)
          .withUserAgent(userAgent)
          .build();
        // act
        const actualValue = detector.isRunningInsideElectron();
        // assert
        expect(actualValue).to.equal(expectedValue);
      });
      it('returns true on Electron renderer process', () => {
        // arrange
        const expectedValue = true;
        const process = undefined;
        const userAgent = getElectronUserAgent();
        const detector = new ContextIsolatedElectronDetectorBuilder()
          .withProcess(process)
          .withUserAgent(userAgent)
          .build();
        // act
        const actualValue = detector.isRunningInsideElectron();
        // assert
        expect(actualValue).to.equal(expectedValue);
      });
      it('returns false on non-Electron environment', () => {
        // arrange
        const expectedValue = false;
        const process = undefined;
        const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'; // non-Electron
        const detector = new ContextIsolatedElectronDetectorBuilder()
          .withProcess(process)
          .withUserAgent(userAgent)
          .build();
        // act
        const actualValue = detector.isRunningInsideElectron();
        // assert
        expect(actualValue).to.equal(expectedValue);
      });
    });
    describe('determineElectronProcessType', () => {
      it('gets Electron process type as main', () => {
        // arrange
        const expectedProcessType: ElectronProcessType = 'main';
        const process = createProcessStub({ isElectron: true });
        const userAgent = undefined;
        const detector = new ContextIsolatedElectronDetectorBuilder()
          .withProcess(process)
          .withUserAgent(userAgent)
          .build();
        // act
        const actualValue = detector.determineElectronProcessType();
        // assert
        expect(actualValue).to.equal(expectedProcessType);
      });
      it('gets Electron process type as preloader', () => {
        // arrange
        const expectedProcessType: ElectronProcessType = 'preloader';
        const process = createProcessStub({ isElectron: true });
        const userAgent = getElectronUserAgent();
        const detector = new ContextIsolatedElectronDetectorBuilder()
          .withProcess(process)
          .withUserAgent(userAgent)
          .build();
        // act
        const actualValue = detector.determineElectronProcessType();
        // assert
        expect(actualValue).to.equal(expectedProcessType);
      });
      it('gets Electron process type as renderer', () => {
        // arrange
        const expectedProcessType: ElectronProcessType = 'renderer';
        const process = undefined;
        const userAgent = getElectronUserAgent();
        const detector = new ContextIsolatedElectronDetectorBuilder()
          .withProcess(process)
          .withUserAgent(userAgent)
          .build();
        // act
        const actualValue = detector.determineElectronProcessType();
        // assert
        expect(actualValue).to.equal(expectedProcessType);
      });
      it('throws non-Electron environment', () => {
        // arrange
        const expectedError = 'Unable to determine the Electron process type. Neither Node.js nor browser-based Electron contexts were detected.';
        const process = undefined;
        const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'; // non-Electron
        const detector = new ContextIsolatedElectronDetectorBuilder()
          .withProcess(process)
          .withUserAgent(userAgent)
          .build();
        // act
        const act = () => detector.determineElectronProcessType();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
});

class ContextIsolatedElectronDetectorBuilder {
  private process: NodeJS.Process | undefined;

  private userAgent: string | undefined;

  public withProcess(process: NodeJS.Process | undefined): this {
    this.process = process;
    return this;
  }

  public withUserAgent(userAgent: string | undefined): this {
    this.userAgent = userAgent;
    return this;
  }

  public build(): ContextIsolatedElectronDetector {
    return new ContextIsolatedElectronDetector(
      () => this.process,
      () => this.userAgent,
    );
  }
}

function getElectronUserAgent() {
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.54 Electron/27.0.0 Safari/537.36';
}

function createProcessStub(options?: {
  readonly isElectron: boolean;
}): NodeJS.Process {
  if (options?.isElectron === true) {
    return {
      versions: {
        electron: '28.1.3',
      } as NodeJS.ProcessVersions,
    } as NodeJS.Process;
  }
  return {} as NodeJS.Process;
}
