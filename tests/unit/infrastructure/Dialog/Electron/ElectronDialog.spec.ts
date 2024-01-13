import { describe, it, expect } from 'vitest';
import { FileType } from '@/presentation/common/Dialog';
import { BrowserDialog } from '@/infrastructure/Dialog/Browser/BrowserDialog';
import { ElectronSaveFileDialog } from '@/infrastructure/Dialog/Electron/ElectronSaveFileDialog';

describe('BrowserDialog', () => {
  describe('saveFile', () => {
    it('passes correct arguments', async () => {
      // arrange
      const expectedFileContents = 'test content';
      const expectedFileName = 'test.sh';
      const expectedFileType = FileType.ShellScript;
      let actualSaveFileArgs: Parameters<ElectronSaveFileDialog['saveFile']> | undefined;
      const fileSaverDialogSpy: ElectronSaveFileDialog = {
        saveFile: (...args) => {
          actualSaveFileArgs = args;
          return Promise.resolve();
        },
      };
      const browserDialog = new BrowserDialog(fileSaverDialogSpy);

      // act
      await browserDialog.saveFile(expectedFileContents, expectedFileName, expectedFileType);

      // assert
      expect(actualSaveFileArgs)
        .to
        .deep
        .equal([expectedFileContents, expectedFileName, expectedFileType]);
    });
  });
});
