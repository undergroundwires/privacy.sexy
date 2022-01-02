import { EventSource } from '../Events/EventSource';

export class AsyncLazy<T> {
  private valueCreated = new EventSource();

  private isValueCreated = false;

  private isCreatingValue = false;

  private value: T | undefined;

  constructor(private valueFactory: () => Promise<T>) {}

  public setValueFactory(valueFactory: () => Promise<T>) {
    this.valueFactory = valueFactory;
  }

  public async getValue(): Promise<T> {
    // If value is already created, return the value directly
    if (this.isValueCreated) {
      return Promise.resolve(this.value);
    }
    // If value is being created, wait until the value is created and then return it.
    if (this.isCreatingValue) {
      return new Promise<T>((resolve) => {
        // Return/result when valueCreated event is triggered.
        this.valueCreated.on(() => resolve(this.value));
      });
    }
    this.isCreatingValue = true;
    this.value = await this.valueFactory();
    this.isCreatingValue = false;
    this.isValueCreated = true;
    this.valueCreated.notify(null);
    return Promise.resolve(this.value);
  }
}
