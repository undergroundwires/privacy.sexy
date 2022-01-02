import 'mocha';
import { expect } from 'chai';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';

describe('ProjectInformation', () => {
  it('sets name as expected', () => {
    // arrange
    const expected = 'expected-name';
    const sut = new ProjectInformation(expected, 'version', 'repositoryUrl', 'homepage');
    // act
    const actual = sut.name;
    // assert
    expect(actual).to.equal(expected);
  });
  it('sets version as expected', () => {
    // arrange
    const expected = 'expected-version';
    const sut = new ProjectInformation('name', expected, 'repositoryUrl', 'homepage');
    // act
    const actual = sut.version;
    // assert
    expect(actual).to.equal(expected);
  });
  it('sets repositoryUrl as expected', () => {
    // arrange
    const expected = 'expected-repository-url';
    const sut = new ProjectInformation('name', 'version', expected, 'homepage');
    // act
    const actual = sut.repositoryUrl;
    // assert
    expect(actual).to.equal(expected);
  });
  describe('sets repositoryWebUrl as expected', () => {
    it('sets repositoryUrl when it does not end with .git', () => {
      // arrange
      const expected = 'expected-repository-url';
      const sut = new ProjectInformation('name', 'version', expected, 'homepage');
      // act
      const actual = sut.repositoryWebUrl;
      // assert
      expect(actual).to.equal(expected);
    });
    it('removes ".git" from the end when it ends with ".git"', () => {
      // arrange
      const expected = 'expected-repository-url';
      const sut = new ProjectInformation('name', 'version', `${expected}.git`, 'homepage');
      // act
      const actual = sut.repositoryWebUrl;
      // assert
      expect(actual).to.equal(expected);
    });
  });
  it('sets homepage as expected', () => {
    // arrange
    const expected = 'expected-homepage';
    const sut = new ProjectInformation('name', 'version', 'repositoryUrl', expected);
    // act
    const actual = sut.homepage;
    // assert
    expect(actual).to.equal(expected);
  });
  it('sets feedbackUrl to github issues page', () => {
    // arrange
    const repositoryUrl = 'https://github.com/undergroundwires/privacy.sexy.git';
    const expected = 'https://github.com/undergroundwires/privacy.sexy/issues';
    const sut = new ProjectInformation('name', 'version', repositoryUrl, 'homepage');
    // act
    const actual = sut.feedbackUrl;
    // assert
    expect(actual).to.equal(expected);
  });
  it('sets releaseUrl to github releases page', () => {
    // arrange
    const repositoryUrl = 'https://github.com/undergroundwires/privacy.sexy.git';
    const version = '0.7.2';
    const expected = 'https://github.com/undergroundwires/privacy.sexy/releases/tag/0.7.2';
    const sut = new ProjectInformation('name', version, repositoryUrl, 'homepage');
    // act
    const actual = sut.releaseUrl;
    // assert
    expect(actual).to.equal(expected);
  });
  describe('getDownloadUrl', () => {
    it('gets expected url for macOS', () => {
      // arrange
      const expected = 'https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-0.7.2.dmg';
      const repositoryUrl = 'https://github.com/undergroundwires/privacy.sexy.git';
      const version = '0.7.2';
      const sut = new ProjectInformation('name', version, repositoryUrl, 'homepage');
      // act
      const actual = sut.getDownloadUrl(OperatingSystem.macOS);
      // assert
      expect(actual).to.equal(expected);
    });
    it('gets expected url for Linux', () => {
      // arrange
      const expected = 'https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-0.7.2.AppImage';
      const repositoryUrl = 'https://github.com/undergroundwires/privacy.sexy.git';
      const version = '0.7.2';
      const sut = new ProjectInformation('name', version, repositoryUrl, 'homepage');
      // act
      const actual = sut.getDownloadUrl(OperatingSystem.Linux);
      // assert
      expect(actual).to.equal(expected);
    });
    it('gets expected url for Windows', () => {
      // arrange
      const expected = 'https://github.com/undergroundwires/privacy.sexy/releases/download/0.7.2/privacy.sexy-Setup-0.7.2.exe';
      const repositoryUrl = 'https://github.com/undergroundwires/privacy.sexy.git';
      const version = '0.7.2';
      const sut = new ProjectInformation('name', version, repositoryUrl, 'homepage');
      // act
      const actual = sut.getDownloadUrl(OperatingSystem.Windows);
      // assert
      expect(actual).to.equal(expected);
    });
    describe('throws when os is invalid', () => {
      // arrange
      const sut = new ProjectInformation('name', 'version', 'repositoryUrl', 'homepage');
      // act
      const act = (os: OperatingSystem) => sut.getDownloadUrl(os);
      // assert
      new EnumRangeTestRunner(act)
        .testOutOfRangeThrows()
        .testUndefinedValueThrows()
        .testInvalidValueThrows(OperatingSystem.KaiOS, `Unsupported os: ${OperatingSystem[OperatingSystem.KaiOS]}`);
    });
  });
});
