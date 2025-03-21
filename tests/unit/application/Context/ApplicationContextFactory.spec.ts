import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ApplicationProviderStub } from '@tests/unit/shared/Stubs/ApplicationProviderStub';

describe('ApplicationContextFactory', () => {
  describe('buildContext', () => {
    describe('factory', () => {
      it('sets application from factory', async () => {
        // arrange
        const expected = new ApplicationStub().withCollection(
          new CategoryCollectionStub().withOs(OperatingSystem.macOS),
        );
        const { provider } = new ApplicationProviderStub().withApp(expected);
        // act
        const context = await buildContext(provider);
        // assert
        expect(expected).to.equal(context.app);
      });
    });
    describe('environment', () => {
      describe('sets initial OS as expected', () => {
        it('returns current OS if it is supported', async () => {
          // arrange
          const expected = OperatingSystem.Windows;
          const environment = new RuntimeEnvironmentStub().withOs(expected);
          const collection = new CategoryCollectionStub().withOs(expected);
          const { provider } = new ApplicationProviderStub().withApp(
            new ApplicationStub().withCollection(collection),
          );
          // act
          const context = await buildContext(provider, environment);
          // assert
          const actual = context.state.os;
          expect(expected).to.equal(actual);
        });
        it('fallbacks to other OS if OS in environment is not supported', async () => {
          // arrange
          const expected = OperatingSystem.Windows;
          const currentOs = OperatingSystem.macOS;
          const environment = new RuntimeEnvironmentStub().withOs(currentOs);
          const collection = new CategoryCollectionStub().withOs(expected);
          const { provider } = new ApplicationProviderStub().withApp(
            new ApplicationStub().withCollection(collection),
          );
          // act
          const context = await buildContext(provider, environment);
          // assert
          const actual = context.state.os;
          expect(expected).to.equal(actual);
        });
        it('fallbacks to most supported OS if current OS is not supported', async () => {
          // arrange
          const runtimeOs = OperatingSystem.macOS;
          const expectedOs = OperatingSystem.Android;
          const allCollections = [
            new CategoryCollectionStub().withOs(OperatingSystem.Linux).withTotalScripts(3),
            new CategoryCollectionStub().withOs(expectedOs).withTotalScripts(5),
            new CategoryCollectionStub().withOs(OperatingSystem.Windows).withTotalScripts(4),
          ];
          const environment = new RuntimeEnvironmentStub().withOs(runtimeOs);
          const app = new ApplicationStub().withCollections(...allCollections);
          const { provider } = new ApplicationProviderStub().withApp(app);
          // act
          const context = await buildContext(provider, environment);
          // assert
          const actual = context.state.os;
          expect(expectedOs).to.equal(actual, `Expected: ${OperatingSystem[expectedOs]}, actual: ${OperatingSystem[actual]}`);
        });
        it('fallbacks to most supported OS if current OS is undefined', async () => {
          // arrange
          const runtimeOs = OperatingSystem.macOS;
          const expectedOs = OperatingSystem.Android;
          const allCollections = [
            new CategoryCollectionStub().withOs(OperatingSystem.Linux).withTotalScripts(3),
            new CategoryCollectionStub().withOs(expectedOs).withTotalScripts(5),
            new CategoryCollectionStub().withOs(OperatingSystem.Windows).withTotalScripts(4),
          ];
          const environment = new RuntimeEnvironmentStub().withOs(runtimeOs);
          const app = new ApplicationStub().withCollections(...allCollections);
          const { provider } = new ApplicationProviderStub().withApp(app);
          // act
          const context = await buildContext(provider, environment);
          // assert
          const actual = context.state.os;
          expect(expectedOs).to.equal(actual, `Expected: ${OperatingSystem[expectedOs]}, actual: ${OperatingSystem[actual]}`);
        });
      });
    });
  });
});
