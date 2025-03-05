import type { ParameterDefinitionData } from '@/application/collections/';
import { validateParameterName, type ParameterNameValidator } from '../Shared/ParameterNameValidator';
import type { FunctionParameter } from './FunctionParameter';

export interface FunctionParameterParser {
  (
    data: ParameterDefinitionData,
    validator?: ParameterNameValidator,
  ): FunctionParameter;
}

export const parseFunctionParameter: FunctionParameterParser = (
  data,
  validator = validateParameterName,
) => {
  validator(data.name);
  return {
    name: data.name,
    isOptional: data.optional || false,
  };
};
