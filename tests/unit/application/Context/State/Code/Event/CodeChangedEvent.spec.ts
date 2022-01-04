import 'mocha';
import { expect } from 'chai';
import { CodeChangedEvent } from '@/application/Context/State/Code/Event/CodeChangedEvent';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import { CodePosition } from '@/application/Context/State/Code/Position/CodePosition';
import { SelectedScriptStub } from '@tests/unit/stubs/SelectedScriptStub';
import { ScriptStub } from '@tests/unit/stubs/ScriptStub';

describe('CodeChangedEvent', () => {
  describe('ctor', () => {
    describe('position validation', () => {
      it('throws when code position is out of range', () => {
        // arrange
        const code = 'singleline code';
        const nonExistingLine1 = 2;
        const nonExistingLine2 = 31;
        const newScripts = new Map<SelectedScript, ICodePosition>([
          [new SelectedScriptStub('1'), new CodePosition(0, nonExistingLine1)],
          [new SelectedScriptStub('2'), new CodePosition(0, nonExistingLine2)],
        ]);
        // act
        let errorText = '';
        try {
          new CodeChangedEventBuilder()
            .withCode(code)
            .withNewScripts(newScripts)
            .build();
        } catch (error) { errorText = error.message; }
        // assert
        expect(errorText).to.include(nonExistingLine1);
        expect(errorText).to.include(nonExistingLine2);
      });
      describe('does not throw with valid code position', () => {
        // arrange
        const testCases = [
          {
            name: 'singleline',
            code: 'singleline code',
            position: new CodePosition(0, 1),
          },
          {
            name: 'multiline',
            code: 'multiline code\nsecond line',
            position: new CodePosition(0, 2),
          },
        ];
        for (const testCase of testCases) {
          it(testCase.name, () => {
            const newScripts = new Map<SelectedScript, ICodePosition>([
              [new SelectedScriptStub('1'), testCase.position],
            ]);
            // act
            const act = () => new CodeChangedEventBuilder()
              .withCode(testCase.code)
              .withNewScripts(newScripts)
              .build();
            // assert
            expect(act).to.not.throw();
          });
        }
      });
    });
  });
  it('code returns expected', () => {
    // arrange
    const expected = 'code';
    const sut = new CodeChangedEventBuilder()
      .withCode(expected)
      .build();
    // act
    const actual = sut.code;
    // assert
    expect(actual).to.equal(expected);
  });
  describe('addedScripts', () => {
    it('returns new scripts when scripts are added', () => {
      // arrange
      const expected = [new ScriptStub('3'), new ScriptStub('4')];
      const initialScripts = [new SelectedScriptStub('1'), new SelectedScriptStub('2')];
      const newScripts = new Map<SelectedScript, ICodePosition>([
        [initialScripts[0], new CodePosition(0, 1)],
        [initialScripts[1], new CodePosition(0, 1)],
        [new SelectedScript(expected[0], false), new CodePosition(0, 1)],
        [new SelectedScript(expected[1], false), new CodePosition(0, 1)],
      ]);
      const sut = new CodeChangedEventBuilder()
        .withOldScripts(initialScripts)
        .withNewScripts(newScripts)
        .build();
      // act
      const actual = sut.addedScripts;
      // assert
      expect(actual).to.have.lengthOf(2);
      expect(actual[0]).to.deep.equal(expected[0]);
      expect(actual[1]).to.deep.equal(expected[1]);
    });
  });
  describe('removedScripts', () => {
    it('returns removed scripts when script are removed', () => {
      // arrange
      const existingScripts = [new SelectedScriptStub('0'), new SelectedScriptStub('1')];
      const removedScripts = [new SelectedScriptStub('2')];
      const initialScripts = [...existingScripts, ...removedScripts];
      const newScripts = new Map<SelectedScript, ICodePosition>([
        [initialScripts[0], new CodePosition(0, 1)],
        [initialScripts[1], new CodePosition(0, 1)],
      ]);
      const sut = new CodeChangedEventBuilder()
        .withOldScripts(initialScripts)
        .withNewScripts(newScripts)
        .build();
      // act
      const actual = sut.removedScripts;
      // assert
      expect(actual).to.have.lengthOf(removedScripts.length);
      expect(actual[0]).to.deep.equal(removedScripts[0].script);
    });
  });
  describe('changedScripts', () => {
    it('returns changed scripts when scripts are changed', () => {
      // arrange
      const initialScripts = [new SelectedScriptStub('1', false), new SelectedScriptStub('2', false)];
      const newScripts = new Map<SelectedScript, ICodePosition>([
        [new SelectedScriptStub('1', true), new CodePosition(0, 1)],
        [new SelectedScriptStub('2', false), new CodePosition(0, 1)],
      ]);
      const sut = new CodeChangedEventBuilder()
        .withOldScripts(initialScripts)
        .withNewScripts(newScripts)
        .build();
      // act
      const actual = sut.changedScripts;
      // assert
      expect(actual).to.have.lengthOf(1);
      expect(actual[0]).to.deep.equal(initialScripts[0].script);
    });
  });
  describe('isEmpty', () => {
    it('returns true when empty', () => {
      // arrange
      const newScripts = new Map<SelectedScript, ICodePosition>();
      const oldScripts = [new SelectedScriptStub('1', false)];
      const sut = new CodeChangedEventBuilder()
        .withOldScripts(oldScripts)
        .withNewScripts(newScripts)
        .build();
      // act
      const actual = sut.isEmpty();
      // assert
      expect(actual).to.equal(true);
    });
    it('returns false when not empty', () => {
      // arrange
      const oldScripts = [new SelectedScriptStub('1')];
      const newScripts = new Map<SelectedScript, ICodePosition>([
        [oldScripts[0], new CodePosition(0, 1)],
      ]);
      const sut = new CodeChangedEventBuilder()
        .withOldScripts(oldScripts)
        .withNewScripts(newScripts)
        .build();
      // act
      const actual = sut.isEmpty();
      // assert
      expect(actual).to.equal(false);
    });
  });
  describe('getScriptPositionInCode', () => {
    it('returns expected position for existing script', () => {
      // arrange
      const script = new ScriptStub('1');
      const expected = new CodePosition(0, 1);
      const newScripts = new Map<SelectedScript, ICodePosition>([
        [new SelectedScript(script, false), expected],
      ]);
      const sut = new CodeChangedEventBuilder()
        .withNewScripts(newScripts)
        .build();
      // act
      const actual = sut.getScriptPositionInCode(script);
      // assert
      expect(actual).to.deep.equal(expected);
    });
  });
});

// Prefer over original ctor in tests for easier future ctor refactorings
class CodeChangedEventBuilder {
  private code = '[CodeChangedEventBuilder] default code';

  private oldScripts: ReadonlyArray<SelectedScript> = [];

  private newScripts = new Map<SelectedScript, ICodePosition>();

  public withCode(code: string) {
    this.code = code;
    return this;
  }

  public withOldScripts(oldScripts: ReadonlyArray<SelectedScript>) {
    this.oldScripts = oldScripts;
    return this;
  }

  public withNewScripts(newScripts: Map<SelectedScript, ICodePosition>) {
    this.newScripts = newScripts;
    return this;
  }

  public build(): CodeChangedEvent {
    return new CodeChangedEvent(
      this.code,
      this.oldScripts,
      this.newScripts,
    );
  }
}
