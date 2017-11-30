/* @flow */

import fs from 'fs';
import path from 'path';
import { GraphQLSchema, GraphQLObjectType, printSchema } from 'graphql';
import awsSDK from 'aws-sdk';
import { AwsApiParser } from '../../src'; // from 'graphql-compose-aws';

const awsApiParser = new AwsApiParser({
  awsSDK,
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      aws: awsApiParser.getFieldConfig(),
    },
  }),
});

fs.writeFileSync(path.resolve(__dirname, './generated/schema.txt'), printSchema(schema));

export default schema;
