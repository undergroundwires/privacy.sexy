import 'mocha';
import { expect } from 'chai';
import { CodeBuilder } from '@/application/Context/State/Code/Generation/CodeBuilder';

describe('CodeBuilder', () => {
    describe('appendLine', () => {
        it('when empty appends empty line', () => {
            // arrange
            const sut = new CodeBuilder();
            // act
            sut.appendLine().appendLine().appendLine();
            // assert
            expect(sut.toString()).to.equal('\n\n');
        });
        it('when not empty append string in new line', () => {
            // arrange
            const sut = new CodeBuilder();
            const expected = 'str';
            // act
            sut.appendLine()
               .appendLine(expected);
            // assert
            const result = sut.toString();
            const lines = getLines(result);
            expect(lines[1]).to.equal('str');
        });
    });
    it('appendFunction', () => {
        // arrange
        const sut = new CodeBuilder();
        const functionName = 'function';
        const code = 'code';
        // act
        sut.appendFunction(functionName, code);
        // assert
        const result = sut.toString();
        expect(result).to.include(functionName);
        expect(result).to.include(code);
    });
    it('appendTrailingHyphensCommentLine', () => {
        // arrange
        const sut = new CodeBuilder();
        const totalHypens = 5;
        const expected = `:: ${'-'.repeat(totalHypens)}`;
        // act
        sut.appendTrailingHyphensCommentLine(totalHypens);
        // assert
        const result = sut.toString();
        const lines = getLines(result);
        expect(lines[0]).to.equal(expected);
    });
    it('appendCommentLine', () => {
        // arrange
        const sut = new CodeBuilder();
        const comment = 'comment';
        const expected = ':: comment';
        // act
        sut.appendCommentLine(comment);
        // assert
        const result = sut.toString();
        const lines = getLines(result);
        expect(lines[0]).to.equal(expected);
    });
    it('appendCommentLineWithHyphensAround', () => {
        // arrange
        const sut = new CodeBuilder();
        const sectionName = 'section';
        const totalHypens = sectionName.length + 3 * 2;
        const expected = ':: ---section---';
        sut.appendCommentLineWithHyphensAround(sectionName, totalHypens);
        // assert
        const result = sut.toString();
        const lines = getLines(result);
        expect(lines[1]).to.equal(expected);
    });
    describe('currentLine', () => {
        it('no lines returns zero', () => {
            // arrange & act
            const sut = new CodeBuilder();
            // assert
            expect(sut.currentLine).to.equal(0);
        });
        it('single line returns one', () => {
            // arrange
            const sut = new CodeBuilder();
            // act
            sut.appendLine();
            // assert
            expect(sut.currentLine).to.equal(1);
        });
        it('multiple lines returns as expected', () => {
            // arrange
            const sut = new CodeBuilder();
            // act
            sut.appendLine('1').appendCommentLine('2').appendLine();
            // assert
            expect(sut.currentLine).to.equal(3);
        });
        it('multiple lines in code', () => {
            // arrange
            const sut = new CodeBuilder();
            // act
            sut.appendLine('hello\ncode-here\nwith-3-lines');
            // assert
            expect(sut.currentLine).to.equal(3);
        });
    });
});

function getLines(text: string): string[] {
    return text.split(/\r\n|\r|\n/);
}
