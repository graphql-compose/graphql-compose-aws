[WIP] graphql-compose-aws
======================

[![](https://img.shields.io/npm/v/graphql-compose-aws.svg)](https://www.npmjs.com/package/graphql-compose-aws)
[![npm](https://img.shields.io/npm/dt/graphql-compose-aws.svg)](http://www.npmtrends.com/graphql-compose-aws)
[![Travis](https://img.shields.io/travis/graphql-compose/graphql-compose-aws.svg?maxAge=2592000)](https://travis-ci.org/graphql-compose/graphql-compose-aws)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/graphql-compose/graphql-compose-aws.svg)](https://greenkeeper.io/)

This module expose AWS SDK API via GraphQL.

## AWS SDK GraphQL

Supported all AWS SDK versions that support official [aws-sdk](https://github.com/aws/aws-sdk-js) client. Internally it parses api schema files and generates all available methods with params and descriptions to GraphQL Field Config Map. You may put this config map to any GraphQL Schema.

```js
import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import elasticsearch from 'elasticsearch';
import { elasticApiFieldConfig } from 'graphql-compose-aws';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      elastic50: elasticApiFieldConfig(
        // you may provide existed Elastic Client instance
        new elasticsearch.Client({
          host: 'http://localhost:9200',
          apiVersion: '5.0',
        })
      ),

      // or may provide just config
      elastic24: elasticApiFieldConfig({
        host: 'http://user:pass@localhost:9200',
        apiVersion: '2.4',
      }),

      elastic17: elasticApiFieldConfig({
        host: 'http://user:pass@localhost:9200',
        apiVersion: '1.7',
      }),
    },
  }),
});
```

Full [code example](https://github.com/graphql-compose/graphql-compose-aws/tree/master/examples/)

Live demo of [Introspection of AWS SDK API via Graphiql](https://graphql-compose.herokuapp.com/aws/)

## Installation
```
yarn add graphql graphql-compose aws-sdk graphql-compose-aws
// or
npm install graphql graphql-compose aws-sdk graphql-compose-aws --save
```
Modules `graphql`, `graphql-compose`, `aws-sdk` are in `peerDependencies`, so should be installed explicitly in your app.

## Screenshots

### API proxy: Raw search method
<img width="1316" alt="screen shot 2017-03-07 at 22 26 17" src="https://cloud.githubusercontent.com/assets/1946920/23859886/61066f40-082f-11e7-89d0-8443aa2ae930.png">

### API proxy: Getting several raw elastic metric in one request
<img width="1314" alt="screen shot 2017-03-07 at 22 34 01" src="https://cloud.githubusercontent.com/assets/1946920/23859892/65e71744-082f-11e7-8c1a-cafeb87e08e6.png">

### Mapping: Relay Cursor Connection
<img width="1411" alt="screen shot 2017-03-22 at 19 34 09" src="https://cloud.githubusercontent.com/assets/1946920/24200219/a058c220-0f36-11e7-9cf1-38394052f922.png">

### Mapping: Generated GraphQL Types and Documentation
<img width="1703" alt="screen shot 2017-03-22 at 19 33 24" src="https://cloud.githubusercontent.com/assets/1946920/24200220/a05944b6-0f36-11e7-9919-39b7001af203.png">


## License
[MIT](https://github.com/graphql-compose/graphql-compose-aws/blob/master/LICENSE.md)
