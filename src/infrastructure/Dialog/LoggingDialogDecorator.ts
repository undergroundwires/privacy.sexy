import type { Logger } from '@/application/Common/Log/Logger';
import type { Dialog, FileType } from '@/presentation/common/Dialog';

export function decorateWithLogging(
  dialog: Dialog,
  logger: Logger,
): Dialog {
  return new LoggingDialogDecorator(dialog, logger);
}

class LoggingDialogDecorator implements Dialog {
  constructor(
    private readonly dialog: Dialog,
    private readonly logger: Logger,
  ) { }

  public async saveFile(
    fileContents: string,
    defaultFilename: string,
    fileType: FileType,
  ) {
    this.logger.info(`Opening save file dialog with default filename: ${defaultFilename}.`);
    const dialogResult = await this.dialog.saveFile(fileContents, defaultFilename, fileType);
    if (dialogResult.success) {
      this.logger.info('File saving process completed successfully.');
    } else {
      this.logger.error('Error encountered while saving the file.', dialogResult.error);
    }
    return dialogResult;
  }

  public showError(title: string, message: string) {
    this.logger.error(`Showing error dialog: ${title} - ${message}`);
    this.dialog.showError(title, message);
  }
}
