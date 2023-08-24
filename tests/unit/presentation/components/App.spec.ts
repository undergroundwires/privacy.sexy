import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import App from '@/presentation/components/App.vue';

describe('App.vue', () => {
  it('should be successfully mounted', () => {
    // arrange
    const component = App;
    // act
    const act = () => shallowMount(component);
    // assert
    expect(act).to.not.throw();
  });
});
