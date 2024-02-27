import { isBoolean, isFunction } from '@/TypeHelpers';
import type { IEnvironmentVariables } from './IEnvironmentVariables';

/* Validation is externalized to keep the environment objects simple */
export function validateEnvironmentVariables(environment: IEnvironmentVariables): void {
  const keyValues = capturePropertyValues(environment);
  if (!Object.keys(keyValues).length) {
    throw new Error('Unable to capture key/value pairs');
  }
  const keysMissingValue = getKeysMissingValues(keyValues);
  if (keysMissingValue.length > 0) {
    throw new Error(`Environment keys missing: ${keysMissingValue.join(', ')}`);
  }
}

function getKeysMissingValues(keyValuePairs: Record<string, unknown>): string[] {
  return Object.entries(keyValuePairs)
    .reduce((acc, [key, value]) => {
      if (!value && !isBoolean(value)) {
        acc.push(key);
      }
      return acc;
    }, new Array<string>());
}

/**
 * Captures values of properties and getters from the provided instance.
 * Necessary because code transformations can make class getters non-enumerable during bundling.
 * This ensures that even if getters are non-enumerable, their values are still captured and used.
 */
function capturePropertyValues(instance: object): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  const descriptors = Object.getOwnPropertyDescriptors(instance.constructor.prototype);

  // Capture regular properties from the instance
  for (const [key, value] of Object.entries(instance)) {
    obj[key] = value;
  }

  // Capture getter properties from the instance's prototype
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (isFunction(descriptor.get)) {
      obj[key] = descriptor.get.call(instance);
    }
  }

  return obj;
}
