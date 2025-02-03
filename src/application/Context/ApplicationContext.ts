import type { Application } from '@/domain/Application/Application';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { assertInRange } from '@/application/Common/Enum';
import { CategoryCollectionState } from './State/CategoryCollectionState';
import type { IApplicationContext, IApplicationContextChangedEvent } from './IApplicationContext';
import type { ICategoryCollectionState } from './State/ICategoryCollectionState';

type StateMachine = Map<OperatingSystem, ICategoryCollectionState>;

export class ApplicationContext implements IApplicationContext {
  public readonly contextChanged = new EventSource<IApplicationContextChangedEvent>();

  public collection: CategoryCollection;

  public get currentOs(): OperatingSystem {
    return this.collection.os;
  }

  public get state(): ICategoryCollectionState {
    return this.getState(this.collection.os);
  }

  private readonly states: StateMachine;

  public constructor(
    public readonly app: Application,
    initialContext: OperatingSystem,
  ) {
    this.collection = this.getCollection(initialContext);
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
    this.collection = this.getCollection(os);
    this.contextChanged.notify(event);
  }

  private getCollection(os: OperatingSystem): CategoryCollection {
    validateOperatingSystem(os, this.app);
    return this.app.getCollection(os);
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
  app: Application,
): void {
  assertInRange(os, OperatingSystem);
  if (!app.getSupportedOsList().includes(os)) {
    throw new Error(`Operating system "${OperatingSystem[os]}" is not supported.`);
  }
}

function initializeStates(app: Application): StateMachine {
  const machine = new Map<OperatingSystem, ICategoryCollectionState>();
  for (const collection of app.collections) {
    machine.set(collection.os, new CategoryCollectionState(collection));
  }
  return machine;
}
