import type {
  CallFunctionBody, CodeFunctionBody, SharedFunctionBody,
} from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { FunctionBodyType } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

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
  expect(actualType).to.equal(expectedType, formatAssertionMessage([
    `Actual: ${FunctionBodyType[actualType]}`,
    `Expected: ${FunctionBodyType[expectedType]}`,
    `Body: ${JSON.stringify(body)}`,
  ]));
}
