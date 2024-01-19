import { isFunction } from '@/TypeHelpers';

/*
  Provides a unified and resilient way to extend errors across platforms.

  Rationale:
  - Babel:
    > "Built-in classes cannot be properly subclassed due to limitations in ES5"
    > https://web.archive.org/web/20230810014108/https://babeljs.io/docs/caveats#classes
  - TypeScript:
    > "Extending built-ins like Error, Array, and Map may no longer work"
    > https://web.archive.org/web/20230810014143/https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
*/
export abstract class CustomError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    fixPrototype(this, new.target.prototype);
    ensureStackTrace(this);

    this.name = this.constructor.name;
  }
}

interface ErrorPrototypeManipulation {
  getSetPrototypeOf: () => (typeof Object.setPrototypeOf | undefined);
  getCaptureStackTrace: () => (typeof Error.captureStackTrace | undefined);
}

export const PlatformErrorPrototypeManipulation: ErrorPrototypeManipulation = {
  getSetPrototypeOf: () => Object.setPrototypeOf,
  getCaptureStackTrace: () => Error.captureStackTrace,
};

function fixPrototype(target: Error, prototype: CustomError) {
  // This is recommended by TypeScript guidelines.
  //  Source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
  //  Snapshots: https://web.archive.org/web/20231111234849/https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget, https://archive.ph/tr7cX#support-for-newtarget
  const setPrototypeOf = PlatformErrorPrototypeManipulation.getSetPrototypeOf();
  if (!isFunction(setPrototypeOf)) {
    return;
  }
  setPrototypeOf(target, prototype);
}

function ensureStackTrace(target: Error) {
  const captureStackTrace = PlatformErrorPrototypeManipulation.getCaptureStackTrace();
  if (!isFunction(captureStackTrace)) {
    // captureStackTrace is only available on V8, if it's not available
    // modern JS engines will usually generate a stack trace on error objects when they're thrown.
    return;
  }
  captureStackTrace(target, target.constructor);
}
