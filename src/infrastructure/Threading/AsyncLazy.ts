import { EventSource } from '../Events/EventSource';

export class AsyncLazy<T> {
  private valueCreated = new EventSource<T>();

  private state: ValueState<T> = { status: ValueStatus.NotRequested };

  constructor(private valueFactory: () => Promise<T>) {}

  public setValueFactory(valueFactory: () => Promise<T>) {
    this.valueFactory = valueFactory;
  }

  public getValue(): Promise<T> {
    if (this.state.status === ValueStatus.Created) {
      return Promise.resolve(this.state.value);
    }
    if (this.state.status === ValueStatus.BeingCreated) {
      return this.state.value;
    }
    const valuePromise = this.valueFactory();
    this.state = {
      status: ValueStatus.BeingCreated,
      value: valuePromise,
    };
    valuePromise.then((value) => {
      this.state = {
        status: ValueStatus.Created,
        value,
      };
      this.valueCreated.notify(value);
    });
    return valuePromise;
  }
}

enum ValueStatus {
  NotRequested,
  BeingCreated,
  Created,
}

type ValueState<T> =
  | {
    readonly status: ValueStatus.NotRequested;
  }
  | {
    readonly status: ValueStatus.BeingCreated;
    readonly value: Promise<T>;
  }
  | {
    readonly status: ValueStatus.Created;
    readonly value: T
  };
