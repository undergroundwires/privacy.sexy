import { ILocationOps } from '@/infrastructure/Environment/SystemOperations/ISystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class LocationOpsStub
  extends StubWithObservableMethodCalls<ILocationOps>
  implements ILocationOps {
  private sequence = new Array<string>();

  private scenarios = new Map<string, string>();

  public withJoinResult(returnValue: string, ...paths: string[]): this {
    this.scenarios.set(LocationOpsStub.getScenarioKey(paths), returnValue);
    return this;
  }

  public withJoinResultSequence(...valuesToReturn: string[]): this {
    this.sequence.push(...valuesToReturn);
    this.sequence.reverse();
    return this;
  }

  public combinePaths(...pathSegments: string[]): string {
    this.registerMethodCall({
      methodName: 'combinePaths',
      args: pathSegments,
    });
    if (this.sequence.length > 0) {
      return this.sequence.pop();
    }
    const key = LocationOpsStub.getScenarioKey(pathSegments);
    if (!this.scenarios.has(key)) {
      return pathSegments.join('/PATH-SEGMENT-SEPARATOR/');
    }
    return this.scenarios.get(key);
  }

  private static getScenarioKey(paths: string[]): string {
    return paths.join('|');
  }
}
