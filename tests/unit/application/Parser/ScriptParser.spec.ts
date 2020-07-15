import { YamlScript } from 'js-yaml-loader!./application.yaml';
import 'mocha';
import { expect } from 'chai';
import { parseScript } from '@/application/Parser/ScriptParser';
import { parseDocUrls } from '@/application/Parser/DocumentationParser';

describe('ScriptParser', () => {
    describe('parseScript', () => {
        it('parseScript parses as expected', () => {
            // arrange
            const expected: YamlScript = {
                name: 'expected name',
                code: 'expected code',
                revertCode: 'expected revert code',
                docs: ['hello.com'],
                recommend: true,
            };
            // act
            const actual = parseScript(expected);
            // assert
            expect(actual.name).to.equal(expected.name);
            expect(actual.code).to.equal(expected.code);
            expect(actual.revertCode).to.equal(expected.revertCode);
            expect(actual.documentationUrls).to.deep.equal(parseDocUrls(expected));
            expect(actual.isRecommended).to.equal(expected.recommend);
        });
    });
});
