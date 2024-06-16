import type { Documentable } from './Documentable';
import type { ExecutableKey } from './Identifiable/ExecutableKey/ExecutableKey';
import type { Identifiable } from './Identifiable/Identifiable';

export interface Executable
  extends Documentable, Identifiable<ExecutableKey> {

}
