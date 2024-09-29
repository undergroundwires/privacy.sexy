import type { IApplicationContext, IApplicationContextChangedEvent } from '@/application/Context/IApplicationContext';
import type { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import type { Application } from '@/domain/Application';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStateStub } from './CategoryCollectionStateStub';
import { ApplicationStub } from './ApplicationStub';
import { EventSourceStub } from './EventSourceStub';
import { ApplicationContextChangedEventStub } from './ApplicationContextChangedEventStub';

export class ApplicationContextStub implements IApplicationContext {
  public state: ICategoryCollectionState = new CategoryCollectionStateStub();

  public changeContext(os: OperatingSystem): void {
    const oldState = this.state;
    const newState = new CategoryCollectionStateStub()
      .withOs(os);
    this.state = newState;
    const event = new ApplicationContextChangedEventStub()
      .withOldState(oldState)
      .withNewState(newState);
    this.dispatchContextChange(event);
  }

  public app: Application = new ApplicationStub();

  public contextChanged = new EventSourceStub<IApplicationContextChangedEvent>();

  public withState(state: ICategoryCollectionState) {
    this.state = state;
    return this;
  }

  public dispatchContextChange(
    event: IApplicationContextChangedEvent = new ApplicationContextChangedEventStub(),
  ) {
    this.contextChanged.notify(event);
  }
}
