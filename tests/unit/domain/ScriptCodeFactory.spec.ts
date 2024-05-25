import { createScriptCode } from '@/domain/ScriptCodeFactory';

describe('ScriptCodeFactory', () => {
  describe('createScriptCode', () => {
    it('generates script code with given `code`', () => {
      // arrange
      const expectedCode = 'expected code';
      const context = new TestContext()
        .withCode(expectedCode);
      // act
      const code = context.createScriptCode();
      // assert
      const actualCode = code.execute;
      expect(actualCode).to.equal(expectedCode);
    });

    it('generates script code with given `revertCode`', () => {
      // arrange
      const expectedRevertCode = 'expected revert code';
      const context = new TestContext()
        .withRevertCode(expectedRevertCode);
      // act
      const code = context.createScriptCode();
      // assert
      const actualRevertCode = code.revert;
      expect(actualRevertCode).to.equal(expectedRevertCode);
    });
  });
});

class TestContext {
  private code = `[${TestContext}] code`;

  private revertCode = `[${TestContext}] revertCode`;

  public withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withRevertCode(revertCode: string): this {
    this.revertCode = revertCode;
    return this;
  }

  public createScriptCode(): ReturnType<typeof createScriptCode> {
    return createScriptCode(
      this.code,
      this.revertCode,
    );
  }
}
