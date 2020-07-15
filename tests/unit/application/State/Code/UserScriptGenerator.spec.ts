import { ScriptStub } from './../../../stubs/ScriptStub';
import { UserScriptGenerator, adminRightsScript } from '@/application/State/Code/UserScriptGenerator';
import 'mocha';
import { expect } from 'chai';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';

describe('UserScriptGenerator', () => {
    it('adds version', () => {
        const sut = new UserScriptGenerator();
        // arrange
        const version = '1.5.0';
        const selectedScripts = [ new SelectedScript(new ScriptStub('id'), false)];
        // act
        const actual = sut.buildCode(selectedScripts, version);
        // assert
        expect(actual).to.include(version);
    });
    it('adds admin rights function', () => {
        const sut = new UserScriptGenerator();
        // arrange
        const selectedScripts = [ new SelectedScript(new ScriptStub('id'), false)];
        // act
        const actual = sut.buildCode(selectedScripts, 'non-important-version');
        // assert
        expect(actual).to.include(adminRightsScript.code);
        expect(actual).to.include(adminRightsScript.name);
    });
    it('appends revert script', () => {
        const sut = new UserScriptGenerator();
        // arrange
        const scriptName = 'test non-revert script';
        const scriptCode = 'REM nop';
        const script = new ScriptStub('id').withName(scriptName).withRevertCode(scriptCode);
        const selectedScripts = [ new SelectedScript(script, true)];
        // act
        const actual = sut.buildCode(selectedScripts, 'non-important-version');
        // assert
        expect(actual).to.include(`${scriptName} (revert)`);
        expect(actual).to.include(scriptCode);
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
        expect(actual).to.include(scriptName);
        expect(actual).to.include(scriptCode);
    });
});
