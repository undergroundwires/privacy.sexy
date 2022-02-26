export function getProcessEnvironmentStub(): NodeJS.ProcessEnv {
  return {
    VUE_APP_VERSION: '0.11.3',
    VUE_APP_NAME: 'stub-name',
    VUE_APP_REPOSITORY_URL: 'stub-repository-url',
    VUE_APP_HOMEPAGE_URL: 'stub-homepage-url',
  };
}
