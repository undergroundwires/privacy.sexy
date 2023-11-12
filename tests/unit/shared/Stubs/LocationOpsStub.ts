import { ILocationOps } from '@/infrastructure/SystemOperations/ISystemOperations';
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
    const nextInSequence = this.sequence.pop();
    if (nextInSequence) {
      return nextInSequence;
    }
    const key = LocationOpsStub.getScenarioKey(pathSegments);
    const foundScenario = this.scenarios.get(key);
    if (foundScenario) {
      return foundScenario;
    }
    return pathSegments.join('/PATH-SEGMENT-SEPARATOR/');
  }

  private static getScenarioKey(paths: string[]): string {
    return paths.join('|');
  }
}
