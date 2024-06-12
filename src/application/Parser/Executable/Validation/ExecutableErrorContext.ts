import type { CategoryData, ScriptData, ExecutableData } from '@/application/collections/';
import { ExecutableType } from './ExecutableType';

export type ExecutableErrorContext = {
  readonly parentCategory?: CategoryData;
} & (CategoryErrorContext | ScriptErrorContext | UnknownExecutableErrorContext);

export type CategoryErrorContext = {
  readonly type: ExecutableType.Category;
  readonly self: CategoryData;
  readonly parentCategory?: CategoryData;
};

export type ScriptErrorContext = {
  readonly type: ExecutableType.Script;
  readonly self: ScriptData;
  readonly parentCategory?: CategoryData;
};

export type UnknownExecutableErrorContext = {
  readonly type?: undefined;
  readonly self: ExecutableData;
  readonly parentCategory?: CategoryData;
};
