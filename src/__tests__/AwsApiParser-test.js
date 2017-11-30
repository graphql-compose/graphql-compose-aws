/* @flow */

import awsSDK from 'aws-sdk';
import AwsApiParser from '../AwsApiParser';
import AwsService from '../AwsService';

describe('AwsApiParser', () => {
  const aws = new AwsApiParser({
    awsSDK,
  });

  it('getServicesNames()', () => {
    const names = aws.getServicesNames();
    expect(names).toContain('s3');
    expect(names).toContain('ec2');
    expect(names).toContain('route53');
    expect(names).toContain('sqs');
  });

  it('getServiceConfig()', () => {
    const cfg = aws.getServiceConfig('s3');
    expect(Object.keys(cfg)).toEqual([
      'version',
      'metadata',
      'operations',
      'shapes',
      'paginators',
      'waiters',
    ]);
  });

  it('getService()', () => {
    const service = aws.getService('s3');
    expect(service).toBeInstanceOf(AwsService);
  });

  it('getType()', () => {
    const type = aws.getType();
    expect(type.name).toBe('Aws');
  });
});

// export default class Aws {
//   constructor(opts: AwsOpts) {
//   getServicesNames(): string[] {
//   getServiceConfig(name: string): ServiceConfig {
//   getService(name: string): AwsService {
//   getTypeComposer(): TypeComposer {
//   getType(): GraphQLObjectType {
// }
