import {
  describe,
} from 'vitest';
import { itIsSingleton } from '@tests/unit/shared/TestCases/SingletonTests';
import { AppMetadataFactory } from '@/infrastructure/Metadata/AppMetadataFactory';
import { ViteAppMetadata } from '@/infrastructure/Metadata/Vite/ViteAppMetadata';

describe('AppMetadataFactory', () => {
  describe('instance', () => {
    itIsSingleton({
      getter: () => AppMetadataFactory.Current,
      expectedType: ViteAppMetadata,
    });
  });
});
