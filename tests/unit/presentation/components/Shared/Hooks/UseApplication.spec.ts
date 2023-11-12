import { describe, it, expect } from 'vitest';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';
import { ProjectInformationStub } from '@tests/unit/shared/Stubs/ProjectInformationStub';

describe('UseApplication', () => {
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
