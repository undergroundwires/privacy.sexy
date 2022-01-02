import { INode } from './Node/INode';

export interface INodeSelectedEvent {
  isSelected: boolean;
  node: INode;
}
