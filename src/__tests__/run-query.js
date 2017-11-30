import { GQC } from 'graphql-compose';
import { graphql } from 'graphql-compose/lib/graphql';

it.skip('should use Elastic field names from source', async () => {
  GQC.rootQuery().addFields({ userES: 'JSON' });
  const result = await graphql(
    GQC.buildSchema(),
    `
      query {
        userES {
          _id
          lastName
          email
          _passwordHash
        }
      }
    `,
    {
      // simulate elastic responce
      userES: {
        $id: 123,
        lastName: 'Tyler',
        email: 'tyler@example.com',
        $passwordHash: 'abc1234def',
      },
    }
  );
  expect(result).toEqual({
    data: {
      userES: {
        _id: 123,
        lastName: 'Tyler',
        email: 'tyler@example.com',
        _passwordHash: 'abc1234def',
      },
    },
  });
});
