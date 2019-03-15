/* @flow */

import awsSDK from 'aws-sdk';
import { AwsApiParser } from '../AwsApiParser';
import { AwsService } from '../AwsService';
import AwsConfigITC from '../types/AwsConfigITC';

describe('AwsApiParser', () => {
  const aws = new AwsApiParser({
    awsSDK,
  });

  it('getServicesNames()', () => {
    const names = aws.getServicesNames();
    expect(names).toContain('S3');
    expect(names).toContain('EC2');
    expect(names).toContain('Route53');
    expect(names).toContain('SQS');
  });

  it('getServiceIdentifier()', () => {
    expect(aws.getServiceIdentifier('S3')).toBe('s3');
    // also should work if provided serviceIdentifier
    expect(aws.getServiceIdentifier('s3')).toBe('s3');
  });

  it('getServiceConfig()', () => {
    const cfg = aws.getServiceConfig('S3');
    expect(Object.keys(cfg)).toEqual([
      'version',
      'metadata',
      'operations',
      'shapes',
      'paginators',
      'waiters',
    ]);

    // get config by serviceIdentifier
    const cfg2 = aws.getServiceConfig('s3');
    expect(Object.keys(cfg2)).toEqual([
      'version',
      'metadata',
      'operations',
      'shapes',
      'paginators',
      'waiters',
    ]);
  });

  it('getService()', () => {
    const service = aws.getService('S3');
    expect(service).toBeInstanceOf(AwsService);

    // get service by serviceIdentifier
    const service2 = aws.getService('s3');
    expect(service2).toBeInstanceOf(AwsService);
  });

  it('getType()', () => {
    const type = aws.getType();
    expect(type.name).toBe('Aws');
  });

  it('getFieldConfig()', () => {
    const fc: any = aws.getFieldConfig();
    expect(fc.type).toBe(aws.getType());
    expect(fc.args.config.type).toBe(AwsConfigITC.getType());
    expect(fc.resolve()).toEqual({ awsConfig: {} });
  });
});
