import type { FunctionParameterParser } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterParser';
import { FunctionParameterStub } from './FunctionParameterStub';

export const createFunctionParameterParserStub: FunctionParameterParser = (parameters) => {
  return new FunctionParameterStub()
    .withName(parameters.name)
    .withOptional(parameters.optional || false);
};
