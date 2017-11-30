/* @flow */

import AwsService from '../AwsService';
import AwsServiceOperation from '../AwsServiceOperation';
import s3Cfg from '../__mocks__/s3-2006-03-01.json';

describe('AwsService', () => {
  const s3 = new AwsService({
    serviceId: 'S3',
    prefix: 'Aws',
    config: s3Cfg,
    awsSDK: ({}: any),
  });

  it('getTypeName()', () => {
    expect(s3.getTypeName()).toBe('AwsS3');
  });

  it('getOperationNames()', () => {
    expect(s3.getOperationNames()).toMatchSnapshot();
  });

  it('getOperation()', () => {
    const oper = s3.getOperation('CreateBucket');
    expect(oper).toBeInstanceOf(AwsServiceOperation);
    expect(oper.getTypeName()).toBe('AwsS3CreateBucket');
    expect(oper.getArgs().input).toBeDefined();
  });

  it('getTypeComposer()', () => {
    const tc = s3.getTypeComposer();
    expect(tc.getTypeName()).toBe('AwsS3');
    expect(tc.getFieldNames()).toContain('CreateBucket');
  });

  it('getType()', () => {
    const type = s3.getType();
    expect(type.name).toBe('AwsS3');
  });
});
