/* @flow */

import { schemaComposer, ObjectTypeComposer, upperFirst } from 'graphql-compose';
import type { GraphQLFieldConfig } from 'graphql-compose/lib/graphql';

export type ServiceMetadataConfig = {
  apiVersion: string,
  endpointPrefix: string,
  globalEndpoint: string,
  serviceAbbreviation: string,
  serviceFullName: string,
  signatureVersion: string,
  uid: string,
};

export class AwsServiceMetadata<TContext> {
  metadata: ServiceMetadataConfig;
  tc: ?ObjectTypeComposer<any, TContext>;

  constructor(metadata: ServiceMetadataConfig) {
    this.metadata = metadata;
  }

  getPrefix(): string {
    return `Aws${upperFirst(this.metadata.endpointPrefix)}`;
  }

  getDescription(): string {
    // { apiVersion: '2006-03-01',
    //   checksumFormat: 'md5',
    //   endpointPrefix: 's3',
    //
    //   globalEndpoint: 's3.amazonaws.com',
    //   protocol: 'rest-xml',
    //   serviceAbbreviation: 'Amazon S3',
    //   serviceFullName: 'Amazon Simple Storage Service',
    //   serviceId: 'S3',
    //   signatureVersion: 's3',
    //   timestampFormat: 'rfc822',
    //   uid: 's3-2006-03-01' }
    const { serviceFullName, apiVersion } = this.metadata;
    return `${serviceFullName} (${apiVersion})`;
  }

  getTypeComposer(): ObjectTypeComposer<any, TContext> {
    if (!this.tc) {
      this.tc = schemaComposer.createObjectTC(`
        type ${this.getPrefix()}Metadata {
          apiVersion: String
          endpointPrefix: String
          globalEndpoint: String
          serviceAbbreviation: String
          serviceFullName: String
          signatureVersion: String
          uid: String
          raw: JSON
        }
      `);
    }
    return this.tc;
  }

  getFieldConfig(): GraphQLFieldConfig<any, any> {
    return {
      type: this.getTypeComposer().getType(),
      resolve: () => {
        return {
          ...this.metadata,
          raw: this.metadata,
        };
      },
    };
  }
}
