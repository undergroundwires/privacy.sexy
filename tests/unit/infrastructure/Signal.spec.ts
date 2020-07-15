import { Signal } from '@/infrastructure/Events/Signal';
import { expect } from 'chai';

describe('Signal Tests', () => {
    class ReceiverMock {
        public onRecieveCalls = new Array<number>();
        public onReceive(arg: number): void { this.onRecieveCalls.push(arg); }
    }

    let signal: Signal<number>;
    beforeEach(() => signal = new Signal());

    describe('single reciever', () => {
        let receiver: ReceiverMock;

        beforeEach(() => {
            receiver = new ReceiverMock();
            signal.on((arg) => receiver.onReceive(arg));
        });

        it('notify() executes the callback', () => {
            signal.notify(5);
            expect(receiver.onRecieveCalls).to.have.length(1);
        });

        it('notify() executes the callback with the payload', () => {
            const expected = 5;
            signal.notify(expected);
            expect(receiver.onRecieveCalls).to.deep.equal([expected]);
        });
    });

    describe('multiple recievers', () => {
        let receivers: ReceiverMock[];

        beforeEach(() => {
            receivers = [
                new ReceiverMock(), new ReceiverMock(),
                new ReceiverMock(), new ReceiverMock()];
            function subscribeReceiver(receiver: ReceiverMock) {
                signal.on((arg) => receiver.onReceive(arg));
            }
            for (const receiver of receivers) {
                subscribeReceiver(receiver);
            }
        });


        it('notify() should execute all callbacks', () => {
            signal.notify(5);
            receivers.forEach((receiver) => {
                expect(receiver.onRecieveCalls).to.have.length(1);
            });
        });

        it('notify() should execute all callbacks with payload', () => {
            const expected = 5;
            signal.notify(expected);
            receivers.forEach((receiver) => {
                expect(receiver.onRecieveCalls).to.deep.equal([expected]);
            });
        });

        it('notify() executes in FIFO order', () => {
            // arrange
            const expectedSequence = [0, 1, 2, 3];
            const actualSequence = new Array<number>();
            for (let i = 0; i < receivers.length; i++) {
                receivers[i].onReceive = ((arg) => {
                    actualSequence.push(i);
                });
            }
            // act
            signal.notify(5);
            // assert
            expect(actualSequence).to.deep.equal(expectedSequence);
        });

    });

});
