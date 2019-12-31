export interface ISignal<T> {
    on(handler: (data: T) => void): void;
    off(handler: (data: T) => void): void;
}
