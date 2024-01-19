import { describe, it, expect } from 'vitest';
import { FileSaverDialog, SaveAsFunction, WindowOpenFunction } from '@/infrastructure/Dialog/Browser/FileSaverDialog';
import { FileType } from '@/presentation/common/Dialog';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('FileSaverDialog', () => {
  describe('saveFile', () => {
    describe('saving file with correct mime type', () => {
      const testCases: ReadonlyArray<{
        readonly fileType: FileType;
        readonly expectedMimeType: string;
      }> = [
        { fileType: FileType.BatchFile, expectedMimeType: 'application/bat' },
        { fileType: FileType.ShellScript, expectedMimeType: 'text/x-shellscript' },
      ];
      testCases.forEach(({ fileType, expectedMimeType }) => {
        it(`correct mimeType for ${FileType[fileType]}`, () => {
          // arrange
          let actualMimeType: string | undefined;
          const saveAsSpy: SaveAsFunction = (blob) => {
            actualMimeType = blob.type;
          };

          // act
          new SaveFileTestSetup()
            .withFileType(fileType)
            .withSaveAs(saveAsSpy)
            .saveFile();

          // assert
          expect(actualMimeType).to.equal(expectedMimeType);
        });
      });
    });
    it('blob contains correct file contents', async () => {
      // arrange
      const expectedFileContents = 'expected file contents';
      let actualBlob: Blob | undefined;
      const saveAsSpy: SaveAsFunction = (blob) => {
        actualBlob = blob;
      };

      // act
      new SaveFileTestSetup()
        .withSaveAs(saveAsSpy)
        .withFileContents(expectedFileContents)
        .saveFile();

      // assert
      expectExists(actualBlob);
      const actualFileContents = await actualBlob.text();
      expect(actualFileContents).to.equal(expectedFileContents);
    });
    it('opens new window on save failure', () => {
      // arrange
      const fileContents = 'test file contents';
      const failingSaveAs: SaveAsFunction = () => {
        throw new Error('injected fail');
      };
      let calledArgs: Parameters<WindowOpenFunction> | undefined;
      const windowOpenSpy: WindowOpenFunction = (...args) => {
        calledArgs = args;
      };

      // act
      new SaveFileTestSetup()
        .withSaveAs(failingSaveAs)
        .withFileType(FileType.BatchFile)
        .withFileContents(fileContents)
        .withWindowOpen(windowOpenSpy)
        .saveFile();

      // assert
      expectExists(calledArgs);
      const [url, target, features] = calledArgs;
      const mimeType = 'application/bat';
      expect(url).to.equal(`data:${mimeType},${encodeURIComponent(fileContents)}`);
      expect(target).to.equal('_blank');
      expect(features).to.equal('');
    });
  });
});

class SaveFileTestSetup {
  private saveAs: SaveAsFunction = () => {};

  private windowOpen: WindowOpenFunction = () => {};

  private fileContents: string = `${SaveFileTestSetup.name} file contents`;

  private filename: string = `${SaveFileTestSetup.name} filename`;

  private fileType: FileType = FileType.BatchFile;

  public withSaveAs(saveAs: SaveAsFunction): this {
    this.saveAs = saveAs;
    return this;
  }

  public withFileContents(fileContents: string): this {
    this.fileContents = fileContents;
    return this;
  }

  public withFileType(fileType: FileType): this {
    this.fileType = fileType;
    return this;
  }

  public withWindowOpen(windowOpen: WindowOpenFunction): this {
    this.windowOpen = windowOpen;
    return this;
  }

  public saveFile() {
    const dialog = new FileSaverDialog(
      this.saveAs,
      this.windowOpen,
    );
    return dialog.saveFile(
      this.fileContents,
      this.filename,
      this.fileType,
    );
  }
}
