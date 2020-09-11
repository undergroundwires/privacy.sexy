import 'mocha';
import { expect } from 'chai';
import { ScriptReverter } from '@/presentation/Scripts/ScriptsTree/SelectableTree/Node/Reverter/ScriptReverter';
import { SelectedScriptStub } from '../../../../../../stubs/SelectedScriptStub';
import { getScriptNodeId } from '@/presentation/Scripts/ScriptsTree/ScriptNodeParser';
import { ScriptStub } from '../../../../../../stubs/ScriptStub';
import { UserSelection } from '../../../../../../../../src/application/State/Selection/UserSelection';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { ApplicationStub } from '../../../../../../stubs/ApplicationStub';
import { CategoryStub } from '../../../../../../stubs/CategoryStub';

describe('ScriptReverter', () => {
    describe('getState', () => {
        it('false when script is not selected', () => {
            // arrange
            const script = new ScriptStub('id');
            const nodeId = getScriptNodeId(script);
            const sut = new ScriptReverter(nodeId);
            // act
            const actual = sut.getState([]);
            // assert
            expect(actual).to.equal(false);
        });
        it('false when script is selected but not reverted', () => {
            // arrange
            const scripts = [ new SelectedScriptStub('id'), new SelectedScriptStub('dummy') ];
            const nodeId = getScriptNodeId(scripts[0].script);
            const sut = new ScriptReverter(nodeId);
            // act
            const actual = sut.getState(scripts);
            // assert
            expect(actual).to.equal(false);
        });
        it('true when script is selected and reverted', () => {
            // arrange
            const scripts = [ new SelectedScriptStub('id', true), new SelectedScriptStub('dummy') ];
            const nodeId = getScriptNodeId(scripts[0].script);
            const sut = new ScriptReverter(nodeId);
            // act
            const actual = sut.getState(scripts);
            // assert
            expect(actual).to.equal(true);
        });
    });
    describe('selectWithRevertState', () => {
        // arrange
        const script = new ScriptStub('id');
        const app = new ApplicationStub().withAction(new CategoryStub(5).withScript(script));
        const testCases = [
            {
                name: 'selects with revert state when not selected',
                selection: [], revert: true, expectRevert: true,
            },
            {
                name: 'selects with non-revert state when not selected',
                selection: [], revert: false, expectRevert: false,
            },
            {
                name: 'switches when already selected with revert state',
                selection: [ new SelectedScript(script, true)], revert: false, expectRevert: false,
            },
            {
                name: 'switches when already selected with not revert state',
                selection: [ new SelectedScript(script, false)], revert: true, expectRevert: true,
            },
            {
                name: 'keeps revert state when already selected with revert state',
                selection: [ new SelectedScript(script, true)], revert: true, expectRevert: true,
            },
            {
                name: 'keeps revert state deselected when already selected with non revert state',
                selection: [ new SelectedScript(script, false)], revert: false, expectRevert: false,
            },
        ];
        const nodeId = getScriptNodeId(script);
        for (const testCase of testCases) {
            it(testCase.name, () => {
                const selection = new UserSelection(app, testCase.selection);
                const sut = new ScriptReverter(nodeId);
                // act
                sut.selectWithRevertState(testCase.revert, selection);
                // assert
                expect(selection.isSelected(script.id)).to.equal(true);
                expect(selection.selectedScripts[0].revert).equal(testCase.expectRevert);
            });
        }
    });
});
