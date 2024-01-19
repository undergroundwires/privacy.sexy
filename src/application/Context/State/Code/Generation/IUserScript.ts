import { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';

export interface IUserScript {
  readonly code: string;
  readonly scriptPositions: Map<SelectedScript, ICodePosition>;
}
