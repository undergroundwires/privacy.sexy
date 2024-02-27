import type { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';

export interface IUserScript {
  readonly code: string;
  readonly scriptPositions: Map<SelectedScript, ICodePosition>;
}
