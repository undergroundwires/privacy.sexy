import { shallowMount, type ComponentMountingOptions } from '@vue/test-utils';
import { defineComponent } from 'vue';

type MountOptions = ComponentMountingOptions<unknown>;

/**
 * A test helper utility that provides a component `setup()` context.
 * This function allows running code that depends on Vue lifecycle hooks,
 * such as `onMounted`, within a component's `setup` function.
 */
export function executeInComponentSetupContext(options: {
  readonly setupCallback: () => void;
  readonly disableAutoUnmount?: boolean;
  readonly mountOptions?: MountOptions,
}): ReturnType<typeof shallowMount> {
  const componentWrapper = shallowMount(defineComponent({
    setup() {
      options.setupCallback();
    },
    // Component requires a template or render function
    template: '<div>Test Component: setup context</div>',
  }), options.mountOptions);
  if (!options.disableAutoUnmount) {
    componentWrapper.unmount(); // Ensure cleanup of callback tasks
  }
  return componentWrapper;
}
