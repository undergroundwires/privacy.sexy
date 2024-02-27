import type { LocationOps } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class LocationOpsStub
  extends StubWithObservableMethodCalls<LocationOps>
  implements LocationOps {
  private sequence = new Array<string>();

  private scenarios = new Map<string, string>();

  private defaultSeparator = `/[${LocationOpsStub.name}]PATH-SEGMENT-SEPARATOR/`;

  public withJoinResult(returnValue: string, ...paths: string[]): this {
    this.scenarios.set(LocationOpsStub.getScenarioKey(paths), returnValue);
    return this;
  }

  public withJoinResultSequence(...valuesToReturn: string[]): this {
    this.sequence.push(...valuesToReturn);
    this.sequence.reverse();
    return this;
  }

  public withDefaultSeparator(defaultSeparator: string): this {
    this.defaultSeparator = defaultSeparator;
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
    return pathSegments.join(this.defaultSeparator);
  }

  private static getScenarioKey(paths: string[]): string {
    return paths.join('|');
  }
}
