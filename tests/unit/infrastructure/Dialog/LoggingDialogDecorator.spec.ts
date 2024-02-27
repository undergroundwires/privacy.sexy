import { describe, it, expect } from 'vitest';
import type { Logger } from '@/application/Common/Log/Logger';
import { decorateWithLogging } from '@/infrastructure/Dialog/LoggingDialogDecorator';
import { type Dialog, FileType, type SaveFileOutcome } from '@/presentation/common/Dialog';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { DialogStub } from '@tests/unit/shared/Stubs/DialogStub';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';

describe('LoggingDialogDecorator', () => {
  describe('decorateWithLogging', () => {
    describe('saveFile', () => {
      it('delegates call to dialog', async () => {
        // arrange
        const expectedArguments = createTestSaveFileArguments();
        const dialog = new DialogStub();
        const context = new LoggingDialogDecoratorTestSetup()
          .withDialog(dialog);

        // act
        const decorator = context.decorateWithLogging();
        await decorator.saveFile(...expectedArguments);

        // assert
        expect(dialog.callHistory).to.have.lengthOf(1);
        const call = dialog.callHistory.find((c) => c.methodName === 'saveFile');
        expectExists(call);
        const actualArguments = call.args;
        expect(expectedArguments).to.deep.equal(actualArguments);
      });
      it('returns dialog\'s response', async () => {
        // arrange
        const expectedResult: SaveFileOutcome = { success: true };
        const dialog = new DialogStub();
        dialog.saveFile = () => Promise.resolve(expectedResult);
        const context = new LoggingDialogDecoratorTestSetup()
          .withDialog(dialog);

        // act
        const decorator = context.decorateWithLogging();
        const actualResult = await decorator.saveFile(...createTestSaveFileArguments());

        // assert
        expect(expectedResult).to.equal(actualResult);
      });
      it('logs information on invocation', async () => {
        // arrange
        const expectedLogMessagePart = 'Opening save file dialog';
        const loggerStub = new LoggerStub();
        const context = new LoggingDialogDecoratorTestSetup()
          .withLogger(loggerStub);

        // act
        const decorator = context.decorateWithLogging();
        await decorator.saveFile(...createTestSaveFileArguments());

        // assert
        loggerStub.assertLogsContainMessagePart('info', expectedLogMessagePart);
      });
      it('logs information on success', async () => {
        // arrange
        const expectedLogMessagePart = 'completed successfully';
        const loggerStub = new LoggerStub();
        const context = new LoggingDialogDecoratorTestSetup()
          .withLogger(loggerStub);

        // act
        const decorator = context.decorateWithLogging();
        await decorator.saveFile(...createTestSaveFileArguments());

        // assert
        loggerStub.assertLogsContainMessagePart('info', expectedLogMessagePart);
      });
      it('logs error on save failure', async () => {
        // arrange
        const expectedLogMessagePart = 'Error encountered';
        const loggerStub = new LoggerStub();
        const dialog = new DialogStub();
        dialog.saveFile = () => Promise.resolve({ success: false, error: { message: 'error', type: 'DialogDisplayError' } });
        const context = new LoggingDialogDecoratorTestSetup()
          .withLogger(loggerStub);

        // act
        const decorator = context.decorateWithLogging();
        await decorator.saveFile(...createTestSaveFileArguments());

        // assert
        loggerStub.assertLogsContainMessagePart('error', expectedLogMessagePart);
      });
    });
    describe('showError', () => {
      it('delegates call to the dialog', () => {
        // arrange
        const expectedArguments = createTestShowErrorArguments();
        const dialog = new DialogStub();
        const context = new LoggingDialogDecoratorTestSetup()
          .withDialog(dialog);

        // act
        const decorator = context.decorateWithLogging();
        decorator.showError(...expectedArguments);

        // assert
        expect(dialog.callHistory).to.have.lengthOf(1);
        const call = dialog.callHistory.find((c) => c.methodName === 'showError');
        expectExists(call);
        const actualArguments = call.args;
        expect(expectedArguments).to.deep.equal(actualArguments);
      });
      it('logs error message', () => {
        // arrange
        const expectedLogMessagePart = 'Showing error dialog';
        const loggerStub = new LoggerStub();
        const context = new LoggingDialogDecoratorTestSetup()
          .withLogger(loggerStub);

        // act
        const decorator = context.decorateWithLogging();
        decorator.showError(...createTestShowErrorArguments());

        // assert
        loggerStub.assertLogsContainMessagePart('error', expectedLogMessagePart);
      });
    });
  });
});

class LoggingDialogDecoratorTestSetup {
  private dialog: Dialog = new DialogStub();

  private logger: Logger = new LoggerStub();

  public withDialog(dialog: Dialog): this {
    this.dialog = dialog;
    return this;
  }

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public decorateWithLogging() {
    return decorateWithLogging(
      this.dialog,
      this.logger,
    );
  }
}

function createTestSaveFileArguments(): Parameters<Dialog['saveFile']> {
  return [
    'test-file-contents',
    'test-default-filename',
    FileType.BatchFile,
  ];
}

function createTestShowErrorArguments(): Parameters<Dialog['showError']> {
  return [
    'test-error-title',
    'test-error-message',
  ];
}
