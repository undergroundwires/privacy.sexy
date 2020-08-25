import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { ICodePosition } from '@/application/State/Code/Position/ICodePosition';

export interface IUserScript {
    code: string;
    scriptPositions: Map<SelectedScript, ICodePosition>;
}
