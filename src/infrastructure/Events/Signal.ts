import { ISignal } from './ISignal';
export { ISignal };

export class Signal<T> implements ISignal<T> {
    private handlers: Array<(data: T) => void> = [];

    public on(handler: (data: T) => void): void {
        this.handlers.push(handler);
    }

    public off(handler: (data: T) => void): void {
        this.handlers = this.handlers.filter((h) => h !== handler);
    }

    public notify(data: T) {
        this.handlers.slice(0).forEach((h) => h(data));
    }
}
