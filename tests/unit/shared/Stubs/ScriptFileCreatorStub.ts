import { ScriptFileCreator } from '@/infrastructure/CodeRunner/Creation/ScriptFileCreator';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ScriptFileCreatorStub
  extends StubWithObservableMethodCalls<ScriptFileCreator>
  implements ScriptFileCreator {
  private createdFilePath = `[${ScriptFileCreatorStub.name}]scriptFilePath`;

  public withCreatedFilePath(path: string): this {
    this.createdFilePath = path;
    return this;
  }

  public createScriptFile(contents: string): Promise<string> {
    this.registerMethodCall({
      methodName: 'createScriptFile',
      args: [contents],
    });
    return Promise.resolve(this.createdFilePath);
  }
}
