import { GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
import { AwsServiceOperation, ServiceOperationConfig } from '../AwsServiceOperation';
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
} as Record<string, ServiceOperationConfig>;

describe('AwsJsonParserOperation', () => {
  const AWSMock: any = {
    S3: class S3 {
      CreateBucket(_args: any, _cb: any) {}
    },
  };

  const oper = new AwsServiceOperation({
    prefix: 'AWS',
    serviceId: 'S3',
    name: 'CreateBucket',
    config: operations.CreateBucket,
    awsSDK: AWSMock,
    shapes: {} as any,
  });

  it('getTypeName()', () => {
    expect(oper.getTypeName()).toBe('AWSS3CreateBucket');
  });

  it('getType()', () => {
    const tc = oper.getType();
    expect(tc).toBeInstanceOf(GraphQLObjectType);
  });

  it('getArgs()', () => {
    const args: any = oper.getArgs();
    expect(args.input).toBeDefined();
    // input arg has required fields, so it wrapped by NonNullComposer
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
        CreateBucket(args: any, cb: any) {
          cb(undefined, { payload: args });
        }
      };
      const res = await resolve({}, { input: { arg: 123 } }, {}, {} as any);
      expect(res).toEqual({ payload: { arg: 123 } });
    });

    it('rejects', async () => {
      AWSMock.S3 = class S3WithError {
        CreateBucket(_args: any, cb: any) {
          cb('err');
        }
      };

      expect.assertions(1);
      try {
        await resolve({}, {}, {} as any, {} as any);
      } catch (e) {
        expect(e).toBe('err');
      }
    });
  });

  it('getFieldConfig()', () => {
    const fc: any = oper.getFieldConfig();
    expect(fc.type).toBeInstanceOf(GraphQLObjectType);
    expect(fc.args.config.type).toBe(AwsConfigITC.getType());
    expect((fc.resolve as any).call).toBeDefined();
  });
});
