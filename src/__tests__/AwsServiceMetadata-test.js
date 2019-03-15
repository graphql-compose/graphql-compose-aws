/* @flow */

import { ObjectTypeComposer } from 'graphql-compose';
import { AwsServiceMetadata } from '../AwsServiceMetadata';
import s3Cfg from '../__mocks__/s3-2006-03-01.json';

const meta = new AwsServiceMetadata(s3Cfg.metadata);

describe('AwsServiceMetadata', () => {
  it('getPrefix()', () => {
    expect(meta.getPrefix()).toBe('AwsS3');
  });

  it('getTypeComposer()', () => {
    const tc = meta.getTypeComposer();
    expect(tc).toBeInstanceOf(ObjectTypeComposer);
    expect(tc.getTypeName()).toBe('AwsS3Metadata');
    expect(tc.getFieldNames()).toMatchSnapshot();
  });

  it('getFieldConfig()', () => {
    const fc: any = meta.getFieldConfig();
    expect(fc).toMatchSnapshot();
    expect(fc.resolve()).toMatchSnapshot();
  });
});
