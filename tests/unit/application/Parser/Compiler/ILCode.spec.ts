import 'mocha';
import { expect } from 'chai';
import { generateIlCode } from '@/application/Parser/Compiler/ILCode';

describe('ILCode', () => {
    describe('getUniqueParameterNames', () => {
        // arrange
        const testCases = [
            {
                name: 'empty parameters: returns an empty array',
                code: 'no expressions',
                expected: [ ],
            },
            {
                name: 'single parameter: returns expected for single usage',
                code: '{{ $single }}',
                expected: [ 'single' ],
            },
            {
                name: 'single parameter: returns distinct values for repeating parameters',
                code: '{{ $singleRepeating }}, {{ $singleRepeating }}',
                expected: [ 'singleRepeating' ],
            },
            {
                name: 'multiple parameters: returns expected for single usage of each',
                code: '{{ $firstParameter }}, {{ $secondParameter }}',
                expected: [ 'firstParameter', 'secondParameter' ],
            },
            {
                name: 'multiple parameters: returns distinct values for repeating parameters',
                code: '{{ $firstParameter }}, {{ $firstParameter }}, {{ $firstParameter }} {{ $secondParameter }}, {{ $secondParameter }}',
                expected: [ 'firstParameter', 'secondParameter' ],
            },
        ];
        for (const testCase of testCases) {
            it(testCase.name, () => {
                // act
                const sut = generateIlCode(testCase.code);
                const actual = sut.getUniqueParameterNames();
                // assert
                expect(actual).to.deep.equal(testCase.expected);
            });
        }
    });
    describe('substituteParameter', () => {
        describe('substitutes by ignoring white spaces inside mustaches', () => {
            // arrange
            const mustacheVariations = [
                'Hello {{ $test }}!',
                'Hello {{$test }}!',
                'Hello {{ $test}}!',
                'Hello {{$test}}!'];
            mustacheVariations.forEach((variation) => {
                it(variation, () => {
                    // arrange
                    const ilCode = generateIlCode(variation);
                    const expected = 'Hello world!';
                    // act
                    const actual = ilCode
                        .substituteParameter('test', 'world')
                        .compile();
                    // assert
                    expect(actual).to.deep.equal(expected);
                });
            });
        });
        describe('substitutes as expected', () => {
            // arrange
            const testCases = [
                {
                    name: 'single parameter',
                    code: 'Hello {{ $firstParameter }}!',
                    expected: 'Hello world!',
                    parameters: {
                        firstParameter: 'world',
                    },
                },
                {
                    name: 'single parameter repeated',
                    code: '{{ $firstParameter }} {{ $firstParameter }}!',
                    expected: 'hello hello!',
                    parameters: {
                        firstParameter: 'hello',
                    },
                },
                {
                    name: 'multiple parameters',
                    code: 'He{{ $firstParameter }} {{ $secondParameter }}!',
                    expected: 'Hello world!',
                    parameters: {
                        firstParameter: 'llo',
                        secondParameter: 'world',
                    },
                },
                {
                    name: 'multiple parameters repeated',
                    code: 'He{{ $firstParameter }} {{ $secondParameter }} and He{{ $firstParameter }} {{ $secondParameter }}!',
                    expected: 'Hello world and Hello world!',
                    parameters: {
                        firstParameter: 'llo',
                        secondParameter: 'world',
                    },
                },
            ];
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    // act
                    let ilCode = generateIlCode(testCase.code);
                    for (const parameterName of Object.keys(testCase.parameters)) {
                        const value = testCase.parameters[parameterName];
                        ilCode = ilCode.substituteParameter(parameterName, value);
                    }
                    const actual = ilCode.compile();
                    // assert
                    expect(actual).to.deep.equal(testCase.expected);
                });
            }
        });
    });
    describe('compile', () => {
        it('throws if there are expressions left', () => {
            // arrange
            const expectedError = 'unknown expression: "each"';
            const code = '{{ each }}';
            // act
            const ilCode = generateIlCode(code);
            const act = () => ilCode.compile();
            // assert
            expect(act).to.throw(expectedError);
        });
        it('returns code as it is if there are no expressions', () => {
            // arrange
            const expected = 'I should be the same!';
            const ilCode = generateIlCode(expected);
            // act
            const actual = ilCode.compile();
            // assert
            expect(actual).to.equal(expected);
        });
    });
});
