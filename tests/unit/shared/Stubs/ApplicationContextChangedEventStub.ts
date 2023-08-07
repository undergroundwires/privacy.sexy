import { IApplicationContextChangedEvent } from '@/application/Context/IApplicationContext';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { CategoryCollectionStateStub } from './CategoryCollectionStateStub';

export class ApplicationContextChangedEventStub implements IApplicationContextChangedEvent {
  newState: ICategoryCollectionState = new CategoryCollectionStateStub();

  oldState: ICategoryCollectionState = new CategoryCollectionStateStub();

  withNewState(newState: ICategoryCollectionState) {
    this.newState = newState;
    return this;
  }

  withOldState(oldState: ICategoryCollectionState) {
    this.oldState = oldState;
    return this;
  }
}
