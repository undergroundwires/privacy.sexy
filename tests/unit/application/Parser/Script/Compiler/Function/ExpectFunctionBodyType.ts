import {
  CallFunctionBody, CodeFunctionBody, FunctionBodyType, SharedFunctionBody,
} from '@/application/Parser/Script/Compiler/Function/ISharedFunction';

export function expectCodeFunctionBody(
  body: SharedFunctionBody,
): asserts body is CodeFunctionBody {
  expectBodyType(body, FunctionBodyType.Code);
}

export function expectCallsFunctionBody(
  body: SharedFunctionBody,
): asserts body is CallFunctionBody {
  expectBodyType(body, FunctionBodyType.Calls);
}

function expectBodyType(body: SharedFunctionBody, expectedType: FunctionBodyType) {
  const actualType = body.type;
  expect(actualType).to.equal(
    expectedType,
    [
      '\n---',
      `Actual: ${FunctionBodyType[actualType]}`,
      `Expected: ${FunctionBodyType[expectedType]}`,
      `Body: ${JSON.stringify(body)}`,
      '---\n\n',
    ].join('\n'),
  );
}
