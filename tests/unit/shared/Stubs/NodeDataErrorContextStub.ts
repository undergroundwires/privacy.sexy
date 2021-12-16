import { NodeData } from '@/application/Parser/NodeValidation/NodeData';
import { INodeDataErrorContext } from '@/application/Parser/NodeValidation/NodeDataError';
import { NodeType } from '@/application/Parser/NodeValidation/NodeType';
import { CategoryDataStub } from './CategoryDataStub';

export class NodeDataErrorContextStub implements INodeDataErrorContext {
  public readonly type: NodeType = NodeType.Script;

  public readonly selfNode: NodeData = new CategoryDataStub();

  public readonly parentNode?: NodeData;
}
