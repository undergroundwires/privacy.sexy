import type {
  CallFunctionBody, CodeFunctionBody, SharedFunctionBody,
} from '@/application/Parser/Executable/Script/Compiler/Function/ISharedFunction';
import { FunctionBodyType } from '@/application/Parser/Executable/Script/Compiler/Function/ISharedFunction';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
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
  expectExists(actualType, 'Function has no body');
  expect(actualType).to.equal(expectedType, formatAssertionMessage([
    `Actual: ${FunctionBodyType[actualType]}`,
    `Expected: ${FunctionBodyType[expectedType]}`,
    `Body: ${JSON.stringify(body)}`,
  ]));
}
