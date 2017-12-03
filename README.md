graphql-compose-aws
===================

[![](https://img.shields.io/npm/v/graphql-compose-aws.svg)](https://www.npmjs.com/package/graphql-compose-aws)
[![npm](https://img.shields.io/npm/dt/graphql-compose-aws.svg)](http://www.npmtrends.com/graphql-compose-aws)
[![Travis](https://img.shields.io/travis/graphql-compose/graphql-compose-aws.svg?maxAge=2592000)](https://travis-ci.org/graphql-compose/graphql-compose-aws)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/graphql-compose/graphql-compose-aws.svg)](https://greenkeeper.io/)

This module expose AWS Cloud API via GraphQL.

#### Live demo of [AWS SDK API via Graphiql](https://graphql-compose.herokuapp.com/aws/)
Generated Schema Introspection in SDL format can be found [here](https://raw.githubusercontent.com/graphql-compose/graphql-compose-aws/master/examples/introspection/schema.txt) (more than 10k types, ~2MB).

## AWS SDK GraphQL

Supported all AWS SDK versions via official [aws-sdk](https://github.com/aws/aws-sdk-js) js client. Internally it generates Types and FieldConfigs from AWS SDK configs. You may put this generated types to any GraphQL Schema.

```js
import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import awsSDK from 'aws-sdk';
import { AwsApiParser } from 'graphql-compose-aws';

const awsApiParser = new AwsApiParser({
  awsSDK,
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      // Full API
      aws: awsApiParser.getFieldConfig(),

      // Partial API with desired services
      s3: awsApiParser.getService('s3').getFieldConfig(),
      ec2: awsApiParser.getService('ec2').getFieldConfig(),
    },
  }),
});

export default schema;
```

Full [code examples](https://github.com/graphql-compose/graphql-compose-aws/tree/master/examples/)

## Installation
```
yarn add graphql graphql-compose aws-sdk graphql-compose-aws
// or
npm install graphql graphql-compose aws-sdk graphql-compose-aws --save
```
Modules `graphql`, `graphql-compose`, `aws-sdk` are in `peerDependencies`, so should be installed explicitly in your app.

## Screenshots

### Get List of EC2 instances from `eu-west-1` region
<img width="1185" alt="screen shot 2017-12-03 at 18 19 28" src="https://user-images.githubusercontent.com/1946920/33525931-c7092c7a-d862-11e7-947b-70380693cc8b.png">

### Several requests in one query with different services and regions
<img width="1184" alt="screen shot 2017-12-03 at 18 07 50" src="https://user-images.githubusercontent.com/1946920/33525932-c8507656-d862-11e7-9e66-4deb27b8f996.png">


## License
[MIT](https://github.com/graphql-compose/graphql-compose-aws/blob/master/LICENSE.md)
