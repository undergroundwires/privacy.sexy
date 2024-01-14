import { describe, it, expect } from 'vitest';
import { FileType, SaveFileOutcome } from '@/presentation/common/Dialog';
import { ElectronSaveFileDialog } from '@/infrastructure/Dialog/Electron/ElectronSaveFileDialog';
import { ElectronDialog, ElectronDialogAccessor } from '@/infrastructure/Dialog/Electron/ElectronDialog';

describe('ElectronDialog', () => {
  describe('saveFile', () => {
    it('forwards arguments', async () => {
      // arrange
      const expectedSaveFileArgs = createTestSaveFileArguments();
      let actualSaveFileArgs: Parameters<ElectronSaveFileDialog['saveFile']> | undefined;
      const fileSaverDialogSpy: ElectronSaveFileDialog = {
        saveFile: (...args) => {
          actualSaveFileArgs = args;
          return Promise.resolve({
            success: true,
          });
        },
      };
      const electronDialog = new ElectronDialogBuilder()
        .withSaveFileDialog(fileSaverDialogSpy)
        .build();

      // act
      await electronDialog.saveFile(...expectedSaveFileArgs);

      // assert
      expect(actualSaveFileArgs).to.deep.equal(expectedSaveFileArgs);
    });
    it('forwards outcome', async () => {
      // arrange
      const expectedResult: SaveFileOutcome = {
        success: true,
      };
      const fileSaverDialogMock: ElectronSaveFileDialog = {
        saveFile: () => Promise.resolve(expectedResult),
      };
      const browserDialog = new ElectronDialogBuilder()
        .withSaveFileDialog(fileSaverDialogMock)
        .build();

      // act
      const actualResult = await browserDialog.saveFile(...createTestSaveFileArguments());

      // assert
      expect(actualResult).to.equal(expectedResult);
    });
  });
  describe('showError', () => {
    it('forwards arguments', () => {
      // arrange
      const expectedShowErrorArguments: Parameters<ElectronDialog['showError']> = [
        'test title', 'test message',
      ];
      let actualShowErrorArgs: Parameters<ElectronDialogAccessor['showErrorBox']> | undefined;
      const electronDialogAccessorSpy: ElectronDialogAccessor = {
        showErrorBox: (...args) => {
          actualShowErrorArgs = args;
        },
      };
      const electronDialog = new ElectronDialogBuilder()
        .withElectron(electronDialogAccessorSpy)
        .build();

      // act
      electronDialog.showError(...expectedShowErrorArguments);

      // assert
      expect(actualShowErrorArgs).to.deep.equal(expectedShowErrorArguments);
    });
  });
});

function createTestSaveFileArguments(): Parameters<ElectronSaveFileDialog['saveFile']> {
  return [
    'test file content',
    'test filename',
    FileType.ShellScript,
  ];
}

class ElectronDialogBuilder {
  private electron: ElectronDialogAccessor = {
    showErrorBox: () => {},
  };

  private saveFileDialog: ElectronSaveFileDialog = {
    saveFile: () => Promise.resolve({ success: true }),
  };

  public withElectron(electron: ElectronDialogAccessor): this {
    this.electron = electron;
    return this;
  }

  public withSaveFileDialog(saveFileDialog: ElectronSaveFileDialog): this {
    this.saveFileDialog = saveFileDialog;
    return this;
  }

  public build() {
    return new ElectronDialog(this.saveFileDialog, this.electron);
  }
}
