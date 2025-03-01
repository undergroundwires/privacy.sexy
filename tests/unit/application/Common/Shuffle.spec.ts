import { describe, it, expect } from 'vitest';
import { shuffle } from '@/application/Common/Shuffle';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';

describe('Shuffle', () => {
  describe('shuffle', () => {
    it('returns a new array', () => {
      // arrange
      const inputArray = ['a', 'b', 'c', 'd'];
      // act
      const result = shuffle(inputArray);
      // assert
      expect(result).not.to.equal(inputArray);
    });

    it('returns an array of the same length', () => {
      // arrange
      const inputArray = ['a', 'b', 'c', 'd'];
      // act
      const result = shuffle(inputArray);
      // assert
      expect(result.length).toBe(inputArray.length);
    });

    it('contains the same elements', () => {
      // arrange
      const inputArray = ['a', 'b', 'c', 'd'];
      // act
      const result = shuffle(inputArray);
      // assert
      expectArrayEquals(result, inputArray, {
        ignoreOrder: true,
      });
    });

    it('does not modify the input array', () => {
      // arrange
      const inputArray = ['a', 'b', 'c', 'd'];
      const inputArrayCopy = [...inputArray];
      // act
      shuffle(inputArray);
      // assert
      expect(inputArray).to.deep.equal(inputArrayCopy);
    });

    it('handles an empty array correctly', () => {
      // arrange
      const inputArray: string[] = [];
      // act
      const result = shuffle(inputArray);
      // assert
      expect(result).have.lengthOf(0);
    });
  });
});
