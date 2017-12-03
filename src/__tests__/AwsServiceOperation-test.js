/* @flow */
/* eslint-disable class-methods-use-this */

import {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  isOutputType,
} from 'graphql-compose/lib/graphql';
import AwsServiceOperation from '../AwsServiceOperation';
import AwsConfigITC from '../types/AwsConfigITC';

const operations = {
  CreateBucket: {
    http: {
      method: 'PUT',
      requestUri: '/{Bucket}',
    },
    input: {
      type: 'structure',
      required: ['Bucket'],
      members: {
        ACL: {
          location: 'header',
          locationName: 'x-amz-acl',
        },
        Bucket: {
          location: 'uri',
          locationName: 'Bucket',
        },
        CreateBucketConfiguration: {
          locationName: 'CreateBucketConfiguration',
          xmlNamespace: {
            uri: 'http://s3.amazonaws.com/doc/2006-03-01/',
          },
          type: 'structure',
          members: {
            LocationConstraint: {},
          },
        },
        GrantFullControl: {
          location: 'header',
          locationName: 'x-amz-grant-full-control',
        },
        GrantRead: {
          location: 'header',
          locationName: 'x-amz-grant-read',
        },
        GrantReadACP: {
          location: 'header',
          locationName: 'x-amz-grant-read-acp',
        },
        GrantWrite: {
          location: 'header',
          locationName: 'x-amz-grant-write',
        },
        GrantWriteACP: {
          location: 'header',
          locationName: 'x-amz-grant-write-acp',
        },
      },
      payload: 'CreateBucketConfiguration',
    },
    output: {
      type: 'structure',
      members: {
        Location: {
          location: 'header',
          locationName: 'Location',
        },
      },
    },
    alias: 'PutBucket',
  },
};

describe('AwsJsonParserOperation', () => {
  const AWSMock: any = {
    S3: class S3 {
      CreateBucket(args, cb) {} // eslint-disable-line
    },
  };

  const oper = new AwsServiceOperation({
    prefix: 'AWS',
    serviceId: 'S3',
    name: 'CreateBucket',
    config: operations.CreateBucket,
    awsSDK: AWSMock,
    shapes: ({}: any),
  });

  it('getTypeName()', () => {
    expect(oper.getTypeName()).toBe('AWSS3CreateBucket');
  });

  it('getType()', () => {
    const tc = oper.getType();
    expect(isOutputType(tc)).toBeTruthy();
  });

  it('getArgs()', () => {
    const args: any = oper.getArgs();
    expect(args.input).toBeDefined();
    // input arg has required fields, so it wrapped by GraphQLNonNull
    expect(args.input.type).toBeInstanceOf(GraphQLNonNull);
    expect(args.input.type.ofType).toBeInstanceOf(GraphQLInputObjectType);
    expect(args.input.type.ofType.name).toBe('AWSS3CreateBucketInput');
  });

  describe('getResolve()', () => {
    const resolve = oper.getResolve();

    it('to be function', () => {
      expect(resolve.call).toBeDefined();
    });

    it('resolves', async () => {
      AWSMock.S3 = class S3WithPayload {
        CreateBucket(args, cb) {
          cb(undefined, { payload: args });
        }
      };
      const res = await resolve({}, { input: { arg: 123 } }, ({}: any), ({}: any));
      expect(res).toEqual({ payload: { arg: 123 } });
    });

    it('rejects', async () => {
      AWSMock.S3 = class S3WithError {
        CreateBucket(args, cb) {
          cb('err');
        }
      };

      expect.assertions(1);
      try {
        await resolve({}, {}, ({}: any), ({}: any));
      } catch (e) {
        expect(e).toBe('err');
      }
    });
  });

  it('getFieldConfig()', () => {
    const fc: any = oper.getFieldConfig();
    expect(fc.type).toBeInstanceOf(GraphQLObjectType);
    expect(fc.args.config.type).toBe(AwsConfigITC.getType());
    expect((fc.resolve: any).call).toBeDefined();
  });
});
