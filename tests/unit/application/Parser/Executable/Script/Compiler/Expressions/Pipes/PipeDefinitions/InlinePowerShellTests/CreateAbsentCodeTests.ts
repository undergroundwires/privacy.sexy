import { getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import type { PipeTestScenario } from '../PipeTestRunner';

export function createAbsentCodeTests(): PipeTestScenario[] {
  return [
    ...getAbsentStringTestCases({ excludeNull: true, excludeUndefined: true })
      .map((testCase): PipeTestScenario => ({
        description: `absent string (${testCase.valueName})`,
        input: testCase.absentValue,
        expectedOutput: '',
      })),
    {
      description: 'whitespace-only input',
      input: ' \t\n\r\f\v\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000',
      expectedOutput: '',
    },
    {
      description: 'newline-only input',
      input: '\n\r\u2028\u2029',
      expectedOutput: '',
    },
    {
      description: 'newline-only input',
      input: ' \t\n\r\f\v\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\n\r\u2028\u2029',
      expectedOutput: '',
    },
  ];
}
