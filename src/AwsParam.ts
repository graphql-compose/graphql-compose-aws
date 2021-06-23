import {
  schemaComposer,
  ObjectTypeComposer,
  InputTypeComposer,
  upperFirst,
  ComposeOutputTypeDefinition,
  ComposeInputTypeDefinition,
  InputTypeComposerFieldConfigMapDefinition,
  ObjectTypeComposerFieldConfigMapDefinition,
} from 'graphql-compose';

type ParamsMap = {
  [name: string]: Param;
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

type ParamList = {
  type: 'list';
  member: Param;
  locationName?: string;
  flattened?: boolean;
};

type ParamMap = {
  type: 'map';
  key: Record<string, unknown>;
  value: Param;
};

type ParamEmpty = Record<string, unknown>;

type ParamShape = {
  type?: 'shape';
  shape: string;
  locationName?: string;
};

type ParamBoolean = {
  type: 'boolean';
  locationName?: string;
};

type ParamString = {
  type: 'string';
  locationName?: string;
  sensitive?: boolean;
};

type ParamInteger = {
  type: 'integer';
  locationName?: string;
};

type ParamFloat = {
  type: 'float';
  locationName?: string;
};

type ParamTimestamp = {
  type: 'timestamp';
  locationName?: string;
};

type ParamLocation = {
  type?: 'location';
  location: string;
  locationName: string;
};

export type ParamStructure = {
  type: 'structure';
  members: ParamsMap;
  locationName?: string;
  xmlNamespace?: {
    uri: string;
  };
  required?: string[];
  payload?: string;
};

type AwsShapes = any;

export class AwsParam {
  static convertInputStructure(
    param: ParamStructure,
    name: string,
    shapes?: AwsShapes
  ): InputTypeComposer<any> {
    const fields = {} as InputTypeComposerFieldConfigMapDefinition;

    if (param.members) {
      Object.keys(param.members).forEach((fname) => {
        fields[fname] = this.convertParamInput(
          param.members[fname],
          `${name}${upperFirst(fname)}`,
          shapes
        );
      });
    }

    const typename = `${name}Input`;

    if (schemaComposer.has(typename)) {
      console.warn(
        `Type ${typename} already exists. It seems that aws-sdk has types with same names. Reusing already existed type for GraphQL schema.`
      );
      return schemaComposer.get(typename) as any;
    }

    const itc = schemaComposer.createInputTC({
      name: typename,
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
  ): ObjectTypeComposer<any, any> {
    const fields = {} as ObjectTypeComposerFieldConfigMapDefinition<any, any>;

    if (param.members) {
      Object.keys(param.members).forEach((fname) => {
        fields[fname] = this.convertParamOutput(
          param.members[fname],
          `${name}${upperFirst(fname)}`,
          shapes
        );
      });
    }

    const tc = schemaComposer.createObjectTC({
      name,
      fields,
    });

    if (Array.isArray(param.required)) {
      tc.makeFieldNonNull(param.required);
    }

    return tc;
  }

  static convertParamInput(
    param: Param,
    name: string,
    shapes?: AwsShapes
  ): ComposeInputTypeDefinition {
    return this._convertParam(param, name, true, shapes) as any;
  }

  static convertParamOutput(
    param: Param,
    name: string,
    shapes?: AwsShapes
  ): ComposeOutputTypeDefinition<any> {
    return this._convertParam(param, name, false, shapes) as any;
  }

  static _convertParam(
    param: Param,
    name: string,
    isInput?: boolean,
    shapes?: AwsShapes
  ): ComposeOutputTypeDefinition<any> | ComposeInputTypeDefinition {
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
            ? this.convertInputStructure(param as ParamStructure, name, shapes)
            : this.convertOutputStructure(param as ParamStructure, name, shapes);
          // If bugous structure without fields, then return JSON
          if (Object.keys(tc.getFields()).length === 0) {
            return 'JSON';
          }
          return tc;
        }
        case 'map':
          return 'JSON';
        case 'list':
          return [this._convertParam((param as ParamList).member, name, isInput, shapes) as any];
        default:
          return 'JSON';
      }
    }
    if ((param as ParamShape).shape) {
      return this.convertShape(param as ParamShape, isInput, shapes);
    }

    return 'String';
  }

  static convertShape(
    param: ParamShape,
    isInput?: boolean,
    shapes?: AwsShapes
  ): ComposeOutputTypeDefinition<any> | ComposeInputTypeDefinition {
    if (shapes) {
      return isInput ? shapes.getInputShape(param.shape) : shapes.getOutputShape(param.shape);
    }
    return 'JSON';
  }
}
