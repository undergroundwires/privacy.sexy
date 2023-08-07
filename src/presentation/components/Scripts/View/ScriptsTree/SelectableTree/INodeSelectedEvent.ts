import { INodeContent } from './Node/INodeContent';

export interface INodeSelectedEvent {
  isSelected: boolean;
  node: INodeContent;
}
