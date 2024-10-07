import type { FileWriteErrorType, FileWriteOutcome, ReadbackFileWriter } from '@/infrastructure/FileSystem/ReadbackFileWriter/ReadbackFileWriter';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ReadbackFileWriterStub
  extends StubWithObservableMethodCalls<ReadbackFileWriter>
  implements ReadbackFileWriter {
  private outcome: FileWriteOutcome = { success: true };

  public writeAndVerifyFile(
    ...args: Parameters<ReadbackFileWriter['writeAndVerifyFile']>
  ): Promise<FileWriteOutcome> {
    this.registerMethodCall({
      methodName: 'writeAndVerifyFile',
      args: [...args],
    });
    return Promise.resolve(this.outcome);
  }

  public configureFailure(errorType: FileWriteErrorType, message: string): this {
    this.outcome = {
      success: false,
      error: {
        type: errorType,
        message: `[${ReadbackFileWriterStub.name}] ${message}`,
      },
    };
    return this;
  }
}
