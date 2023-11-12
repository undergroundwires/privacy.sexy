import {
  describe, it, afterEach, expect,
} from 'vitest';
import { CustomError, PlatformErrorPrototypeManipulation } from '@/application/Common/CustomError';

describe('CustomError', () => {
  afterEach(() => {
    PlatformErrorPrototypeManipulation.getSetPrototypeOf = () => Object.setPrototypeOf;
    PlatformErrorPrototypeManipulation.getCaptureStackTrace = () => Error.captureStackTrace;
  });
  describe('sets members as expected', () => {
    it('`name`', () => {
      // arrange
      const expectedName = CustomErrorConcrete.name;
      // act
      const sut = new CustomErrorConcrete();
      // assert
      expect(sut.name).to.equal(expectedName);
    });
    it('`message`', () => {
      // arrange
      const expectedMessage = 'expected message';
      // act
      const sut = new CustomErrorConcrete(expectedMessage);
      // assert
      expect(sut.message).to.equal(expectedMessage);
    });
    it('`cause`', () => {
      // arrange
      const expectedCause = new Error('expected cause');
      // act
      const sut = new CustomErrorConcrete(undefined, {
        cause: expectedCause,
      });
      // assert
      expect(sut.cause).to.equal(expectedCause);
    });
    describe('`stack`', () => {
      it('sets using `getCaptureStackTrace` if available', () => {
        // arrange
        const mockStackTrace = 'mocked stack trace';
        PlatformErrorPrototypeManipulation.getCaptureStackTrace = () => (error) => {
          (error as Error).stack = mockStackTrace;
        };
        // act
        const sut = new CustomErrorConcrete();
        // assert
        expect(sut.stack).to.equal(mockStackTrace);
      });
      it('defined', () => {
        // arrange
        const customError = new CustomErrorConcrete();

        // act
        const { stack } = customError;

        // assert
        expect(stack).to.not.equal(undefined);
      });
    });
  });
  describe('retains correct prototypes', () => {
    it('instance of `Error`', () => {
      // arrange
      const expected = Error;
      // act
      const sut = new CustomErrorConcrete();
      // assert
      expect(sut).to.be.an.instanceof(expected);
    });
    it('instance of `CustomErrorConcrete`', () => {
      // arrange
      const expected = CustomErrorConcrete;
      // act
      const sut = new CustomErrorConcrete();
      // assert
      expect(sut).to.be.an.instanceof(expected);
    });
    it('instance of `CustomError`', () => {
      // arrange
      const expected = CustomError;
      // act
      const sut = new CustomErrorConcrete();
      // assert
      expect(sut).to.be.an.instanceof(expected);
    });
    it('thrown error retains `CustomError` type', () => {
      // arrange
      const expected = CustomError;
      let thrownError: unknown;
      // act
      try {
        throw new CustomErrorConcrete('message');
      } catch (e) {
        thrownError = e;
      }
      // assert
      expect(thrownError).to.be.an.instanceof(expected);
    });
  });
  describe('environment compatibility', () => {
    describe('Object.setPrototypeOf', () => {
      it('does not throw if unavailable', () => {
        // arrange
        PlatformErrorPrototypeManipulation.getSetPrototypeOf = () => undefined;

        // act
        const act = () => new CustomErrorConcrete();

        // assert
        expect(act).to.not.throw();
      });
      it('calls if available', () => {
        // arrange
        let wasCalled = false;
        const setPrototypeOf = () => { wasCalled = true; };
        PlatformErrorPrototypeManipulation.getSetPrototypeOf = () => setPrototypeOf;

        // act
        // eslint-disable-next-line no-new
        new CustomErrorConcrete();

        // assert
        expect(wasCalled).to.equal(true);
      });
    });
    describe('Error.captureStackTrace', () => {
      it('does not throw if unavailable', () => {
        // arrange
        PlatformErrorPrototypeManipulation.getCaptureStackTrace = () => undefined;

        // act
        const act = () => new CustomErrorConcrete();

        // assert
        expect(act).to.not.throw();
      });
      it('calls if available', () => {
        // arrange
        let wasCalled = false;
        const captureStackTrace = () => { wasCalled = true; };
        PlatformErrorPrototypeManipulation.getCaptureStackTrace = () => captureStackTrace;

        // act
        // eslint-disable-next-line no-new
        new CustomErrorConcrete();

        // assert
        expect(wasCalled).to.equal(true);
      });
    });
  });
  describe('runtime behavior sanity checks', () => {
    /*
     * These tests are intended to verify the behavior of the JavaScript runtime or environment,
     * rather than specific application logic. Typically, we avoid such tests because we
     * trust the behavior of the underlying platform. However, they've been included here
     * due to previous unexpected issues, specifically failures when trying to log
     * `new Error().stack`. These issues arose because of factors like transpilation,
     * source-mapping, and variances in JavaScript engine behaviors.
     */
    it('`Error.stack` is defined', () => {
      const error = new Error();

      // act
      const { stack } = error;

      // assert
      expect(stack).to.not.equal(undefined);
    });
  });
});

class CustomErrorConcrete extends CustomError { }
