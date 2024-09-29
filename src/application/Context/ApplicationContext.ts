import type { IApplication } from '@/domain/IApplication';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { assertInRange } from '@/application/Common/Enum';
import { CategoryCollectionState } from './State/CategoryCollectionState';
import type { IApplicationContext, IApplicationContextChangedEvent } from './IApplicationContext';
import type { ICategoryCollectionState } from './State/ICategoryCollectionState';

type StateMachine = Map<OperatingSystem, ICategoryCollectionState>;

export class ApplicationContext implements IApplicationContext {
  public readonly contextChanged = new EventSource<IApplicationContextChangedEvent>();

  public collection: ICategoryCollection;

  public currentOs: OperatingSystem;

  public get state(): ICategoryCollectionState {
    return this.getState(this.collection.os);
  }

  private readonly states: StateMachine;

  public constructor(
    public readonly app: IApplication,
    initialContext: OperatingSystem,
  ) {
    this.setContext(initialContext);
    this.states = initializeStates(app);
  }

  public changeContext(os: OperatingSystem): void {
    if (this.currentOs === os) {
      return;
    }
    const event: IApplicationContextChangedEvent = {
      newState: this.getState(os),
      oldState: this.getState(this.currentOs),
    };
    this.setContext(os);
    this.contextChanged.notify(event);
  }

  private setContext(os: OperatingSystem): void {
    validateOperatingSystem(os, this.app);
    this.collection = this.app.getCollection(os);
    this.currentOs = os;
  }

  private getState(os: OperatingSystem): ICategoryCollectionState {
    const state = this.states.get(os);
    if (!state) {
      throw new Error(`Operating system "${OperatingSystem[os]}" state is unknown.`);
    }
    return state;
  }
}

function validateOperatingSystem(
  os: OperatingSystem,
  app: IApplication,
): void {
  assertInRange(os, OperatingSystem);
  if (!app.getSupportedOsList().includes(os)) {
    throw new Error(`Operating system "${OperatingSystem[os]}" is not supported.`);
  }
}

function initializeStates(app: IApplication): StateMachine {
  const machine = new Map<OperatingSystem, ICategoryCollectionState>();
  for (const collection of app.collections) {
    machine.set(collection.os, new CategoryCollectionState(collection));
  }
  return machine;
}
