import { ComposeOutputTypeDefinition, ComposeInputTypeDefinition } from 'graphql-compose';
import { AwsParam, Param } from './AwsParam';

export type ShapesMap = {
  [name: string]: Param;
};

export class AwsShapes<TContext> {
  shapes: ShapesMap;
  prefix: string;
  shapesInput: { [name: string]: ComposeInputTypeDefinition };
  shapesOutput: { [name: string]: ComposeOutputTypeDefinition<TContext> };

  constructor(shapes: ShapesMap, prefix: string) {
    this.shapes = shapes;
    this.prefix = prefix;
    this.shapesInput = {};
    this.shapesOutput = {};
  }

  getInputShape(name: string): ComposeInputTypeDefinition {
    if (!this.shapesInput[name]) {
      if (!this.shapes[name]) {
        throw new Error(`Shape with name '${name}' not found in service config ${this.prefix}`);
      }

      // store firstly as JSON, for solving recursion calls
      this.shapesInput[name] = 'JSON';
      this.shapesInput[name] = AwsParam.convertParamInput(
        this.shapes[name],
        `${this.prefix}${name}`,
        this
      );
    }

    return this.shapesInput[name];
  }

  getOutputShape(name: string): ComposeOutputTypeDefinition<TContext> {
    if (!this.shapesOutput[name]) {
      if (!this.shapes[name]) {
        throw new Error(`Shape with name '${name}' not found in service config ${this.prefix}`);
      }

      // store firstly as JSON, for solving recursion calls
      this.shapesOutput[name] = 'JSON';
      this.shapesOutput[name] = AwsParam.convertParamOutput(
        this.shapes[name],
        `${this.prefix}${name}`,
        this
      );
    }

    return this.shapesOutput[name];
  }
}
