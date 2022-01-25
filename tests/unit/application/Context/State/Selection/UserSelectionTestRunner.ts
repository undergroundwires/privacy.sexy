import { expect } from 'chai';
import 'mocha';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { IScript } from '@/domain/IScript';

export class UserSelectionTestRunner {
  private readonly collection = new CategoryCollectionStub();

  private existingScripts: readonly SelectedScript[] = [];

  private events: Array<readonly SelectedScript[]> = [];

  private sut: UserSelection;

  public withCategory(categoryId: number, scripts: readonly IScript[]) {
    const category = new CategoryStub(categoryId)
      .withScripts(...scripts);
    this.collection
      .withAction(category);
    return this;
  }

  public withSelectedScripts(existingScripts: readonly SelectedScript[]) {
    this.existingScripts = existingScripts;
    return this;
  }

  public run(runner?: (sut: UserSelection) => void) {
    this.sut = this.createSut();
    if (runner) {
      runner(this.sut);
    }
    return this;
  }

  public expectTotalFiredEvents(amount: number) {
    const testName = amount === 0 ? 'does not fire changed event' : `fires changed event ${amount} times`;
    it(testName, () => {
      expect(this.events).to.have.lengthOf(amount);
    });
    return this;
  }

  public expectFinalScripts(finalScripts: readonly SelectedScript[]) {
    expectSameScripts(finalScripts, this.sut.selectedScripts);
    return this;
  }

  public expectFinalScriptsInEvent(eventIndex: number, finalScripts: readonly SelectedScript[]) {
    expectSameScripts(this.events[eventIndex], finalScripts);
    return this;
  }

  private createSut(): UserSelection {
    const sut = new UserSelection(this.collection, this.existingScripts);
    sut.changed.on((s) => this.events.push(s));
    return sut;
  }
}

function expectSameScripts(actual: readonly SelectedScript[], expected: readonly SelectedScript[]) {
  it('has same expected scripts', () => {
    const existingScriptIds = expected.map((script) => script.id).sort();
    const expectedScriptIds = actual.map((script) => script.id).sort();
    expect(existingScriptIds).to.deep.equal(expectedScriptIds);
  });
  it('has expected revert state', () => {
    const scriptsWithDifferentStatus = actual
      .filter((script) => {
        const other = expected.find((existing) => existing.id === script.id);
        if (!other) {
          throw new Error(`Script "${script.id}" does not exist in expected scripts: ${JSON.stringify(expected, null, '\t')}`);
        }
        return script.revert !== other.revert;
      });
    expect(scriptsWithDifferentStatus).to.have.lengthOf(
      0,
      `Scripts with different statuses:\n${
        scriptsWithDifferentStatus
          .map((s) => `[id: ${s.id}, actual status: ${s.revert}, `
            + `expected status: ${expected.find((existing) => existing.id === s.id).revert}]`)
          .join(' , ')
      }`,
    );
  });
}
