import {
  describe, it, expect,
} from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { IconName } from '@/presentation/components/Shared/Icon/IconName';
import { UseSvgLoaderStub } from '@tests/unit/shared/Stubs/UseSvgLoaderStub';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

describe('AppIcon.vue', () => {
  it('renders the correct SVG content based on the icon prop', async () => {
    // arrange
    const expectedIconName: IconName = 'magnifying-glass';
    const expectedIconContent = '<svg id="expected-svg" />';
    const svgLoaderStub = new UseSvgLoaderStub();
    svgLoaderStub.withSvgIcon(expectedIconName, expectedIconContent);

    // act
    const wrapper = mountComponent({
      iconPropValue: expectedIconName,
      loader: svgLoaderStub,
    });
    await nextTick();

    // assert
    const actualSvg = wrapper.html();
    expectSvg(actualSvg, expectedIconContent);
  });
  it('updates the SVG content when the icon prop changes', async () => {
    // arrange
    const initialIconName: IconName = 'magnifying-glass';
    const updatedIconName: IconName = 'copy';
    const updatedIconContent = '<svg id="updated-svg" />';
    const svgLoaderStub = new UseSvgLoaderStub();
    svgLoaderStub.withSvgIcon(initialIconName, '<svg id="initial-svg" />');
    svgLoaderStub.withSvgIcon(updatedIconName, updatedIconContent);

    // act
    const wrapper = mountComponent({
      iconPropValue: initialIconName,
      loader: svgLoaderStub,
    });
    await wrapper.setProps({ icon: updatedIconName });
    await nextTick();

    // assert
    const actualSvg = wrapper.html();
    expectSvg(actualSvg, updatedIconContent);
  });
  it('emits `click` event when clicked', async () => {
    // arrange
    const wrapper = mountComponent();

    // act
    await wrapper.trigger('click');
    await nextTick();

    // assert
    expect(wrapper.emitted().click).to.have.lengthOf(1);
  });
});

function mountComponent(options?: {
  readonly iconPropValue?: IconName,
  readonly loader?: UseSvgLoaderStub,
}) {
  const iconName = options?.iconPropValue ?? 'globe';
  const loaderStub = options?.loader ?? new UseSvgLoaderStub().withSvgIcon(iconName, '<svg />');
  return shallowMount(AppIcon, {
    props: {
      icon: iconName,
    },
    global: {
      provide: {
        useSvgLoaderHook: loaderStub.get(),
      },
    },
  });
}

function expectSvg(actualSvg: string, expectedSvg: string): ReturnType<typeof expect> {
  const normalizedExpectedSvg = extractAndNormalizeSvg(expectedSvg);
  const normalizedActualSvg = extractAndNormalizeSvg(actualSvg);
  return expect(normalizedActualSvg).to.equal(normalizedExpectedSvg, formatAssertionMessage([
    'Expected:\n', normalizedExpectedSvg,
    'Actual:\n', normalizedActualSvg,
  ]));
}

function extractAndNormalizeSvg(svgString: string): string {
  const svg = extractSvg(svgString);
  return normalizeSvg(svg);
}

function extractSvg(svgString: string): string {
  const svgMatches = svgString.match(/<svg[\s\S]*?(<\/svg>|\/>)/g);
  if (!svgMatches || svgMatches.length === 0) {
    throw new Error(`No SVG found in: ${svgString}`);
  }
  if (svgMatches.length > 1) {
    throw new Error(`Multiple SVGs found in: ${svgString}`);
  }
  const svgContent = svgMatches[0];
  return svgContent;
}

function normalizeSvg(svgString: string): string {
  return svgString
    .replace(/\n/g, '') // Remove newlines
    .replace(/\s+/g, ' ') // Replace all whitespace sequences with a single space
    .replace(/> </g, '><') // Remove spaces between tags
    .replace(/ <\//g, '</') // Remove spaces before closing tags
    .replace(/\s+\/>/g, '/>') // Remove spaces before self-closing tag end
    .replace(/<(\w+)([^>]*)><\/\1>/g, '<$1$2/>') // Convert to self-closing SVG tags
    .trim(); // Remove leading and trailing spaces
}
