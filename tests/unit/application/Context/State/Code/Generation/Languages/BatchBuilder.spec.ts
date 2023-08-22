import { describe, it, expect } from 'vitest';
import { BatchBuilder } from '@/application/Context/State/Code/Generation/Languages/BatchBuilder';

describe('BatchBuilder', () => {
  class BatchBuilderRevealer extends BatchBuilder {
    public getCommentDelimiter(): string {
      return super.getCommentDelimiter();
    }

    public writeStandardOut(text: string): string {
      return super.writeStandardOut(text);
    }

    public getNewLineTerminator(): string {
      return super.getNewLineTerminator();
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
    const testData = [
      {
        name: 'plain text',
        text: 'test',
        expected: 'echo test',
      },
      {
        name: 'text with ampersand',
        text: 'a & b',
        expected: 'echo a ^& b',
      },
      {
        name: 'text with percent sign',
        text: '90%',
        expected: 'echo 90%%',
      },
      {
        name: 'text with multiple ampersands and percent signs',
        text: 'Me&you in % ? You & me = 0%',
        expected: 'echo Me^&you in %% ? You ^& me = 0%%',
      },
    ];
    for (const test of testData) {
      it(test.name, () => {
        // arrange
        const sut = new BatchBuilderRevealer();
        // act
        const actual = sut.writeStandardOut(test.text);
        // assert
        expect(test.expected).to.equal(actual);
      });
    }
  });
  describe('getNewLineTerminator', () => {
    it('returns expected', () => {
      // arrange
      const expected = '\r\n';
      const sut = new BatchBuilderRevealer();
      // act
      const actual = sut.getNewLineTerminator();
      // assert
      expect(expected).to.equal(actual);
    });
  });
});
