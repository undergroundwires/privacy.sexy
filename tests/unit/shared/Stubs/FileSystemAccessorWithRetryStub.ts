import type { FileSystemAccessorWithRetry } from '@/presentation/electron/main/Update/ManualUpdater/FileSystemAccessorWithRetry';

export class FileSystemAccessorWithRetryStub {
  private retryAmount = 0;

  public withAlwaysRetry(retryAmount: number): this {
    this.retryAmount = retryAmount;
    return this;
  }

  public get(): FileSystemAccessorWithRetry {
    return async (fileOperation) => {
      const result = await fileOperation();
      for (let i = 0; i < this.retryAmount; i++) {
        // eslint-disable-next-line no-await-in-loop
        await fileOperation();
      }
      return result;
    };
  }
}
