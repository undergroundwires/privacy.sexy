import fileSaver from 'file-saver';
import { FileType, type SaveFileOutcome } from '@/presentation/common/Dialog';
import type { BrowserSaveFileDialog } from './BrowserSaveFileDialog';

export type SaveAsFunction = (data: Blob, filename?: string) => void;

export type WindowOpenFunction = (url: string, target: string, features: string) => void;

export class FileSaverDialog implements BrowserSaveFileDialog {
  constructor(
    private readonly fileSaverSaveAs: SaveAsFunction = fileSaver.saveAs,
    private readonly windowOpen: WindowOpenFunction = window.open.bind(window),
  ) { }

  public saveFile(
    fileContents: string,
    defaultFilename: string,
    fileType: FileType,
  ): SaveFileOutcome {
    const mimeType = MimeTypes[fileType];
    this.saveBlob(fileContents, mimeType, defaultFilename);
    return {
      success: true, // Exceptions are handled internally
    };
  }

  private saveBlob(file: BlobPart, mimeType: string, defaultFilename: string): void {
    try {
      const blob = new Blob([file], { type: mimeType });
      this.fileSaverSaveAs(blob, defaultFilename);
    } catch (e) {
      this.windowOpen(`data:${mimeType},${encodeURIComponent(file.toString())}`, '_blank', '');
    }
  }
}

const MimeTypes: Record<FileType, string> = {
  // Some browsers (including firefox + IE) require right mime type
  // otherwise they ignore extension and save the file as text.
  [FileType.BatchFile]: 'application/bat', // https://en.wikipedia.org/wiki/Batch_file
  [FileType.ShellScript]: 'text/x-shellscript', // https://de.wikipedia.org/wiki/Shellskript#MIME-Typ
  [FileType.Json]: 'application/json', // https://en.wikipedia.org/wiki/JSON

} as const;
