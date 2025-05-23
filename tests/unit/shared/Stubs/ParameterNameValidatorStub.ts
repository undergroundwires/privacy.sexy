import type { ParameterNameValidator } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Shared/ParameterNameValidator';

export const createParameterNameValidatorStub = () => {
  const validatedNames = new Array<string>();
  const validator: ParameterNameValidator = (name) => {
    validatedNames.push(name);
  };
  return {
    validator,
    validatedNames,
  };
};
