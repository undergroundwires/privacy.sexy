import applicationFile from 'js-yaml-loader!@/application/application.yaml';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import 'mocha';
import { expect } from 'chai';

describe('ApplicationParser', () => {
    describe('parseApplication', () => {
        it('can parse current application file', () => {
            expect(() => parseApplication(applicationFile)).to.not.throw();
        });
    });
});
