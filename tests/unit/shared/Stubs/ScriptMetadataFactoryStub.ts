import type { ScriptMetadataFactory, ScriptMetadataInitParameters } from '@/domain/ScriptMetadata/ScriptMetadataFactory';
import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import { ScriptMetadataStub } from './ScriptMetadataStub';

export function createScriptMetadataFactorySpy(): {
  readonly factory: ScriptMetadataFactory;
  getInitParameters: (
    compiler: ScriptMetadata,
  ) => ScriptMetadataInitParameters | undefined;
} {
  const createdInstances = new Map<ScriptMetadata, ScriptMetadataInitParameters>();
  return {
    factory: (parameters) => {
      const instance = new ScriptMetadataStub();
      createdInstances.set(instance, parameters);
      return instance;
    },
    getInitParameters: (instance) => createdInstances.get(instance),
  };
}
