import { describe, it, expect } from 'vitest';
import { ApplicationContext } from '@/application/Context/ApplicationContext';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import type { IApplicationContext, IApplicationContextChangedEvent } from '@/application/Context/IApplicationContext';
import type { Application } from '@/domain/Application/Application';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('ApplicationContext', () => {
  describe('changeContext', () => {
    describe('when initial os is changed to different one', () => {
      it('collection is changed as expected', () => {
        // arrange
        const testContext = new ObservableApplicationContextFactory()
          .withAppContainingCollections(OperatingSystem.Windows, OperatingSystem.macOS);
        const expectedCollection = testContext.app.getCollection(OperatingSystem.macOS);
        // act
        const sut = testContext
          .withInitialOs(OperatingSystem.Windows)
          .construct();
        sut.changeContext(OperatingSystem.macOS);
        // assert
        expect(sut.state.collection).to.equal(expectedCollection);
      });
      it('currentOs is changed as expected', () => {
        // arrange
        const expectedOs = OperatingSystem.macOS;
        const testContext = new ObservableApplicationContextFactory()
          .withAppContainingCollections(OperatingSystem.Windows, expectedOs);
        // act
        const sut = testContext
          .withInitialOs(OperatingSystem.Windows)
          .construct();
        sut.changeContext(expectedOs);
        // assert
        expect(sut.state.os).to.equal(expectedOs);
      });
      it('new state is empty', () => {
        // arrange
        const testContext = new ObservableApplicationContextFactory()
          .withAppContainingCollections(OperatingSystem.Windows, OperatingSystem.macOS);
        // act
        const sut = testContext
          .withInitialOs(OperatingSystem.Windows)
          .construct();
        sut.state.filter.applyFilter('filtered');
        sut.changeContext(OperatingSystem.macOS);
        // assert
        expectEmptyState(sut.state);
      });
      it('rethrows when application cannot provide collection for supported OS', () => {
        // arrange
        const expectedError = 'expected error from application';
        const initialOs = OperatingSystem.Android;
        const targetOs = OperatingSystem.ChromeOS;
        const context = new ObservableApplicationContextFactory()
          .withAppContainingCollections(initialOs, targetOs)
          .withInitialOs(initialOs);
        // act
        const sut = context.construct();
        const { app } = context;
        app.getCollection = () => { throw new Error(expectedError); };
        const act = () => sut.changeContext(targetOs);
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws when OS state is unknown to application', () => {
        // arrange
        const knownOs = OperatingSystem.Android;
        const unknownOs = OperatingSystem.ChromeOS;
        const expectedError = `Operating system "${OperatingSystem[unknownOs]}" state is unknown.`;
        const sut = new ObservableApplicationContextFactory()
          .withAppContainingCollections(knownOs)
          .withInitialOs(knownOs)
          .construct();
        // act
        const act = () => sut.changeContext(unknownOs);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('remembers old state when changed backed to same os', () => {
      // arrange
      const os = OperatingSystem.Windows;
      const changedOs = OperatingSystem.macOS;
      const testContext = new ObservableApplicationContextFactory()
        .withAppContainingCollections(os, changedOs);
      const expectedFilter = 'first-state';
      // act
      const sut = testContext
        .withInitialOs(os)
        .construct();
      const firstState = sut.state;
      firstState.filter.applyFilter(expectedFilter);
      sut.changeContext(os);
      sut.changeContext(changedOs);
      sut.state.filter.applyFilter('second-state');
      sut.changeContext(os);
      // assert
      expectExists(sut.state.filter.currentFilter);
      const actualFilter = sut.state.filter.currentFilter.query;
      expect(actualFilter).to.equal(expectedFilter);
    });
    describe('contextChanged', () => {
      it('fired as expected on change', () => {
        // arrange
        const nextOs = OperatingSystem.macOS;
        const testContext = new ObservableApplicationContextFactory()
          .withAppContainingCollections(OperatingSystem.Windows, nextOs);
        const expectedCollection = testContext.app.getCollection(OperatingSystem.macOS);
        // act
        const sut = testContext
          .withInitialOs(OperatingSystem.Windows)
          .construct();
        const oldState = sut.state;
        sut.changeContext(nextOs);
        // assert
        expect(testContext.firedEvents.length).to.equal(1);
        expect(testContext.firedEvents[0].newState).to.equal(sut.state);
        expect(testContext.firedEvents[0].newState.collection).to.equal(expectedCollection);
        expect(testContext.firedEvents[0].oldState).to.equal(oldState);
      });
      it('is not fired when initial os is changed to same one', () => {
        // arrange
        const os = OperatingSystem.Windows;
        const testContext = new ObservableApplicationContextFactory()
          .withAppContainingCollections(os);
        // act
        const sut = testContext
          .withInitialOs(os)
          .construct();
        const initialState = sut.state;
        initialState.filter.applyFilter('dirty-state');
        sut.changeContext(os);
        // assert
        expect(testContext.firedEvents.length).to.equal(0);
      });
      it('new event is fired for each change', () => {
        // arrange
        const os = OperatingSystem.Windows;
        const changedOs = OperatingSystem.macOS;
        const testContext = new ObservableApplicationContextFactory()
          .withAppContainingCollections(os, changedOs);
        // act
        const sut = testContext
          .withInitialOs(os)
          .construct();
        sut.changeContext(changedOs);
        sut.changeContext(os);
        sut.changeContext(changedOs);
        // assert
        const duplicates = getDuplicates(testContext.firedEvents);
        expect(duplicates.length).to.be.equal(0);
      });
    });
  });
  describe('ctor', () => {
    describe('collection', () => {
      it('returns right collection for expected OS', () => {
        // arrange
        const os = OperatingSystem.Windows;
        const testContext = new ObservableApplicationContextFactory()
          .withAppContainingCollections(os);
        const expected = testContext.app.getCollection(os);
        // act
        const sut = testContext
          .withInitialOs(os)
          .construct();
        // assert
        const actual = sut.state.collection;
        expect(actual).to.deep.equal(expected);
      });
    });
    describe('state', () => {
      it('initially returns an empty state', () => {
        // arrange
        const sut = new ObservableApplicationContextFactory()
          .construct();
        // act
        const actual = sut.state;
        // assert
        expectEmptyState(actual);
      });
    });
    describe('os', () => {
      it('set as initial OS', () => {
        // arrange
        const expected = OperatingSystem.Windows;
        const testContext = new ObservableApplicationContextFactory()
          .withAppContainingCollections(OperatingSystem.macOS, expected);
        // act
        const sut = testContext
          .withInitialOs(expected)
          .construct();
        // assert
        const actual = sut.state.os;
        expect(actual).to.deep.equal(expected);
      });
      it('rethrows when application cannot provide collection for supported OS', () => {
        // arrange
        const expectedError = 'expected error from application';
        const knownOperatingSystem = OperatingSystem.macOS;
        const context = new ObservableApplicationContextFactory()
          .withAppContainingCollections(knownOperatingSystem)
          .withInitialOs(knownOperatingSystem);
        const { app } = context;
        app.getCollection = () => { throw new Error(expectedError); };
        // act
        const act = () => context.construct();
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws when OS is not supported', () => {
        // arrange
        const unknownInitialOperatingSystem = OperatingSystem.BlackBerry10;
        const expectedError = `Operating system "${OperatingSystem[unknownInitialOperatingSystem]}" is not supported.`;
        // act
        const act = () => new ObservableApplicationContextFactory()
          .withAppContainingCollections(OperatingSystem.Android /* unrelated */)
          .withInitialOs(unknownInitialOperatingSystem)
          .construct();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    describe('app', () => {
      it('sets app as expected', () => {
        // arrange
        const os = OperatingSystem.Windows;
        const expected = new ApplicationStub().withCollection(
          new CategoryCollectionStub().withOs(os),
        );
        // act
        const sut = new ObservableApplicationContextFactory()
          .withApp(expected)
          .withInitialOs(os)
          .construct();
        // assert
        expect(expected).to.equal(sut.app);
      });
    });
  });
});

class ObservableApplicationContextFactory {
  private static DefaultOs = OperatingSystem.Windows;

  public app: Application = new ApplicationStub()
    .withCollection(
      new CategoryCollectionStub()
        .withOs(ObservableApplicationContextFactory.DefaultOs),
    );

  public firedEvents = new Array<IApplicationContextChangedEvent>();

  private initialOs = ObservableApplicationContextFactory.DefaultOs;

  public withAppContainingCollections(
    ...oses: OperatingSystem[]
  ): this {
    const collectionValues = oses.map((os) => new CategoryCollectionStub().withOs(os));
    const app = new ApplicationStub().withCollections(...collectionValues);
    return this.withApp(app);
  }

  public withApp(app: Application): this {
    this.app = app;
    return this;
  }

  public withInitialOs(initialOs: OperatingSystem): this {
    this.initialOs = initialOs;
    return this;
  }

  public construct(): IApplicationContext {
    const sut = new ApplicationContext(this.app, this.initialOs);
    sut.contextChanged.on((newContext) => this.firedEvents.push(newContext));
    return sut;
  }
}

function getDuplicates<T>(list: readonly T[]): T[] {
  return list.filter((item, index) => list.indexOf(item) !== index);
}

function expectEmptyState(state: ICategoryCollectionState) {
  expect(!state.code.current);
  expect(!state.filter.currentFilter);
  expect(!state.selection);
}
