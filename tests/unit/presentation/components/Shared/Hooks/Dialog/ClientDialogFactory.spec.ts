import { describe, it, expect } from 'vitest';
import {
  createEnvironmentSpecificLoggedDialog, WindowDialogCreationFunction,
  BrowserDialogCreationFunction, DialogLoggingDecorator,
} from '@/presentation/components/Shared/Hooks/Dialog/ClientDialogFactory';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { DialogStub } from '@tests/unit/shared/Stubs/DialogStub';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';
import { Dialog } from '@/presentation/common/Dialog';

describe('ClientDialogFactory', () => {
  describe('createEnvironmentSpecificLoggedDialog', () => {
    describe('dialog selection based on environment', () => {
      describe('when in non-desktop environment', () => {
        it('provides a browser dialog', () => {
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
      describe('when in desktop environment', () => {
        it('provides a window-injected dialog', () => {
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
        it('throws error if window-injected dialog is not available', () => {
          // arrange
          const expectedError = 'Failed to retrieve Dialog API from window object in desktop environment.';
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
    describe('dialog decoration with logging', () => {
      it('returns a dialog decorated with logging', () => {
        // arrange
        const expectedLoggingDialogStub = new DialogStub();
        const decoratorStub: DialogLoggingDecorator = () => expectedLoggingDialogStub;
        const context = new DialogCreationTestSetup()
          .withDialogLoggingDecorator(decoratorStub);

        // act
        const actualDialog = context.createDialogForTest();

        // assert
        expect(expectedLoggingDialogStub).to.equal(actualDialog);
      });
      it('applies logging decorator to the provided dialog', () => {
        // arrange
        const expectedDialog = new DialogStub();
        let actualDecoratedDialog: Dialog | undefined;
        const decoratorStub: DialogLoggingDecorator = (dialog) => {
          actualDecoratedDialog = dialog;
          return new DialogStub();
        };
        const context = new DialogCreationTestSetup()
          .withEnvironment(new RuntimeEnvironmentStub().withIsRunningAsDesktopApplication(false))
          .withBrowserDialogFactory(() => expectedDialog)
          .withDialogLoggingDecorator(decoratorStub);

        // act
        context.createDialogForTest();

        // assert
        expect(expectedDialog).to.equal(actualDecoratedDialog);
      });
    });
  });
});

class DialogCreationTestSetup {
  private environment: RuntimeEnvironment = new RuntimeEnvironmentStub();

  private browserDialogFactory: BrowserDialogCreationFunction = () => new DialogStub();

  private windowInjectedDialogFactory: WindowDialogCreationFunction = () => new DialogStub();

  private dialogLoggingDecorator: DialogLoggingDecorator = (dialog) => dialog;

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

  public withDialogLoggingDecorator(
    dialogLoggingDecorator: DialogLoggingDecorator,
  ): this {
    this.dialogLoggingDecorator = dialogLoggingDecorator;
    return this;
  }

  public createDialogForTest() {
    return createEnvironmentSpecificLoggedDialog(
      this.environment,
      this.dialogLoggingDecorator,
      this.windowInjectedDialogFactory,
      this.browserDialogFactory,
    );
  }
}
