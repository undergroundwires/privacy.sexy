import { describe, it, expect } from 'vitest';
import { FileType, type SaveFileOutcome } from '@/presentation/common/Dialog';
import { BrowserDialog, type WindowDialogAccessor } from '@/infrastructure/Dialog/Browser/BrowserDialog';
import type { BrowserSaveFileDialog } from '@/infrastructure/Dialog/Browser/BrowserSaveFileDialog';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('BrowserDialog', () => {
  describe('saveFile', () => {
    it('forwards arguments', async () => {
      // arrange
      const expectedSaveFileArgs = createTestSaveFileArguments();
      let actualSaveFileArgs: Parameters<BrowserSaveFileDialog['saveFile']> | undefined;
      const fileSaverDialogSpy: BrowserSaveFileDialog = {
        saveFile: (...args) => {
          actualSaveFileArgs = args;
          return { success: true };
        },
      };
      const browserDialog = new BrowserDialogBuilder()
        .withBrowserSaveFileDialog(fileSaverDialogSpy)
        .build();

      // act
      await browserDialog.saveFile(...expectedSaveFileArgs);

      // assert
      expect(actualSaveFileArgs).to.deep.equal(expectedSaveFileArgs);
    });
    it('forwards outcome', async () => {
      // arrange
      const expectedResult: SaveFileOutcome = {
        success: true,
      };
      const fileSaverDialogMock: BrowserSaveFileDialog = {
        saveFile: () => expectedResult,
      };
      const browserDialog = new BrowserDialogBuilder()
        .withBrowserSaveFileDialog(fileSaverDialogMock)
        .build();

      // act
      const actualResult = await browserDialog.saveFile(...createTestSaveFileArguments());

      // assert
      expect(actualResult).to.equal(expectedResult);
    });
  });
  describe('showError', () => {
    it('alerts with formatted error message', () => {
      // arrange
      const errorTitle = 'Expected Error Title';
      const errorMessage = 'expected error message';
      const expectedMessage = `❌ ${errorTitle}\n\n${errorMessage}`;
      let actualShowErrorArgs: Parameters<WindowDialogAccessor['alert']> | undefined;
      const windowDialogAccessorSpy: WindowDialogAccessor = {
        alert: (...args) => {
          actualShowErrorArgs = args;
        },
      };
      const browserDialog = new BrowserDialogBuilder()
        .withWindowDialogAccessor(windowDialogAccessorSpy)
        .build();

      // act
      browserDialog.showError(errorTitle, errorMessage);

      // assert
      expectExists(actualShowErrorArgs);
      const [actualMessage] = actualShowErrorArgs;
      expect(actualMessage).to.equal(expectedMessage);
    });
  });
});

function createTestSaveFileArguments(): Parameters<BrowserSaveFileDialog['saveFile']> {
  return [
    'test file content',
    'test filename',
    FileType.ShellScript,
  ];
}

class BrowserDialogBuilder {
  private browserSaveFileDialog: BrowserSaveFileDialog = {
    saveFile: () => ({ success: true }),
  };

  private windowDialogAccessor: WindowDialogAccessor = {
    alert: () => { /* NOOP */ },
  };

  public withBrowserSaveFileDialog(browserSaveFileDialog: BrowserSaveFileDialog): this {
    this.browserSaveFileDialog = browserSaveFileDialog;
    return this;
  }

  public withWindowDialogAccessor(windowDialogAccessor: WindowDialogAccessor): this {
    this.windowDialogAccessor = windowDialogAccessor;
    return this;
  }

  public build() {
    return new BrowserDialog(
      this.windowDialogAccessor,
      this.browserSaveFileDialog,
    );
  }
}
