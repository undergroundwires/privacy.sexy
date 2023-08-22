import { describe, it, expect } from 'vitest';
import { Version } from '@/domain/Version';

describe('Version', () => {
  describe('invalid versions', () => {
    describe('throws with invalid semantic version', () => {
      // arrange
      const invalidVersions = [
        '0.1.0.0', '0.1', '0.1..0', '0..1.0', '0..1', '...', '0.10', '0.-5.4',
      ];
      for (const version of invalidVersions) {
        const expectedError = `invalid version: ${version}`;
        it(`given ${version}`, () => {
          // act
          const act = () => new Version(version);
          //
          expect(act).to.throw(expectedError);
        });
      }
    });
    describe('throws with empty string', () => {
      // arrange
      const expectedError = 'empty version';
      const testCases = [
        { name: 'empty', value: '' },
        { name: 'undefined', value: undefined },
      ];
      for (const testCase of testCases) {
        it(`given ${testCase.name}`, () => {
          // act
          const act = () => new Version(testCase.value);
          //
          expect(act).to.throw(expectedError);
        });
      }
    });
  });
  describe('valid versions', () => {
    const validVersions: Array<ValidVersionTestData> = [
      {
        text: '0.1.0',
        parts: { major: 0, minor: 1, patch: 0 },
      },
      {
        text: '3.0.0',
        parts: { major: 3, minor: 0, patch: 0 },
      },
      {
        text: '100.1000.10000',
        parts: { major: 100, minor: 1000, patch: 10000 },
      },
    ];
    function testValidVersions(tester: (data: ValidVersionTestData) => void) {
      for (const version of validVersions) {
        it(`given ${version.text}`, () => {
          tester(version);
        });
      }
    }
    describe('major', () => {
      testValidVersions((version) => {
        // arrange
        const expected = version.parts.major;
        // act
        const sut = new Version(version.text);
        const actual = sut.major;
        // assert
        expect(expected).to.equal(actual);
      });
    });
    describe('minor', () => {
      testValidVersions((version) => {
        // arrange
        const expected = version.parts.minor;
        // act
        const sut = new Version(version.text);
        const actual = sut.minor;
        // assert
        expect(expected).to.equal(actual);
      });
    });
    describe('patch', () => {
      testValidVersions((version) => {
        // arrange
        const expected = version.parts.patch;
        // act
        const sut = new Version(version.text);
        const actual = sut.patch;
        // assert
        expect(expected).to.equal(actual);
      });
    });
    describe('toString', () => {
      testValidVersions((version) => {
        // arrange
        const expected = version.text;
        // act
        const sut = new Version(expected);
        const actual = sut.toString();
        // assert
        expect(expected).to.equal(actual);
      });
    });
  });
});

interface ValidVersionTestData {
  text: string;
  parts: {
    major: number,
    minor: number,
    patch: number,
  },
}
