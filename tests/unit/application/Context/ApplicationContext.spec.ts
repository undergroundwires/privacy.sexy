import 'mocha';
import { expect } from 'chai';
import { ApplicationContext } from '@/application/Context/ApplicationContext';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IApplicationContext, IApplicationContextChangedEvent } from '@/application/Context/IApplicationContext';
import { IApplication } from '@/domain/IApplication';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

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
        sut.state.filter.setFilter('filtered');
        sut.changeContext(OperatingSystem.macOS);
        // assert
        expectEmptyState(sut.state);
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
      firstState.filter.setFilter(expectedFilter);
      sut.changeContext(os);
      sut.changeContext(changedOs);
      sut.state.filter.setFilter('second-state');
      sut.changeContext(os);
      // assert
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
        initialState.filter.setFilter('dirty-state');
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
    describe('throws with invalid os', () => {
      new EnumRangeTestRunner((os: OperatingSystem) => {
        // arrange
        const sut = new ObservableApplicationContextFactory()
          .construct();
        // act
        sut.changeContext(os);
      })
      // assert
        .testOutOfRangeThrows()
        .testAbsentValueThrows()
        .testInvalidValueThrows(OperatingSystem.Android, 'os "Android" is not defined in application');
    });
  });
  describe('ctor', () => {
    describe('app', () => {
      describe('throw when app is missing', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing app';
          const app = absentValue;
          const os = OperatingSystem.Windows;
          // act
          const act = () => new ApplicationContext(app, os);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
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
      describe('throws when OS is invalid', () => {
        // act
        const act = (os: OperatingSystem) => new ObservableApplicationContextFactory()
          .withInitialOs(os)
          .construct();
        // assert
        new EnumRangeTestRunner(act)
          .testOutOfRangeThrows()
          .testAbsentValueThrows()
          .testInvalidValueThrows(OperatingSystem.Android, 'os "Android" is not defined in application');
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

  public app: IApplication;

  public firedEvents = new Array<IApplicationContextChangedEvent>();

  private initialOs = ObservableApplicationContextFactory.DefaultOs;

  constructor() {
    this.withAppContainingCollections(ObservableApplicationContextFactory.DefaultOs);
  }

  public withAppContainingCollections(
    ...oses: OperatingSystem[]
  ): ObservableApplicationContextFactory {
    const collectionValues = oses.map((os) => new CategoryCollectionStub().withOs(os));
    const app = new ApplicationStub().withCollections(...collectionValues);
    return this.withApp(app);
  }

  public withApp(app: IApplication): ObservableApplicationContextFactory {
    this.app = app;
    return this;
  }

  public withInitialOs(initialOs: OperatingSystem) {
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
