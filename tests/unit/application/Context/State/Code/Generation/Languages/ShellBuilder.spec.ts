import { describe, it, expect } from 'vitest';
import { ShellBuilder } from '@/application/Context/State/Code/Generation/Languages/ShellBuilder';

describe('ShellBuilder', () => {
  class ShellBuilderRevealer extends ShellBuilder {
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
      const expected = '#';
      const sut = new ShellBuilderRevealer();
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
        expected: 'echo \'test\'',
      },
      {
        name: 'text with single quote',
        text: 'I\'m not who you think I am',
        expected: 'echo \'I\'\\\'\'m not who you think I am\'',
      },
      {
        name: 'text with multiple single quotes',
        text: 'I\'m what you\'re',
        expected: 'echo \'I\'\\\'\'m what you\'\\\'\'re\'',
      },
    ];
    for (const test of testData) {
      it(test.name, () => {
        // arrange
        const sut = new ShellBuilderRevealer();
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
      const expected = '\n';
      const sut = new ShellBuilderRevealer();
      // act
      const actual = sut.getNewLineTerminator();
      // assert
      expect(expected).to.equal(actual);
    });
  });
});
