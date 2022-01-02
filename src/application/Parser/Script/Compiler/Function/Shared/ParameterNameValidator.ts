export function ensureValidParameterName(parameterName: string) {
  if (!parameterName) {
    throw new Error('undefined parameter name');
  }
  if (!parameterName.match(/^[0-9a-zA-Z]+$/)) {
    throw new Error(`parameter name must be alphanumeric but it was "${parameterName}"`);
  }
}
