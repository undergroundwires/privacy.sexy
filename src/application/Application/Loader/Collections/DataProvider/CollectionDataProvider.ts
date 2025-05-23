import type { CollectionData } from '@/application/collections/';

export interface CollectionDataProvider {
  (collectionName: string): CollectionData;
}
