import {
  describe, it, expect, beforeEach,
} from 'vitest';
import { ref } from 'vue';
import type { IconName } from '@/presentation/components/Shared/Icon/IconName';
import { type FileLoaders, clearIconCache, useSvgLoader } from '@/presentation/components/Shared/Icon/UseSvgLoader';
import { waitForValueChange } from '@tests/shared/Vue/WaitForValueChange';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { indentText } from '@/application/Common/Text/IndentText';

describe('useSvgLoader', () => {
  beforeEach(() => {
    clearIconCache();
  });
  describe('SVG loading', () => {
    it('renders initial SVG content based on icon name', async () => {
      // arrange
      const expectedIconName: IconName = 'magnifying-glass';
      const expectedIconContent = '<svg id="expected-content"/>';
      const { loaders, addIcon } = useSvgMock();
      addIcon(expectedIconName, expectedIconContent);

      // act
      const { svgContent } = useSvgLoader(() => expectedIconName, loaders);
      await waitForValueChange(svgContent);

      // assert
      expect(svgContent.value).to.equal(expectedIconContent);
    });
    it('updates SVG content when icon name changes', async () => {
      // arrange
      const initialIconName: IconName = 'magnifying-glass';
      const iconName = ref<IconName>(initialIconName);
      const initialIconContent = '<svg id="initial"/>';
      const updatedIconName: IconName = 'copy';
      const updatedIconContent = '<svg id="updated"/>';
      const { addIcon, loaders } = useSvgMock();
      addIcon(initialIconName, initialIconContent);
      addIcon(updatedIconName, updatedIconContent);

      // act
      const { svgContent } = useSvgLoader(() => iconName.value, loaders);
      await waitForValueChange(svgContent);
      iconName.value = updatedIconName;
      await waitForValueChange(svgContent);

      // assert
      expect(svgContent.value).to.equal(updatedIconContent);
    });
    it('lazy loads SVG icons and does not preload', async () => {
      // arrange
      const expectedIconName: IconName = 'magnifying-glass';
      const unexpectedIconName: IconName = 'copy';
      const { addIcon, getSvgFetchCount, loaders } = useSvgMock();
      addIcon(expectedIconName);
      addIcon(unexpectedIconName);

      // act
      const { svgContent } = useSvgLoader(() => expectedIconName, loaders);
      await waitForValueChange(svgContent);

      // assert
      expect(getSvgFetchCount(expectedIconName)).to.equal(1);
      expect(getSvgFetchCount(unexpectedIconName)).to.equal(0);
    });
    it('avoids loading same SVG content multiple times for concurrent calls', async () => {
      // arrange
      const expectedIconName: IconName = 'magnifying-glass';
      const { addIcon, getSvgFetchCount, loaders } = useSvgMock();
      addIcon(expectedIconName);

      // act
      const { svgContent: svgContent1 } = useSvgLoader(() => expectedIconName, loaders);
      const { svgContent: svgContent2 } = useSvgLoader(() => expectedIconName, loaders);
      await Promise.all([
        waitForValueChange(svgContent1),
        waitForValueChange(svgContent2),
      ]);

      // assert
      expect(getSvgFetchCount(expectedIconName)).to.equal(1);
    });
  });
  describe('SVG content manipulation', () => {
    it('sets path fill color to currentColor', async () => {
      // arrange
      const expectedIconName: IconName = 'magnifying-glass';
      const { addIcon, loaders } = useSvgMock();
      addIcon(expectedIconName, '<svg id="svg-with-paths"><path /><path /></svg>');

      // act
      const { svgContent } = useSvgLoader(() => expectedIconName, loaders);
      await waitForValueChange(svgContent);

      // assert
      const svgElement = new DOMParser().parseFromString(svgContent.value, 'image/svg+xml');
      const pathElements = Array.from(svgElement.querySelectorAll('path'));
      expect(pathElements).to.have.lengthOf(2, svgContent.value);
      const fillAttributeValues = pathElements.map((el: Element) => el.getAttribute('fill'));
      const expectedAttributeValue = 'currentColor';
      const unexpectedAttributeValues = fillAttributeValues
        .filter((v) => v !== expectedAttributeValue);
      expect(unexpectedAttributeValues).to.have.lengthOf(0, formatAssertionMessage([
        'Unexpected values:',
        ...unexpectedAttributeValues.map((value) => indentText(`- ${value}`)),
      ]));
    });
    it('removes comments from loaded SVG', async () => {
      // arrange
      const commentLine = '<!-- This is a comment -->';
      const expectedIconName: IconName = 'magnifying-glass';
      const { addIcon, loaders } = useSvgMock();
      addIcon(expectedIconName, `<svg>${commentLine}<path></path></svg>`);

      // act
      const { svgContent } = useSvgLoader(() => expectedIconName, loaders);
      await waitForValueChange(svgContent);

      // assert
      expect(svgContent.value).not.to.include(commentLine);
    });
  });
  describe('icon cache management', () => {
    it('reloads SVG content after clearing cache', async () => {
      // arrange
      const expectedIconName: IconName = 'magnifying-glass';
      const { addIcon, getSvgFetchCount, loaders } = useSvgMock();
      addIcon(expectedIconName);

      // act
      const { svgContent } = useSvgLoader(() => expectedIconName, loaders);
      await waitForValueChange(svgContent);
      expect(getSvgFetchCount(expectedIconName)).to.equal(1);
      clearIconCache();
      const { svgContent: newSvgContent } = useSvgLoader(() => expectedIconName, loaders);
      await waitForValueChange(newSvgContent);

      // assert
      expect(getSvgFetchCount(expectedIconName)).to.equal(2);
    });
  });
});

function useSvgMock() {
  const ICON_PATH_PREFIX = '/assets/icons/';
  function getPath(iconName: IconName) {
    return `${ICON_PATH_PREFIX}${iconName}.svg`;
  }
  const svgFetchCount = {} as Record<IconName, number>;
  const loaders = {} as FileLoaders;
  function addIcon(iconName: IconName, svgContent = '<svg id="stub" />') {
    const path = getPath(iconName);
    svgFetchCount[iconName] = 0;
    loaders[path] = () => {
      svgFetchCount[iconName] += 1;
      return Promise.resolve(svgContent);
    };
  }
  function getSvgFetchCount(iconName: IconName): number {
    return svgFetchCount[iconName];
  }
  return {
    loaders,
    getSvgFetchCount,
    getPath,
    addIcon,
  };
}
