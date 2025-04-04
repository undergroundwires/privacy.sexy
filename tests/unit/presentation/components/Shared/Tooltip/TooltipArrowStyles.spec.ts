import { describe, it, expect } from 'vitest';
import { getArrowStyles, type PlacementSide } from '@/presentation/components/Shared/Tooltip/TooltipArrowStyles';
import type { Coords, Placement } from '@floating-ui/vue';
import type { CSSProperties } from 'vue';

describe('TooltipArrowStyles', () => {
  describe('getArrowStyles', () => {
    describe('visibility', () => {
      it('hides arrow when coordinates are missing', () => {
        // arrange
        const context = new TestContext()
          .withArrowCoords(undefined);
        // act
        const result = context.get();
        // assert
        expect(result).toHaveProperty('display', 'none');
      });
      it('shows arrow when coordinates exist', () => {
        // arrange
        const context = new TestContext()
          .withArrowCoords({ y: 100 });
        // act
        const result = context.get();
        // assert
        expect(result).not.toHaveProperty('display');
      });
    });
    describe('styling', () => {
      it('applies width based on arrow size', () => {
        // arrange
        const arrowSize = 50;
        const expectedWidthValue = `${arrowSize * 2}px`;
        const context = new TestContext()
          .withArrowSizeInPx(arrowSize);
        // act
        const result = context.get();
        // assert
        expect(result).toHaveProperty('width', expectedWidthValue);
      });
      it('applies height based on arrow size', () => {
        // arrange
        const arrowSize = 30;
        const expectedWidthValue = `${arrowSize * 2}px`;
        const context = new TestContext()
          .withArrowSizeInPx(arrowSize);
        // act
        const result = context.get();
        // assert
        expect(result).toHaveProperty('height', expectedWidthValue);
      });
      it('rotates arrow to diamond shape', () => {
        // arrange
        const expectedRotateValue = '45deg';
        const context = new TestContext();
        // act
        const result = context.get();
        // assert
        expect(result).toHaveProperty('rotate', expectedRotateValue);
      });
    });
    describe('placement', () => {
      it('positions absolutely when coordinates exist', () => {
        // arrange
        const context = new TestContext()
          .withArrowCoords({ y: 100 });
        // act
        const result = context.get();
        // assert
        expect(result).toHaveProperty('position', 'absolute');
      });
      describe('alignment', () => {
        it('omits horizontal positioning without x coordinate', () => {
          // arrange
          const context = new TestContext()
            .withArrowCoords({ y: 100 });
          // act
          const result = context.get();
          // assert
          expect(result).not.toHaveProperty('left');
        });
        it('omits vertical positioning without y coordinate', () => {
          // arrange
          const context = new TestContext()
            .withArrowCoords({ x: 100 });
          // act
          const result = context.get();
          // assert
          expect(result).not.toHaveProperty('top');
        });
        it('aligns vertically with y coordinate', () => {
          // arrange
          const calculatedY = 200;
          const expectedProperty: keyof CSSProperties = 'top';
          const expectedValue = `${calculatedY}px`;
          const context = new TestContext()
            .withArrowCoords({ y: calculatedY });
          // act
          const result = context.get();
          // assert
          expect(result).toHaveProperty(expectedProperty, expectedValue);
        });
        it('aligns horizontally with x coordinate', () => {
          // arrange
          const calculatedX = 400;
          const expectedProperty: keyof CSSProperties = 'left';
          const expectedValue = `${calculatedX}px`;
          const context = new TestContext()
            .withArrowCoords({ x: calculatedX });
          // act
          const result = context.get();
          // assert
          expect(result).toHaveProperty(expectedProperty, expectedValue);
        });
      });
      describe('edge positioning', () => {
        const testScenarios: readonly {
          givenTooltipPlacement: Placement,
          givenArrowCoordinates: Partial<Coords>,
          expectedPositioning: PlacementSide,
        }[] = [
          {
            givenTooltipPlacement: 'top',
            givenArrowCoordinates: { x: 5 },
            expectedPositioning: 'bottom',
          },
          {
            givenTooltipPlacement: 'bottom',
            givenArrowCoordinates: { x: 5 },
            expectedPositioning: 'top',
          },
          {
            givenTooltipPlacement: 'right',
            givenArrowCoordinates: { y: 5 },
            expectedPositioning: 'left',
          },
          {
            givenTooltipPlacement: 'right',
            givenArrowCoordinates: { y: 5 },
            expectedPositioning: 'left',
          },
          {
            givenTooltipPlacement: 'left',
            givenArrowCoordinates: { x: 5 },
            expectedPositioning: 'right',
          },
          {
            givenTooltipPlacement: 'top-start',
            givenArrowCoordinates: { x: 5 },
            expectedPositioning: 'bottom',
          },
          {
            givenTooltipPlacement: 'bottom-end',
            givenArrowCoordinates: { x: 5 },
            expectedPositioning: 'top',
          },
          {
            givenTooltipPlacement: 'left-end',
            givenArrowCoordinates: { x: 5 },
            expectedPositioning: 'right',
          },
          {
            givenTooltipPlacement: 'right-start',
            givenArrowCoordinates: { y: 5 },
            expectedPositioning: 'left',
          },
        ];
        testScenarios.forEach((testScenario) => {
          it(`positions arrow on ${testScenario.expectedPositioning} for ${testScenario.givenTooltipPlacement} tooltip`, () => {
            // arrange
            const arrowSize = 20;
            const expectedValue = `-${arrowSize}px`;
            const expectedProperty = testScenario.expectedPositioning;
            const context = new TestContext()
              .withArrowSizeInPx(arrowSize)
              .withArrowCoords(testScenario.givenArrowCoordinates)
              .withTooltipPlacement(testScenario.givenTooltipPlacement);
            // act
            const result = context.get();
            // assert
            expect(result).toHaveProperty(expectedProperty, expectedValue);
          });
        });
      });
    });
  });
});

class TestContext {
  private calculatedArrowCoords?: Partial<Coords> = {
    x: 5,
  };

  private tooltipPlacement: Placement = 'top';

  private arrowSizeInPx: number = 4;

  public withArrowSizeInPx(arrowSizeInPx: number): this {
    this.arrowSizeInPx = arrowSizeInPx;
    return this;
  }

  public withTooltipPlacement(tooltipPlacement: Placement): this {
    this.tooltipPlacement = tooltipPlacement;
    return this;
  }

  public withArrowCoords(calculatedArrowCoords?: Partial<Coords>): this {
    this.calculatedArrowCoords = calculatedArrowCoords;
    return this;
  }

  public get(): ReturnType<typeof getArrowStyles> {
    return getArrowStyles({
      arrowSizeInPx: this.arrowSizeInPx,
      calculatedArrowCoords: this.calculatedArrowCoords,
      tooltipPlacement: this.tooltipPlacement,
    });
  }
}
