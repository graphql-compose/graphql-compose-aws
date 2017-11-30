/* @flow */

import { upperFirst, GraphQLJSON } from 'graphql-compose';
import type {
  GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldResolver,
  GraphQLOutputType,
} from 'graphql-compose/lib/graphql';
import AwsParam, { type ParamStructure } from './AwsParam';
import type AwsShapes from './AwsShapes';
import type { AwsSDK } from './AwsApiParser';

export type ServiceOperationConfig = {
  http?: {
    method: string,
    requestUri: string,
  },
  input?: ParamStructure,
  output?: ParamStructure,
  alias?: string,
};

type OperationOpts = {|
  serviceId: string,
  name: string,
  prefix: string,
  config: ServiceOperationConfig,
  shapes: AwsShapes,
  awsSDK: AwsSDK,
|};

export default class AwsServiceOperation {
  prefix: string;
  name: string;
  serviceId: string;
  awsSDK: AwsSDK;
  args: GraphQLFieldConfigArgumentMap;
  config: ServiceOperationConfig;
  shapes: AwsShapes;

  constructor(opts: OperationOpts) {
    this.prefix = opts.prefix;
    this.name = opts.name;
    this.serviceId = opts.serviceId;
    this.awsSDK = opts.awsSDK;
    this.config = opts.config;
    this.shapes = opts.shapes;
  }

  getTypeName(): string {
    return `${this.prefix}${upperFirst(this.serviceId)}${upperFirst(this.name)}`;
  }

  getType(): GraphQLOutputType {
    if (this.config.output && this.config.output.type === 'structure') {
      const tc = AwsParam.convertOutputStructure(
        this.config.output,
        `${this.getTypeName()}Output`,
        this.shapes
      );

      // If bugous structure without fields, then return JSON
      if (Object.keys(tc.getFields()).length === 0) {
        return GraphQLJSON;
      }

      return tc.getType();
    }

    return GraphQLJSON;
  }

  getArgs(): GraphQLFieldConfigArgumentMap {
    if (!this.args) {
      if (!this.config.input) {
        this.args = {};
      } else {
        const itc = AwsParam.convertInputStructure(
          this.config.input,
          this.getTypeName(),
          this.shapes
        );

        let type;
        // If bugous structure without fields, then return JSON
        if (Object.keys(itc.getFields()).length === 0) {
          type = GraphQLJSON;
        } else {
          const hasRequiredFields = itc.getFieldNames().some(f => itc.isRequired(f));
          type = hasRequiredFields ? (itc.getTypeAsRequired(): any) : itc.getType();
        }

        this.args = {
          input: {
            type,
          },
        };
      }
    }

    return this.args;
  }

  getResolve(): GraphQLFieldResolver<any, any> {
    return ((source: any, args: { [argument: string]: any }) => {
      return new Promise((resolve, reject) => {
        this.awsSDK[this.serviceId][this.name](args, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
      });
    }: any);
  }

  getFieldConfig(): GraphQLFieldConfig<any, any> {
    return {
      type: this.getType(),
      args: this.getArgs(),
      resolve: this.getResolve(),
      description: `${this.serviceId}.${this.name}`,
    };
  }
}
