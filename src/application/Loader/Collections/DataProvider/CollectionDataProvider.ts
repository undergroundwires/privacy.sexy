import type { CollectionData } from '@/application/collections/';

export interface CollectionDataProvider {
  (collectionFileName: string): CollectionData;
}
