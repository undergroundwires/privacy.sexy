import 'mocha';
import { expect } from 'chai';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';
import { ProjectInformationStub } from '@tests/unit/shared/Stubs/ProjectInformationStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('UseApplication', () => {
  describe('application is absent', () => {
    itEachAbsentObjectValue((absentValue) => {
      // arrange
      const expectedError = 'missing application';
      const applicationValue = absentValue;
      // act
      const act = () => useApplication(applicationValue);
      // assert
      expect(act).to.throw(expectedError);
    });
  });

  it('should return expected info', () => {
    // arrange
    const expectedInfo = new ProjectInformationStub()
      .withName('expected-project-information');
    const application = new ApplicationStub()
      .withProjectInformation(expectedInfo);
    // act
    const { info } = useApplication(application);
    // assert
    expect(info).to.equal(expectedInfo);
  });

  it('should return expected application', () => {
    // arrange
    const expectedApp = new ApplicationStub()
      .withProjectInformation(
        new ProjectInformationStub().withName('expected-application'),
      );
    // act
    const { application } = useApplication(expectedApp);
    // assert
    expect(application).to.equal(expectedApp);
  });
});
