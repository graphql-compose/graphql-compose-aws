/* @flow */

import { InputTypeComposer } from 'graphql-compose';

export default InputTypeComposer.create({
  name: 'AwsConfig',
  fields: {
    accessKeyId: 'String',
    secretAccessKey: 'String',
    region: 'String',
  },
});
