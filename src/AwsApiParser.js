/* @flow */

import { TypeComposer } from 'graphql-compose';
import type { GraphQLObjectType, GraphQLFieldConfig } from 'graphql-compose/lib/graphql';
import AwsService, { type ServiceConfig } from './AwsService';

export type AwsSDK = any;

type AwsOpts = {|
  name?: string,
  awsSDK?: AwsSDK,
|};

export default class AwsApiParser {
  name: string;
  awsSDK: AwsSDK;
  tc: TypeComposer;

  constructor(opts: AwsOpts) {
    this.name = opts.name || 'Aws';
    this.awsSDK = opts.awsSDK;
  }

  getServicesNames(): string[] {
    const serviceNames = Object.keys(this.awsSDK.apiLoader.services);
    serviceNames.sort();
    return serviceNames;
  }

  getServiceConfig(name: string): ServiceConfig {
    const cfg = this.awsSDK.apiLoader.services[name];
    if (!cfg) {
      throw new Error(`Service with name ${name} does not exist.`);
    }
    const versions = Object.keys(cfg);
    if (versions.length === 1) {
      return cfg[versions[0]];
    }

    versions.sort();
    return cfg[versions[versions.length - 1]];
  }

  getService(name: string): AwsService {
    return new AwsService({
      serviceId: name,
      prefix: this.name,
      config: this.getServiceConfig(name),
      awsSDK: this.awsSDK,
    });
  }

  getTypeComposer(): TypeComposer {
    if (!this.tc) {
      const fields = this.getServicesNames().reduce((res, name) => {
        res[name] = this.getService(name).getTypeComposer();
        return res;
      }, {});

      this.tc = TypeComposer.create({
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
      description: this.getTypeComposer().getDescription(),
    };
  }
}
