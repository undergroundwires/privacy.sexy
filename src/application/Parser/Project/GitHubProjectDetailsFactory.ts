import { assertInRange } from '@/application/Common/Enum';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ProjectDetailsParameters, ProjectDetailsFactory } from './ProjectDetailsFactory';

export const createGitHubProjectDetails: ProjectDetailsFactory = (parameters) => {
  validateParameters(parameters);
  const githubRepositoryWebUrl = getWebUrl(parameters.repositoryUrl);
  return {
    name: parameters.name,
    version: parameters.version,
    slogan: parameters.slogan,
    repositoryUrl: parameters.repositoryUrl,
    homepage: parameters.homepage,
    repositoryWebUrl: githubRepositoryWebUrl,
    feedbackUrl: `${githubRepositoryWebUrl}/issues`,
    releaseUrl: `${githubRepositoryWebUrl}/releases/tag/${parameters.version}`,
    getDownloadUrl: (os) => {
      const fileName = getFileName(os, parameters.version.toString());
      return `${githubRepositoryWebUrl}/releases/download/${parameters.version}/${fileName}`;
    },
  };
};

function validateParameters(parameters: ProjectDetailsParameters) {
  if (!parameters.name) {
    throw new Error('name is undefined');
  }
  if (!parameters.slogan) {
    throw new Error('undefined slogan');
  }
  if (!parameters.repositoryUrl) {
    throw new Error('repositoryUrl is undefined');
  }
  if (!parameters.homepage) {
    throw new Error('homepage is undefined');
  }
}

function getWebUrl(gitUrl: string) {
  if (gitUrl.endsWith('.git')) {
    return gitUrl.substring(0, gitUrl.length - 4);
  }
  return gitUrl;
}

function getFileName(os: OperatingSystem, version: string): string {
  assertInRange(os, OperatingSystem);
  switch (os) {
    case OperatingSystem.Linux:
      return `privacy.sexy-${version}.AppImage`;
    case OperatingSystem.macOS:
      return `privacy.sexy-${version}.dmg`;
    case OperatingSystem.Windows:
      return `privacy.sexy-Setup-${version}.exe`;
    default:
      throw new RangeError(`Unsupported os: ${OperatingSystem[os]}`);
  }
}
