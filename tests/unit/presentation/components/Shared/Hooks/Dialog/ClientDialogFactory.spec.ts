import { describe, it, expect } from 'vitest';
import { determineDialogBasedOnEnvironment, WindowDialogCreationFunction, BrowserDialogCreationFunction } from '@/presentation/components/Shared/Hooks/Dialog/ClientDialogFactory';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { DialogStub } from '@tests/unit/shared/Stubs/DialogStub';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';

describe('ClientDialogFactory', () => {
  describe('determineDialogBasedOnEnvironment', () => {
    describe('non-desktop environment', () => {
      it('returns browser dialog', () => {
        // arrange
        const expectedDialog = new DialogStub();
        const context = new DialogCreationTestSetup()
          .withEnvironment(new RuntimeEnvironmentStub().withIsRunningAsDesktopApplication(false))
          .withBrowserDialogFactory(() => expectedDialog);

        // act
        const actualDialog = context.createDialogForTest();

        // assert
        expect(expectedDialog).to.equal(actualDialog);
      });
    });
    describe('desktop environment', () => {
      it('returns window-injected dialog', () => {
        // arrange
        const expectedDialog = new DialogStub();
        const context = new DialogCreationTestSetup()
          .withEnvironment(new RuntimeEnvironmentStub().withIsRunningAsDesktopApplication(true))
          .withWindowInjectedDialogFactory(() => expectedDialog);

        // act
        const actualDialog = context.createDialogForTest();

        // assert
        expect(expectedDialog).to.equal(actualDialog);
      });
      it('throws error when window-injected dialog is unavailable', () => {
        // arrange
        const expectedError = 'The Dialog API could not be retrieved from the window object.';
        const context = new DialogCreationTestSetup()
          .withEnvironment(new RuntimeEnvironmentStub().withIsRunningAsDesktopApplication(true))
          .withWindowInjectedDialogFactory(() => undefined);

        // act
        const act = () => context.createDialogForTest();

        // assert
        const actualError = collectExceptionMessage(act);
        expect(actualError).to.include(expectedError);
      });
    });
  });
});

class DialogCreationTestSetup {
  private environment: RuntimeEnvironment = new RuntimeEnvironmentStub();

  private browserDialogFactory: BrowserDialogCreationFunction = () => new DialogStub();

  private windowInjectedDialogFactory: WindowDialogCreationFunction = () => new DialogStub();

  public withEnvironment(environment: RuntimeEnvironment): this {
    this.environment = environment;
    return this;
  }

  public withBrowserDialogFactory(browserDialogFactory: BrowserDialogCreationFunction): this {
    this.browserDialogFactory = browserDialogFactory;
    return this;
  }

  public withWindowInjectedDialogFactory(
    windowInjectedDialogFactory: WindowDialogCreationFunction,
  ): this {
    this.windowInjectedDialogFactory = windowInjectedDialogFactory;
    return this;
  }

  public createDialogForTest() {
    return determineDialogBasedOnEnvironment(
      this.environment,
      this.windowInjectedDialogFactory,
      this.browserDialogFactory,
    );
  }
}
