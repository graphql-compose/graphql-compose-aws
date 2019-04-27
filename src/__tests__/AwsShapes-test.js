/* @flow */

import { AwsShapes } from '../AwsShapes';

describe('AwsShapes', () => {
  const shapes = new AwsShapes(
    {
      S1: {},
      S2: { type: 'float' },
    },
    'Test'
  );

  it('getInputShape()', () => {
    expect(shapes.getInputShape('S1')).toBe('String');
  });

  it('getInputShape() from cache', () => {
    (shapes: any).shapesInput.cachedS1 = 'Cached';
    expect(shapes.getInputShape('cachedS1')).toBe('Cached');
  });

  it('getOutputShape()', () => {
    expect(shapes.getOutputShape('S2')).toBe('Float');
  });

  it('getOutputShape() from cache', () => {
    (shapes: any).shapesOutput.cachedS2 = 'Cached';
    expect(shapes.getOutputShape('cachedS2')).toBe('Cached');
  });
});
