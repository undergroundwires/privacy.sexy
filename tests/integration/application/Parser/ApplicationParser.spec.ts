import 'mocha';
import { expect } from 'chai';
import { parseApplication } from '@/application/Parser/ApplicationParser';

describe('ApplicationParser', () => {
  describe('parseApplication', () => {
    it('can parse current application', () => {
      // act
      const act = () => parseApplication();
      // assert
      expect(act).to.not.throw();
    });
  });
});
