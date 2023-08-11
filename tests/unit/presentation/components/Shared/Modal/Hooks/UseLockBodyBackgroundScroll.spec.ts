import 'mocha';
import { shallowMount } from '@vue/test-utils';
import { expect } from 'chai';
import { ref, nextTick, defineComponent } from 'vue';
import { useLockBodyBackgroundScroll } from '@/presentation/components/Shared/Modal/Hooks/UseLockBodyBackgroundScroll';

describe('useLockBodyBackgroundScroll', () => {
  afterEach(() => {
    document.body.style.overflow = '';
    document.body.style.width = '';
  });

  describe('initialization', () => {
    it('blocks scroll if initially active', async () => {
      // arrange
      createComponent(true);

      // act
      await nextTick();

      // assert
      expect(document.body.style.overflow).to.equal('hidden');
      expect(document.body.style.width).to.equal('100vw');
    });

    it('preserves initial styles if inactive', async () => {
      // arrange
      const originalOverflow = 'scroll';
      const originalWidth = '90vw';
      document.body.style.overflow = originalOverflow;
      document.body.style.width = originalWidth;

      // act
      createComponent(false);
      await nextTick();

      // assert
      expect(document.body.style.overflow).to.equal(originalOverflow);
      expect(document.body.style.width).to.equal(originalWidth);
    });
  });

  describe('toggling', () => {
    it('blocks scroll when activated', async () => {
      // arrange
      const { isActive } = createComponent(false);

      // act
      isActive.value = true;
      await nextTick();

      // assert
      expect(document.body.style.overflow).to.equal('hidden');
      expect(document.body.style.width).to.equal('100vw');
    });

    it('unblocks scroll when deactivated', async () => {
      // arrange
      const { isActive } = createComponent(true);

      // act
      isActive.value = false;
      await nextTick();

      // assert
      expect(document.body.style.overflow).not.to.equal('hidden');
      expect(document.body.style.width).not.to.equal('100vw');
    });
  });

  describe('unmounting', () => {
    it('restores original styles on unmount', async () => {
      // arrange
      const originalOverflow = 'scroll';
      const originalWidth = '90vw';
      document.body.style.overflow = originalOverflow;
      document.body.style.width = originalWidth;

      // act
      const { component } = createComponent(true);
      component.destroy();
      await nextTick();

      // assert
      expect(document.body.style.overflow).to.equal(originalOverflow);
      expect(document.body.style.width).to.equal(originalWidth);
    });

    it('resets styles on unmount', async () => {
      // arrange
      const { component } = createComponent(true);

      // act
      component.destroy();
      await nextTick();

      // assert
      expect(document.body.style.overflow).to.equal('');
      expect(document.body.style.width).to.equal('');
    });
  });
});

function createComponent(initialIsActiveValue: boolean) {
  const isActive = ref(initialIsActiveValue);
  const component = shallowMount(defineComponent({
    setup() {
      useLockBodyBackgroundScroll(isActive);
    },
    template: '<div></div>',
  }));
  return { component, isActive };
}
