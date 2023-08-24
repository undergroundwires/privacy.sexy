import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';
import { AppMetadataFactory } from '@/infrastructure/Metadata/AppMetadataFactory';
import { ISanityCheckOptions } from '../ISanityCheckOptions';
import { ISanityValidator } from '../ISanityValidator';

export class MetadataValidator implements ISanityValidator {
  private readonly metadata: IAppMetadata;

  constructor(metadataFactory: () => IAppMetadata = () => AppMetadataFactory.Current) {
    this.metadata = metadataFactory();
  }

  public shouldValidate(options: ISanityCheckOptions): boolean {
    return options.validateMetadata;
  }

  public* collectErrors(): Iterable<string> {
    if (!this.metadata) {
      yield 'missing metadata';
      return;
    }
    const keyValues = capturePropertyValues(this.metadata);
    if (!Object.keys(keyValues).length) {
      yield 'Unable to capture metadata key/value pairs';
      return;
    }
    const keysMissingValue = getMissingMetadataKeys(keyValues);
    if (keysMissingValue.length > 0) {
      yield `Metadata keys missing: ${keysMissingValue.join(', ')}`;
    }
  }
}

function getMissingMetadataKeys(keyValuePairs: Record<string, unknown>): string[] {
  return Object.entries(keyValuePairs)
    .reduce((acc, [key, value]) => {
      if (!value) {
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
function capturePropertyValues(instance: unknown): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  const descriptors = Object.getOwnPropertyDescriptors(instance.constructor.prototype);

  // Capture regular properties from the instance
  for (const [key, value] of Object.entries(instance)) {
    obj[key] = value;
  }

  // Capture getter properties from the instance's prototype
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (typeof descriptor.get === 'function') {
      obj[key] = descriptor.get.call(instance);
    }
  }

  return obj;
}
