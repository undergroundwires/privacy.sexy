import { describe, it, expect } from 'vitest';
import { FileType } from '@/presentation/common/Dialog';
import { BrowserDialog } from '@/infrastructure/Dialog/Browser/BrowserDialog';
import { BrowserSaveFileDialog } from '@/infrastructure/Dialog/Browser/BrowserSaveFileDialog';

describe('BrowserDialog', () => {
  describe('saveFile', () => {
    it('passes correct arguments', () => {
      // arrange
      const expectedFileContents = 'test content';
      const expectedFileName = 'test.sh';
      const expectedFileType = FileType.ShellScript;
      let actualSaveFileArgs: Parameters<BrowserSaveFileDialog['saveFile']> | undefined;
      const fileSaverDialogSpy: BrowserSaveFileDialog = {
        saveFile: (...args) => {
          actualSaveFileArgs = args;
        },
      };
      const browserDialog = new BrowserDialog(fileSaverDialogSpy);

      // act
      browserDialog.saveFile(expectedFileContents, expectedFileName, expectedFileType);

      // assert
      expect(actualSaveFileArgs)
        .to
        .deep
        .equal([expectedFileContents, expectedFileName, expectedFileType]);
    });
  });
});
