/* @flow */

import { schemaComposer, ObjectTypeComposer } from 'graphql-compose';
import type { GraphQLObjectType, GraphQLFieldConfig } from 'graphql-compose/lib/graphql';
import { AwsService, type ServiceConfig } from './AwsService';
import AwsConfigITC from './types/AwsConfigITC';

export type AwsSDK = any;

type AwsOpts = {|
  name?: string,
  awsSDK?: AwsSDK,
|};

export class AwsApiParser<TContext = any> {
  name: string;
  awsSDK: AwsSDK;
  tc: ObjectTypeComposer<any, TContext>;
  _serviceMap: { [serviceIdentifier: string]: string };

  constructor(opts: AwsOpts) {
    this.name = opts.name || 'Aws';
    this.awsSDK = opts.awsSDK;

    this._serviceMap = {};
    this.getServicesNames();
  }

  getServicesNames(): string[] {
    const serviceNames = Object.keys(this.awsSDK).reduce((res, name) => {
      if (this.awsSDK[name].serviceIdentifier) {
        this._serviceMap[this.awsSDK[name].serviceIdentifier] = name;
        res.push(name);
      }
      return res;
    }, []);
    serviceNames.sort();
    return serviceNames;
  }

  getServiceIdentifier(name: string): string {
    if (this._serviceMap[name]) return name;

    if (!this.awsSDK[name]) {
      throw new Error(`Service with name '${name}' does not exist. Run AwsApiParser.`);
    }
    return this.awsSDK[name].serviceIdentifier;
  }

  getServiceConfig(name: string): ServiceConfig {
    const cfg = this.awsSDK.apiLoader.services[this.getServiceIdentifier(name)];
    if (!cfg) {
      throw new Error(`Service with name '${name}' does not exist.`);
    }
    const versions = Object.keys(cfg);
    if (versions.length === 1) {
      return cfg[versions[0]];
    }

    versions.sort();
    return cfg[versions[versions.length - 1]];
  }

  getService(name: string): AwsService<TContext> {
    const config = this.getServiceConfig(name);
    // console.log(config);
    return new AwsService({
      serviceId: this._serviceMap[name] || name,
      prefix: this.name,
      config,
      awsSDK: this.awsSDK,
    });
  }

  getTypeComposer(): ObjectTypeComposer<any, TContext> {
    if (!this.tc) {
      const fields = this.getServicesNames().reduce((res, name) => {
        res[this.getServiceIdentifier(name)] = this.getService(name).getFieldConfig();
        return res;
      }, {});

      this.tc = schemaComposer.createObjectTC({
        name: this.name,
        fields,
        description: `AWS SDK ${this.awsSDK.VERSION}`,
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
      description: this.getTypeComposer().getDescription(),
    };
  }
}
