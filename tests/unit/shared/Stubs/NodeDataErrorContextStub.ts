import { NodeData } from '@/application/Parser/NodeValidation/NodeData';
import { NodeDataErrorContext } from '@/application/Parser/NodeValidation/NodeDataError';
import { NodeType } from '@/application/Parser/NodeValidation/NodeType';
import { CategoryDataStub } from './CategoryDataStub';

export class NodeDataErrorContextStub implements NodeDataErrorContext {
  public readonly type: NodeType = NodeType.Script;

  public readonly selfNode: NodeData = new CategoryDataStub();

  public readonly parentNode?: NodeData;
}
