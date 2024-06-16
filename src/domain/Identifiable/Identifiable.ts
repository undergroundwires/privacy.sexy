import type { Key } from './Key';

export interface Identifiable<TKey extends Key> {
  readonly key: TKey; // TODO: Ask GPT, key or ID better propert yname?
}
