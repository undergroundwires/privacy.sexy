import {
  isArray, isFunction, isNullOrUndefined, isPlainObject,
} from '@/TypeHelpers';

/**
 * Binds method contexts to their original object instances and recursively processes
 * nested objects and arrays. This is particularly useful when exposing objects across
 * different contexts in Electron, such as from the main process to the renderer process
 * via the `contextBridge`.
 *
 * In Electron's context isolation environment, methods of objects passed through the
 * `contextBridge` lose their original context (`this` binding). This function ensures that
 * each method retains its binding to its original object, allowing it to work as intended
 * when invoked from the renderer process.
 *
 * This approach decouples context isolation concerns from class implementations, enabling
 * classes to operate normally without needing explicit binding or arrow functions to maintain
 * the context.
 */
export function bindObjectMethods<T>(obj: T): T {
  if (isNullOrUndefined(obj)) {
    return obj;
  }
  if (isPlainObject(obj)) {
    bindMethodsOfObject(obj);
    Object.values(obj).forEach((value) => {
      if (!isNullOrUndefined(value) && !isFunction(value)) {
        bindObjectMethods(value);
      }
    });
  } else if (isArray(obj)) {
    obj.forEach((item) => bindObjectMethods(item));
  }
  return obj;
}

function bindMethodsOfObject(obj: object): void {
  const prototype: object | null = Object.getPrototypeOf(obj);
  const properties = new Set([
    ...Object.getOwnPropertyNames(obj),
    ...(prototype && prototype !== Object.prototype ? Object.getOwnPropertyNames(prototype) : []),
  ]);
  properties.forEach((property) => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, property)
      ?? (prototype ? Object.getOwnPropertyDescriptor(prototype, property) : undefined);
    const value: unknown = descriptor?.value;
    if (property !== 'constructor' && isFunction(value)) {
      Object.assign(obj, { [property]: value.bind(obj) });
    }
  });
}
