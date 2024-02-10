import { describe, it, expect } from 'vitest';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';

describe('UseApplication', () => {
  it('should return expected projectDetails', () => {
    // arrange
    const expectedProjectDetails = new ProjectDetailsStub()
      .withName(`expected-${ProjectDetailsStub.name}`);
    const application = new ApplicationStub()
      .withProjectDetails(expectedProjectDetails);
    // act
    const { projectDetails } = useApplication(application);
    // assert
    expect(projectDetails).to.equal(expectedProjectDetails);
  });

  it('should return expected application', () => {
    // arrange
    const expectedApp = new ApplicationStub()
      .withProjectDetails(
        new ProjectDetailsStub().withName('expected-application'),
      );
    // act
    const { application } = useApplication(expectedApp);
    // assert
    expect(application).to.equal(expectedApp);
  });
});
