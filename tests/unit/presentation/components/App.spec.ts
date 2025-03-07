import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import App from '@/presentation/components/App.vue';
import { createEventSpies } from '@tests/shared/Spies/EventTargetSpy';

describe('App.vue', () => {
  it('should be successfully mounted', () => {
    // arrange
    const component = App;
    // act
    const act = () => shallowMount(component);
    // assert
    expect(act).to.not.throw();
  });
  it('dispatches app ready event on mount', () => {
    // arrange
    const expectedEventName = 'app-ready';
    const eventSource = document;
    const { isEventDispatched } = createEventSpies(eventSource, afterEach);
    const component = App;
    // act
    shallowMount(component);
    // assert
    expect(isEventDispatched(expectedEventName)).to.equal(true);
  });
});
