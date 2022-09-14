import { schemaComposer } from 'graphql-compose';

export default schemaComposer.createInputTC({
  name: 'AwsConfig',
  fields: {
    accessKeyId: 'String',
    secretAccessKey: 'String',
    sessionToken: 'String',
    region: 'String',
  },
});
