import { ScriptStub } from '../../../../stubs/ScriptStub';
import { UserScriptGenerator, adminRightsScript } from '@/application/State/Code/Generation/UserScriptGenerator';
import 'mocha';
import { expect } from 'chai';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { SelectedScriptStub } from '../../../../stubs/SelectedScriptStub';

describe('UserScriptGenerator', () => {
    it('adds version', () => {
        // arrange
        const sut = new UserScriptGenerator();
        const version = '1.5.0';
        const selectedScripts = [ new SelectedScript(new ScriptStub('id'), false)];
        // act
        const actual = sut.buildCode(selectedScripts, version);
        // assert
        expect(actual.code).to.include(version);
    });
    it('adds admin rights function', () => {
        // arrange
        const sut = new UserScriptGenerator();
        const selectedScripts = [ new SelectedScript(new ScriptStub('id'), false)];
        // act
        const actual = sut.buildCode(selectedScripts, 'non-important-version');
        // assert
        expect(actual.code).to.include(adminRightsScript.code);
        expect(actual.code).to.include(adminRightsScript.name);
    });
    it('appends revert script', () => {
        // arrange
        const sut = new UserScriptGenerator();
        const scriptName = 'test non-revert script';
        const scriptCode = 'REM nop';
        const script = new ScriptStub('id').withName(scriptName).withRevertCode(scriptCode);
        const selectedScripts = [ new SelectedScript(script, true)];
        // act
        const actual = sut.buildCode(selectedScripts, 'non-important-version');
        // assert
        expect(actual.code).to.include(`${scriptName} (revert)`);
        expect(actual.code).to.include(scriptCode);
    });
    it('appends non-revert script', () => {
        const sut = new UserScriptGenerator();
        // arrange
        const scriptName = 'test non-revert script';
        const scriptCode = 'REM nop';
        const script = new ScriptStub('id').withName(scriptName).withCode(scriptCode);
        const selectedScripts = [ new SelectedScript(script, false)];
        // act
        const actual = sut.buildCode(selectedScripts, 'non-important-version');
        // assert
        expect(actual.code).to.include(scriptName);
        expect(actual.code).to.include(scriptCode);
    });
    describe('scriptPositions', () => {
        it('single script', () => {
            // arrange
            const sut = new UserScriptGenerator();
            const scriptName = 'test non-revert script';
            const scriptCode = 'REM nop\nREM nop2';
            const script = new ScriptStub('id').withName(scriptName).withCode(scriptCode);
            const selectedScripts = [ new SelectedScript(script, false)];
            // act
            const actual = sut.buildCode(selectedScripts, 'non-important-version');
            // assert
            expect(actual.scriptPositions.size).to.equal(1);
            const position = actual.scriptPositions.get(selectedScripts[0]);
            expect(position.endLine).to.be.greaterThan(position.startLine + 2);
        });
        it('multiple scripts', () => {
            // arrange
            const sut = new UserScriptGenerator();
            const selectedScripts = [ new SelectedScriptStub('1'), new SelectedScriptStub('2') ];
            // act
            const actual = sut.buildCode(selectedScripts, 'non-important-version');
            // assert
            const firstPosition = actual.scriptPositions.get(selectedScripts[0]);
            const secondPosition = actual.scriptPositions.get(selectedScripts[1]);
            expect(actual.scriptPositions.size).to.equal(2);
            expect(firstPosition.endLine).to.be.greaterThan(firstPosition.startLine + 1);
            expect(secondPosition.startLine).to.be.greaterThan(firstPosition.endLine);
            expect(secondPosition.endLine).to.be.greaterThan(secondPosition.startLine + 1);
        });
        it('no script', () => {
            // arrange
            const sut = new UserScriptGenerator();
            const selectedScripts = [ ];
            // act
            const actual = sut.buildCode(selectedScripts, 'non-important-version');
            // assert
            expect(actual.scriptPositions.size).to.equal(0);
        });
    });
});
