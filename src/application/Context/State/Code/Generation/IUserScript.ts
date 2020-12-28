import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';

export interface IUserScript {
    code: string;
    scriptPositions: Map<SelectedScript, ICodePosition>;
}
