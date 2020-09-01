import 'mocha';
import { expect } from 'chai';
import { ScriptStub } from '../../../../../../stubs/ScriptStub';
import { CategoryReverter } from '@/presentation/Scripts/ScriptsTree/SelectableTree/Node/Reverter/CategoryReverter';
import { getCategoryNodeId } from '@/presentation/Scripts/ScriptsTree/ScriptNodeParser';
import { CategoryStub } from '../../../../../../stubs/CategoryStub';
import { Script } from '@/domain/Script';
import { ApplicationStub } from '../../../../../../stubs/ApplicationStub';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { UserSelection } from '@/application/State/Selection/UserSelection';

describe('CategoryReverter', () => {
    describe('getState', () => {
        // arrange
        const scripts = [
            new ScriptStub('revertable').withRevertCode('REM revert me'),
            new ScriptStub('revertable2').withRevertCode('REM revert me 2'),
        ];
        const category = new CategoryStub(1).withScripts(...scripts);
        const nodeId = getCategoryNodeId(category);
        const app = new ApplicationStub().withAction(category);
        const sut = new CategoryReverter(nodeId, app);
        const testCases = [
            {
                name: 'false when subscripts are not reverted',
                state: scripts.map((script) => new SelectedScript(script, false)),
                expected: false,
            },
            {
                name: 'false when some subscripts are reverted',
                state: [new SelectedScript(scripts[0], false), new SelectedScript(scripts[0], true)],
                expected: false,
            },
            {
                name: 'false when subscripts are not reverted',
                state: scripts.map((script) => new SelectedScript(script, true)),
                expected: true,
            },
        ];
        for (const testCase of testCases) {
            it(testCase.name, () => {
                // act
                const actual = sut.getState(testCase.state);
                // assert
                expect(actual).to.equal(testCase.expected);
            });
        }
    });
    describe('selectWithRevertState', () => {
        // arrange
        const scripts = [
            new ScriptStub('revertable').withRevertCode('REM revert me'),
            new ScriptStub('revertable2').withRevertCode('REM revert me 2'),
        ];
        const category = new CategoryStub(1).withScripts(...scripts);
        const app = new ApplicationStub().withAction(category);
        const testCases = [
            {
                name: 'selects with revert state when not selected',
                selection: [],
                revert: true, expectRevert: true,
            },
            {
                name: 'selects with non-revert state when not selected',
                selection: [],
                revert: false, expectRevert: false,
            },
            {
                name: 'switches when already selected with revert state',
                selection: scripts.map((script) => new SelectedScript(script, true)),
                revert: false, expectRevert: false,
            },
            {
                name: 'switches when already selected with not revert state',
                selection: scripts.map((script) => new SelectedScript(script, false)),
                revert: true, expectRevert: true,
            },
            {
                name: 'keeps revert state when already selected with revert state',
                selection: scripts.map((script) => new SelectedScript(script, true)),
                revert: true, expectRevert: true,
            },
            {
                name: 'keeps revert state deselected when already selected wtih non revert state',
                selection: scripts.map((script) => new SelectedScript(script, false)),
                revert: false, expectRevert: false,
            },
        ];
        const nodeId = getCategoryNodeId(category);
        for (const testCase of testCases) {
            it(testCase.name, () => {
                const selection = new UserSelection(app, testCase.selection);
                const sut = new CategoryReverter(nodeId, app);
                // act
                sut.selectWithRevertState(testCase.revert, selection);
                // assert
                expect(sut.getState(selection.selectedScripts)).to.equal(testCase.expectRevert);
                expect(selection.selectedScripts).has.lengthOf(2);
                expect(selection.selectedScripts[0].id).equal(scripts[0].id);
                expect(selection.selectedScripts[1].id).equal(scripts[1].id);
                expect(selection.selectedScripts[0].revert).equal(testCase.expectRevert);
                expect(selection.selectedScripts[1].revert).equal(testCase.expectRevert);
            });
        }
    });
});
