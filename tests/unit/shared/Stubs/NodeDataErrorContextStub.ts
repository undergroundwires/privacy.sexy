import type { NodeDataErrorContext } from '@/application/Parser/NodeValidation/NodeDataErrorContext';
import { NodeDataType } from '@/application/Parser/NodeValidation/NodeDataType';
import { CategoryDataStub } from './CategoryDataStub';

export function createNodeDataErrorContextStub(): NodeDataErrorContext {
  return {
    type: NodeDataType.Category,
    selfNode: new CategoryDataStub(),
    parentNode: new CategoryDataStub(),
  };
}
