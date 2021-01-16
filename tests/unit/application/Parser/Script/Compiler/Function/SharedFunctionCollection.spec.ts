import 'mocha';
import { expect } from 'chai';
import { SharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/SharedFunctionCollection';
import { SharedFunctionStub } from '../../../../../stubs/SharedFunctionStub';

describe('SharedFunctionCollection', () => {
    describe('addFunction', () => {
        it('throws if function is undefined', () => {
            // arrange
            const expectedError = 'undefined function';
            const func = undefined;
            const sut = new SharedFunctionCollection();
            // act
            const act = () => sut.addFunction(func);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws if function with same name already exists', () => {
            // arrange
            const functionName = 'duplicate-function';
            const expectedError = `function with name ${functionName} already exists`;
            const func = new SharedFunctionStub()
                .withName('duplicate-function');
            const sut = new SharedFunctionCollection();
            sut.addFunction(func);
            // act
            const act = () => sut.addFunction(func);
            // assert
            expect(act).to.throw(expectedError);

        });
    });
    describe('getFunctionByName', () => {
        it('throws if name is undefined', () => {
            // arrange
            const expectedError = 'undefined function name';
            const invalidValues = [ undefined, '' ];
            const sut = new SharedFunctionCollection();
            for (const invalidValue of invalidValues) {
                const name = invalidValue;
                // act
                const act = () => sut.getFunctionByName(name);
                // assert
                expect(act).to.throw(expectedError);
            }
        });
        it('throws if function does not exist', () => {
            // arrange
            const name = 'unique-name';
            const expectedError = `called function is not defined "${name}"`;
            const func = new SharedFunctionStub()
                .withName('unexpected-name');
            const sut = new SharedFunctionCollection();
            sut.addFunction(func);
            // act
            const act = () => sut.getFunctionByName(name);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('returns existing function', () => {
            // arrange
            const name = 'expected-function-name';
            const expected = new SharedFunctionStub()
                .withName(name);
            const sut = new SharedFunctionCollection();
            sut.addFunction(new SharedFunctionStub().withName('another-function-name'));
            sut.addFunction(expected);
            // act
            const actual = sut.getFunctionByName(name);
            // assert
            expect(actual).to.equal(expected);
        });
    });
});
