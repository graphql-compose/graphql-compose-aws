/* @flow */

import { ObjectTypeComposer, InputTypeComposer } from 'graphql-compose';
import { AwsParam } from '../AwsParam';

describe('AwsParam', () => {
  describe('static convertParam()', () => {
    it('scalars', () => {
      expect(AwsParam.convertParam({ type: 'boolean' }, '')).toBe('Boolean');
      expect(AwsParam.convertParam({ type: 'string' }, '')).toBe('String');
      expect(AwsParam.convertParam({ type: 'integer' }, '')).toBe('Int');
      expect(AwsParam.convertParam({ type: 'float' }, '')).toBe('Float');
      expect(AwsParam.convertParam({ type: 'timestamp' }, '')).toBe('Date');
      expect(AwsParam.convertParam({}, '')).toBe('String');
    });

    it('map', () => {
      // it does not have keys, so should be JSON type
      expect(AwsParam.convertParam({ type: 'map', key: {}, value: {} }, '')).toBe('JSON');
    });

    it('list', () => {
      const t = AwsParam.convertParam({ type: 'list', member: {}, flattened: true }, '');
      expect(t).toEqual(['String']);

      // nested lists
      const t2 = AwsParam.convertParam(
        { type: 'list', member: { type: 'list', member: {} }, flattened: true },
        ''
      );
      expect(t2).toEqual([['String']]);
    });

    it('structure', () => {
      const param = {
        type: 'structure',
        members: {
          Bucket: {},
        },
      };

      const t = AwsParam.convertParam(param, 'Name');
      expect(t).toBeInstanceOf(ObjectTypeComposer);

      const t2 = AwsParam.convertParam(param, 'Name', true);
      expect(t2).toBeInstanceOf(InputTypeComposer);
    });

    it('shape', () => {
      const shapesMock: any = {
        getInputShape: () => 'Int',
        getOutputShape: () => 'String',
      };

      const t = AwsParam.convertParam({ shape: 'Sk' }, 'Name', true, shapesMock);
      expect(t).toBe('Int');

      const t2 = AwsParam.convertParam({ shape: 'Sk' }, 'Name', false, shapesMock);
      expect(t2).toBe('String');

      // as fallback use JSON, if shapes are empty
      const t3 = AwsParam.convertParam({ shape: 'Sk' }, 'Name');
      expect(t3).toBe('JSON');
    });
  });

  it('static convertInputStructure()', () => {
    const param = {
      type: 'structure',
      required: ['Bucket'],
      members: {
        Bucket: {
          location: 'uri',
          locationName: 'Bucket',
        },
        Delimiter: {
          location: 'querystring',
          locationName: 'delimiter',
        },
      },
    };

    const itc = AwsParam.convertInputStructure(param, 'AwsS3Bucket');
    expect(itc).toBeInstanceOf(InputTypeComposer);
    expect(itc.getTypeName()).toBe('AwsS3BucketInput');
    expect(itc.getFieldTypeName('Bucket')).toBe('String!');
    expect(itc.getFieldTypeName('Delimiter')).toBe('String');
  });

  it('static convertOutputStructure()', () => {
    const param = {
      type: 'structure',
      required: ['Bucket'],
      members: {
        Bucket: {
          location: 'uri',
          locationName: 'Bucket',
        },
        Delimiter: {
          location: 'querystring',
          locationName: 'delimiter',
        },
      },
    };

    const tc = AwsParam.convertOutputStructure(param, 'AwsS3Bucket');
    expect(tc).toBeInstanceOf(ObjectTypeComposer);
    expect(tc.getTypeName()).toBe('AwsS3Bucket');
    expect(tc.getFieldTypeName('Bucket')).toBe('String!');
    expect(tc.getFieldTypeName('Delimiter')).toBe('String');
  });
});
