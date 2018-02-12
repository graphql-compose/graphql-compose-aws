/* @flow */

import {
  TypeComposer,
  InputTypeComposer,
  upperFirst,
  type ComposeOutputType,
  type ComposeInputType,
} from 'graphql-compose';

type ParamsMap = {
  [name: string]: Param,
};

export type Param =
  | ParamLocation
  | ParamStructure
  | ParamList
  | ParamMap
  | ParamBoolean
  | ParamTimestamp
  | ParamFloat
  | ParamInteger
  | ParamString
  | ParamEmpty
  | ParamShape;

type ParamList = {|
  type: 'list',
  member: Param,
  locationName?: string,
  flattened?: boolean,
|};

type ParamMap = {|
  type: 'map',
  key: Object,
  value: Param,
|};

type ParamEmpty = {||};

type ParamShape = {|
  shape: string,
  locationName?: string,
|};

type ParamBoolean = {|
  type: 'boolean',
  locationName?: string,
|};

type ParamString = {|
  type: 'string',
  locationName?: string,
  sensitive?: boolean,
|};

type ParamInteger = {|
  type: 'integer',
  locationName?: string,
|};

type ParamFloat = {|
  type: 'float',
  locationName?: string,
|};

type ParamTimestamp = {|
  type: 'timestamp',
  locationName?: string,
|};

type ParamLocation = {|
  location: string,
  locationName: string,
|};

export type ParamStructure = {|
  type: 'structure',
  members: ParamsMap,
  locationName?: string,
  xmlNamespace?: {
    uri: string,
  },
  required?: string[],
  payload?: string,
|};

type AwsShapes = any;

export default class AwsParam {
  static convertInputStructure(
    param: ParamStructure,
    name: string,
    shapes?: AwsShapes
  ): InputTypeComposer {
    const fields = {};

    if (param.members) {
      Object.keys(param.members).forEach(fname => {
        fields[fname] = this.convertParam(
          param.members[fname],
          `${name}${upperFirst(fname)}`,
          true,
          shapes
        );
      });
    }

    const itc = InputTypeComposer.create({
      name: `${name}Input`,
      fields,
    });

    if (Array.isArray(param.required)) {
      itc.makeRequired(param.required);
    }

    return itc;
  }

  static convertOutputStructure(
    param: ParamStructure,
    name: string,
    shapes?: AwsShapes
  ): TypeComposer {
    const fields = {};

    if (param.members) {
      Object.keys(param.members).forEach(fname => {
        fields[fname] = this.convertParam(
          param.members[fname],
          `${name}${upperFirst(fname)}`,
          false,
          shapes
        );
      });
    }

    const tc = TypeComposer.create({
      name,
      fields,
    });

    if (Array.isArray(param.required)) {
      tc.makeFieldNonNull(param.required);
    }

    return tc;
  }

  static convertParam(
    param: Param,
    name: string,
    isInput?: boolean,
    shapes?: AwsShapes
  ): ComposeOutputType<*> | ComposeInputType {
    if (param.type) {
      switch (param.type) {
        case 'boolean':
          return 'Boolean';
        case 'string':
          return 'String';
        case 'integer':
          return 'Int';
        case 'float':
          return 'Float';
        case 'timestamp':
          return 'Date';
        case 'structure': {
          const tc = isInput
            ? this.convertInputStructure(param, name, shapes)
            : this.convertOutputStructure(param, name, shapes);
          // If bugous structure without fields, then return JSON
          if (Object.keys(tc.getFields()).length === 0) {
            return 'JSON';
          }
          return tc;
        }
        case 'map':
          return 'JSON';
        case 'list':
          // $FlowFixMe
          return [this.convertParam(param.member, name, isInput, shapes)];
        default:
          return 'JSON';
      }
    }
    if (param.shape) {
      return this.convertShape(param, isInput, shapes);
    }

    return 'String';
  }

  static convertShape(
    param: ParamShape,
    isInput?: boolean,
    shapes?: AwsShapes
  ): ComposeOutputType<*> | ComposeInputType {
    if (shapes) {
      return isInput ? shapes.getInputShape(param.shape) : shapes.getOutputShape(param.shape);
    }
    return 'JSON';
  }
}
