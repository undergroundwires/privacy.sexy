import 'mocha';
import { expect } from 'chai';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { CategoryStub } from '@tests/unit/stubs/CategoryStub';
import { CategoryCollectionStub } from '@tests/unit/stubs/CategoryCollectionStub';
import { SelectedScriptStub } from '@tests/unit/stubs/SelectedScriptStub';
import { ScriptStub } from '@tests/unit/stubs/ScriptStub';
import { UserSelectionTestRunner } from './UserSelectionTestRunner';

describe('UserSelection', () => {
    describe('ctor', () => {
        describe('has nothing with no initial selection', () => {
            // arrange
            const allScripts = [
                new SelectedScriptStub('s1', false),
            ];
            new UserSelectionTestRunner()
                .withSelectedScripts([])
                .withCategory(1, allScripts.map((s) => s.script))
            // act
                .run()
            // assert
                .expectFinalScripts([]);
        });
        describe('has initial selection', () => {
            // arrange
            const scripts = [
                new SelectedScriptStub('s1', false),
                new SelectedScriptStub('s2', false),
            ];
            new UserSelectionTestRunner()
                .withSelectedScripts(scripts)
                .withCategory(1, scripts.map((s) => s.script))
            // act
                .run()
            // assert
                .expectFinalScripts(scripts);
        });
    });
    describe('deselectAll removes all items', () => {
        // arrange
        const allScripts = [
            new SelectedScriptStub('s1', false),
            new SelectedScriptStub('s2', false),
            new SelectedScriptStub('s3', false),
            new SelectedScriptStub('s4', false),
        ];
        const selectedScripts = allScripts.filter(
            (s) => ['s1', 's2', 's3'].includes(s.id));
        new UserSelectionTestRunner()
            .withSelectedScripts(selectedScripts)
            .withCategory(1, allScripts.map((s) => s.script))
        // act
            .run((sut) => {
                sut.deselectAll();
            })
        // assert
            .expectTotalFiredEvents(1)
            .expectFinalScripts([])
            .expectFinalScriptsInEvent(0, []);
    });
    describe('selectOnly selects expected', () => {
        // arrange
        const allScripts = [
            new SelectedScriptStub('s1', false),
            new SelectedScriptStub('s2', false),
            new SelectedScriptStub('s3', false),
            new SelectedScriptStub('s4', false),
        ];
        const selectedScripts = allScripts.filter(
            (s) => ['s1', 's2', 's3'].includes(s.id));
        const scriptsToSelect = allScripts.filter(
            (s) => ['s2', 's3', 's4'].includes(s.id));
        new UserSelectionTestRunner()
            .withSelectedScripts(selectedScripts)
            .withCategory(1, allScripts.map((s) => s.script))
        // act
            .run((sut) => {
                sut.selectOnly(scriptsToSelect.map((s) => s.script));
            })
        // assert
            .expectTotalFiredEvents(1)
            .expectFinalScripts(scriptsToSelect)
            .expectFinalScriptsInEvent(0, scriptsToSelect);
    });
    describe('selectAll selects as expected', () => {
        // arrange
        const expected = [
            new SelectedScriptStub('s1', false),
            new SelectedScriptStub('s2', false),
        ];
        new UserSelectionTestRunner()
            .withSelectedScripts([])
            .withCategory(1, expected.map((s) => s.script))
        // act
            .run((sut) => {
                sut.selectAll();
            })
        // assert
            .expectTotalFiredEvents(1)
            .expectFinalScripts(expected)
            .expectFinalScriptsInEvent(0, expected);
    });
    describe('addOrUpdateSelectedScript', () => {
        describe('adds when item does not exist', () => {
            // arrange
            const scripts = [new ScriptStub('s1'), new ScriptStub('s2')];
            const expected = [ new SelectedScript(scripts[0], false) ];
            new UserSelectionTestRunner()
                .withSelectedScripts([])
                .withCategory(1, scripts)
            // act
                .run((sut) => {
                    sut.addOrUpdateSelectedScript(scripts[0].id, false);
                })
            // assert
                .expectTotalFiredEvents(1)
                .expectFinalScripts(expected)
                .expectFinalScriptsInEvent(0, expected);
        });
        describe('updates when item exists', () => {
            // arrange
            const scripts = [new ScriptStub('s1'), new ScriptStub('s2')];
            const existing = new SelectedScript(scripts[0], false);
            const expected = new SelectedScript(scripts[0], true);
            new UserSelectionTestRunner()
                .withSelectedScripts([existing])
                .withCategory(1, scripts)
            // act
                .run((sut) => {
                    sut.addOrUpdateSelectedScript(expected.id, expected.revert);
                })
            // assert
                .expectTotalFiredEvents(1)
                .expectFinalScripts([ expected ])
                .expectFinalScriptsInEvent(0, [ expected ]);
        });
    });
    describe('removeAllInCategory', () => {
        describe('does nothing when nothing exists', () => {
            // arrange
            const categoryId = 99;
            const scripts = [new ScriptStub('s1'), new ScriptStub('s2')];
            new UserSelectionTestRunner()
                .withSelectedScripts([])
                .withCategory(categoryId, scripts)
            // act
                .run((sut) => {
                    sut.removeAllInCategory(categoryId);
                })
            // assert
                .expectTotalFiredEvents(0)
                .expectFinalScripts([]);
        });
        describe('removes all when all exists', () => {
            // arrange
            const categoryId = 34;
            const scripts = [new SelectedScriptStub('s1'), new SelectedScriptStub('s2')];
            new UserSelectionTestRunner()
                .withSelectedScripts(scripts)
                .withCategory(categoryId, scripts.map((s) => s.script))
            // act
                .run((sut) => {
                    sut.removeAllInCategory(categoryId);
                })
            // assert
                .expectTotalFiredEvents(1)
                .expectFinalScripts([]);
        });
        describe('removes existing when some exists', () => {
            // arrange
            const categoryId = 55;
            const existing = [new ScriptStub('s1'), new ScriptStub('s2')];
            const notExisting = [new ScriptStub('s3'), new ScriptStub('s4')];
            new UserSelectionTestRunner()
                .withSelectedScripts(existing.map((script) => new SelectedScript(script, false)))
                .withCategory(categoryId, [ ...existing, ...notExisting ])
            // act
                .run((sut) => {
                    sut.removeAllInCategory(categoryId);
                })
            // assert
                .expectTotalFiredEvents(1)
                .expectFinalScripts([]);
        });
    });
    describe('addOrUpdateAllInCategory', () => {
        describe('when all already exists', () => {
            describe('does nothing if nothing is changed', () => {
                // arrange
                const categoryId = 55;
                const existingScripts = [
                    new SelectedScriptStub('s1', false),
                    new SelectedScriptStub('s2', false),
                ];
                new UserSelectionTestRunner()
                    .withSelectedScripts(existingScripts)
                    .withCategory(categoryId, existingScripts.map((s) => s.script))
                // act
                    .run((sut) => {
                        sut.addOrUpdateAllInCategory(categoryId);
                    })
                // assert
                    .expectTotalFiredEvents(0)
                    .expectFinalScripts(existingScripts);
            });
            describe('changes revert status of all', () => {
                // arrange
                const newStatus = false;
                const scripts = [
                    new SelectedScriptStub('e1', !newStatus),
                    new SelectedScriptStub('e2', !newStatus),
                    new SelectedScriptStub('e3', newStatus),
                ];
                const expectedScripts = scripts.map((s) => new SelectedScript(s.script, newStatus));
                const categoryId = 31;
                new UserSelectionTestRunner()
                    .withSelectedScripts(scripts)
                    .withCategory(categoryId, scripts.map((s) => s.script))
                // act
                    .run((sut) => {
                        sut.addOrUpdateAllInCategory(categoryId, newStatus);
                    })
                // assert
                    .expectTotalFiredEvents(1)
                    .expectFinalScripts(expectedScripts)
                    .expectFinalScriptsInEvent(0, expectedScripts);
            });
        });
        describe('when nothing exists; adds all with given revert status', () => {
            const revertStatuses = [ true, false ];
            for (const revertStatus of revertStatuses) {
                describe(`when revert status is ${revertStatus}`, () => {
                    // arrange
                    const categoryId = 1;
                    const scripts = [
                        new SelectedScriptStub('s1', !revertStatus),
                        new SelectedScriptStub('s2', !revertStatus),
                    ];
                    const expected = scripts.map((s) => new SelectedScript(s.script, revertStatus));
                    new UserSelectionTestRunner()
                        .withSelectedScripts([])
                        .withCategory(categoryId, scripts.map((s) => s.script))
                    // act
                        .run((sut) => {
                            sut.addOrUpdateAllInCategory(categoryId, revertStatus);
                        })
                    // assert
                        .expectTotalFiredEvents(1)
                        .expectFinalScripts(expected)
                        .expectFinalScriptsInEvent(0, expected);
                });
            }
        });
        describe('when some exists; changes revert status of all', () => {
            // arrange
            const newStatus = true;
            const existing = [
                new SelectedScriptStub('e1', true),
                new SelectedScriptStub('e2', false),
            ];
            const notExisting = [
                new SelectedScriptStub('n3', true),
                new SelectedScriptStub('n4', false),
            ];
            const allScripts = [ ...existing, ...notExisting ];
            const expectedScripts = allScripts.map((s) => new SelectedScript(s.script, newStatus));
            const categoryId = 77;
            new UserSelectionTestRunner()
                .withSelectedScripts(existing)
                .withCategory(categoryId, allScripts.map((s) => s.script))
            // act
                .run((sut) => {
                    sut.addOrUpdateAllInCategory(categoryId, newStatus);
                })
            // assert
                .expectTotalFiredEvents(1)
                .expectFinalScripts(expectedScripts)
                .expectFinalScriptsInEvent(0, expectedScripts);
        });
    });
    describe('isSelected', () => {
        it('returns false when not selected', () => {
            // arrange
            const selectedScript = new ScriptStub('selected');
            const notSelectedScript = new ScriptStub('not selected');
            const collection = new CategoryCollectionStub()
                .withAction(new CategoryStub(1)
                .withScripts(selectedScript, notSelectedScript));
            const sut = new UserSelection(collection, [ new SelectedScript(selectedScript, false) ]);
            // act
            const actual = sut.isSelected(notSelectedScript.id);
            // assert
            expect(actual).to.equal(false);
        });
        it('returns true when selected', () => {
            // arrange
            const selectedScript = new ScriptStub('selected');
            const notSelectedScript = new ScriptStub('not selected');
            const collection = new CategoryCollectionStub()
                .withAction(new CategoryStub(1)
                .withScripts(selectedScript, notSelectedScript));
            const sut = new UserSelection(collection, [ new SelectedScript(selectedScript, false) ]);
            // act
            const actual = sut.isSelected(selectedScript.id);
            // assert
            expect(actual).to.equal(true);
        });
    });
    describe('category state', () => {
        describe('when no scripts are selected', () => {
            // arrange
            const category = new CategoryStub(1)
                .withScriptIds('non-selected-script-1', 'non-selected-script-2');
            const collection = new CategoryCollectionStub().withAction(category);
            const sut = new UserSelection(collection, [ ]);
            it('areAllSelected returns false', () => {
                // act
                const actual = sut.areAllSelected(category);
                // assert
                expect(actual).to.equal(false);
            });
            it('isAnySelected returns false', () => {
                // act
                const actual = sut.isAnySelected(category);
                // assert
                expect(actual).to.equal(false);
            });
        });
        describe('when no subscript exists in selected scripts', () => {
            // arrange
            const category = new CategoryStub(1)
                .withScriptIds('non-selected-script-1', 'non-selected-script-2');
            const selectedScript = new ScriptStub('selected');
            const collection = new CategoryCollectionStub()
                .withAction(category)
                .withAction(new CategoryStub(22).withScript(selectedScript));
            const sut = new UserSelection(collection, [ new SelectedScript(selectedScript, false) ]);
            it('areAllSelected returns false', () => {
                // act
                const actual = sut.areAllSelected(category);
                // assert
                expect(actual).to.equal(false);
            });
            it('isAnySelected returns false', () => {
                // act
                const actual = sut.isAnySelected(category);
                // assert
                expect(actual).to.equal(false);
            });
        });
        describe('when one of the scripts are selected', () => {
            // arrange
            const selectedScript = new ScriptStub('selected');
            const category = new CategoryStub(1)
                .withScriptIds('non-selected-script-1', 'non-selected-script-2')
                .withCategory(new CategoryStub(12).withScript(selectedScript));
            const collection = new CategoryCollectionStub().withAction(category);
            const sut = new UserSelection(collection, [ new SelectedScript(selectedScript, false) ]);
            it('areAllSelected returns false', () => {
                // act
                const actual = sut.areAllSelected(category);
                // assert
                expect(actual).to.equal(false);
            });
            it('isAnySelected returns true', () => {
                // act
                const actual = sut.isAnySelected(category);
                // assert
                expect(actual).to.equal(true);
            });
        });
        describe('when all scripts are selected', () => {
            // arrange
            const firstSelectedScript = new ScriptStub('selected1');
            const secondSelectedScript = new ScriptStub('selected2');
            const category = new CategoryStub(1)
                .withScript(firstSelectedScript)
                .withCategory(new CategoryStub(12).withScript(secondSelectedScript));
            const collection = new CategoryCollectionStub().withAction(category);
            const sut = new UserSelection(collection,
                [ firstSelectedScript, secondSelectedScript ].map((s) => new SelectedScript(s, false)));
            it('areAllSelected returns true', () => {
                // act
                const actual = sut.areAllSelected(category);
                // assert
                expect(actual).to.equal(true);
            });
            it('isAnySelected returns true', () => {
                // act
                const actual = sut.isAnySelected(category);
                // assert
                expect(actual).to.equal(true);
            });
        });
    });
});
