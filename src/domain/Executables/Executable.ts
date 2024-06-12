import type { IEntity } from '@/infrastructure/Entity/IEntity';
import type { Documentable } from './Documentable';

export interface Executable<TExecutableKey>
  extends Documentable, IEntity<TExecutableKey> {
}
