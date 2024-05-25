import type { CategoryData, ScriptData } from '@/application/collections/';
import { NodeDataType } from './NodeDataType';
import type { NodeData } from './NodeData';

export type NodeDataErrorContext = {
  readonly parentNode?: CategoryData;
} & (CategoryNodeErrorContext | ScriptNodeErrorContext | UnknownNodeErrorContext);

export type CategoryNodeErrorContext = {
  readonly type: NodeDataType.Category;
  readonly selfNode: CategoryData;
  readonly parentNode?: CategoryData;
};

export type ScriptNodeErrorContext = {
  readonly type: NodeDataType.Script;
  readonly selfNode: ScriptData;
  readonly parentNode?: CategoryData;
};

export type UnknownNodeErrorContext = {
  readonly type?: undefined;
  readonly selfNode: NodeData;
  readonly parentNode?: CategoryData;
};
