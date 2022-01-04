import type { IApplication } from '@/domain/IApplication';
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

  public currentOs: OperatingSystem;

  public get state(): ICategoryCollectionState {
    return this.states[this.collection.os];
  }

  private readonly states: StateMachine;

  public constructor(
    public readonly app: IApplication,
    initialContext: OperatingSystem,
  ) {
    this.states = initializeStates(app);
    this.changeContext(initialContext);
  }

  public changeContext(os: OperatingSystem): void {
    assertInRange(os, OperatingSystem);
    if (this.currentOs === os) {
      return;
    }
    const collection = this.app.getCollection(os);
    this.collection = collection;
    const event: IApplicationContextChangedEvent = {
      newState: this.states[os],
      oldState: this.states[this.currentOs],
    };
    this.contextChanged.notify(event);
    this.currentOs = os;
  }
}

function initializeStates(app: IApplication): StateMachine {
  const machine = new Map<OperatingSystem, ICategoryCollectionState>();
  for (const collection of app.collections) {
    machine[collection.os] = new CategoryCollectionState(collection);
  }
  return machine;
}
