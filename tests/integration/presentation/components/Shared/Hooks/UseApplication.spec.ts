import 'mocha';
import { expect } from 'chai';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import { ApplicationFactory } from '@/application/ApplicationFactory';

describe('UseApplication', () => {
  it('should return the actual application from factory', async () => {
    // arrange
    const expected = await ApplicationFactory.Current.getApp();

    // act
    const { application } = useApplication(expected);

    // assert
    expect(application).to.equal(expected);
  });

  it('should return the actual info from the application', async () => {
    // arrange
    const app = await ApplicationFactory.Current.getApp();
    const expected = app.info;

    // act
    const { info } = useApplication();

    // assert
    expect(info).to.equal(expected);
  });
});
