/* @flow */

import { schemaComposer, ObjectTypeComposer, upperFirst } from 'graphql-compose';
import type { GraphQLObjectType, GraphQLFieldConfig } from 'graphql-compose/lib/graphql';
import { AwsServiceMetadata, type ServiceMetadataConfig } from './AwsServiceMetadata';
import { AwsServiceOperation, type ServiceOperationConfig } from './AwsServiceOperation';
import { AwsShapes, type ShapesMap } from './AwsShapes';
import type { AwsSDK } from './AwsApiParser';
import AwsConfigITC from './types/AwsConfigITC';

export type ServiceConfig = {
  version: string,
  metadata: ServiceMetadataConfig,
  operations: {
    [name: string]: ServiceOperationConfig,
  },
  shapes: ShapesMap,
  paginators: any,
  waiters: any,
};

type ServiceOpts = {|
  serviceId: string,
  prefix: string,
  config: ServiceConfig,
  awsSDK: AwsSDK,
|};

export class AwsService<TContext> {
  prefix: string;
  serviceId: string;
  awsSDK: AwsSDK;
  tc: ?ObjectTypeComposer<any, TContext>;
  config: ServiceConfig;
  metadata: AwsServiceMetadata<TContext>;
  shapes: AwsShapes<TContext>;

  constructor(opts: ServiceOpts) {
    this.prefix = opts.prefix;
    this.serviceId = opts.serviceId;
    this.awsSDK = opts.awsSDK;
    this.config = opts.config;

    this.metadata = new AwsServiceMetadata(this.config.metadata);
    this.shapes = new AwsShapes(this.config.shapes, this.getTypeName());
  }

  getTypeName(): string {
    return `${this.prefix}${upperFirst(this.serviceId)}`;
  }

  static lowerFirst(name: string) {
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  getOperationNames(): string[] {
    return Object.keys(this.config.operations);
  }

  getOperation(name: string): AwsServiceOperation<TContext> {
    const operConfig = this.config.operations[name];
    if (!operConfig) {
      throw new Error(`Operation with name ${name} does not exist.`);
    }
    return new AwsServiceOperation({
      serviceId: this.serviceId,
      name: this.constructor.lowerFirst(name),
      prefix: this.prefix,
      config: operConfig,
      shapes: this.shapes,
      awsSDK: this.awsSDK,
    });
  }

  getTypeComposer(): ObjectTypeComposer<any, TContext> {
    if (!this.tc) {
      const fields = this.getOperationNames().reduce((res, name) => {
        res[this.constructor.lowerFirst(name)] = this.getOperation(name).getFieldConfig();
        return res;
      }, {});

      this.tc = schemaComposer.createObjectTC({
        name: this.getTypeName(),
        fields,
        description: this.metadata.getDescription(),
      });
    }
    return this.tc;
  }

  getType(): GraphQLObjectType {
    return this.getTypeComposer().getType();
  }

  getFieldConfig(): GraphQLFieldConfig<any, any> {
    return {
      type: this.getType(),
      args: {
        config: {
          type: AwsConfigITC.getType(),
          description: 'Will override default configs for aws-sdk.',
        },
      },
      resolve: (source, args) => ({
        awsConfig: { ...(source && source.awsConfig), ...(args && args.config) },
      }),
    };
  }
}
