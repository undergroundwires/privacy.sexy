import { ISignal } from '@/infrastructure/Events/ISignal';
import { IEventSubscription } from '@/infrastructure/Events/ISubscription';
import { Signal } from '@/infrastructure/Events/Signal';
import { expect } from 'chai';
import { EventHandler } from '@/infrastructure/Events/ISignal';


describe('Signal', () => {
    class ObserverMock {
        public readonly onReceiveCalls = new Array<number>();
        public readonly callbacks = new Array<EventHandler<number>>();
        public readonly subscription: IEventSubscription;
        constructor(subject: ISignal<number>) {
            this.callbacks.push((arg) => this.onReceiveCalls.push(arg));
            this.subscription = subject.on((arg) => this.callbacks.forEach((action) => action(arg)));
        }
    }
    let signal: Signal<number>;
    beforeEach(() => signal = new Signal());
    describe('single observer', () => {
        // arrange
        let observer: ObserverMock;
        beforeEach(() => {
            observer = new ObserverMock(signal);
        });
        it('notify() executes the callback', () => {
            // act
            signal.notify(5);
            // assert
            expect(observer.onReceiveCalls).to.have.length(1);
        });
        it('notify() executes the callback with the payload', () => {
            const expected = 5;
            // act
            signal.notify(expected);
            // assert
            expect(observer.onReceiveCalls).to.deep.equal([expected]);
        });
        it('notify() does not call callback when unsubscribed', () => {
            // act
            observer.subscription.unsubscribe();
            signal.notify(5);
            // assert
            expect(observer.onReceiveCalls).to.have.lengthOf(0);
        });
    });

    describe('multiple observers', () => {
        // arrange
        let observers: ObserverMock[];
        beforeEach(() => {
            observers = [
                new ObserverMock(signal), new ObserverMock(signal),
                new ObserverMock(signal), new ObserverMock(signal),
            ];
        });
        it('notify() should execute all callbacks', () => {
            // act
            signal.notify(5);
            // assert
            observers.forEach((observer) => {
                expect(observer.onReceiveCalls).to.have.length(1);
            });
        });
        it('notify() should execute all callbacks with payload', () => {
            const expected = 5;
            // act
            signal.notify(expected);
            // assert
            observers.forEach((observer) => {
                expect(observer.onReceiveCalls).to.deep.equal([expected]);
            });
        });
        it('notify() executes in FIFO order', () => {
            // arrange
            const expectedSequence = [0, 1, 2, 3];
            const actualSequence = new Array<number>();
            for (let i = 0; i < observers.length; i++) {
                observers[i].callbacks.push(() => actualSequence.push(i));
            }
            // act
            signal.notify(5);
            // assert
            expect(actualSequence).to.deep.equal(expectedSequence);
        });
    });
});
