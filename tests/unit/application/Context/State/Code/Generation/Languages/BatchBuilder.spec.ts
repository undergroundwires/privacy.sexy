import 'mocha';
import { expect } from 'chai';
import { BatchBuilder } from '@/application/Context/State/Code/Generation/Languages/BatchBuilder';

describe('BatchBuilder', () => {
    class BatchBuilderRevealer extends BatchBuilder {
        public getCommentDelimiter(): string {
            return super.getCommentDelimiter();
        }
        public writeStandardOut(text: string): string {
            return super.writeStandardOut(text);
        }
    }
    describe('getCommentDelimiter', () => {
        it('returns expected', () => {
            // arrange
            const expected = '::';
            const sut = new BatchBuilderRevealer();
            // act
            const actual = sut.getCommentDelimiter();
            // assert
            expect(expected).to.equal(actual);
        });
    });
    describe('writeStandardOut', () => {
        it('prepends expected', () => {
            // arrange
            const text = 'test';
            const expected = `echo ${text}`;
            const sut = new BatchBuilderRevealer();
            // act
            const actual = sut.writeStandardOut(text);
            // assert
            expect(expected).to.equal(actual);
        });
    });
});
