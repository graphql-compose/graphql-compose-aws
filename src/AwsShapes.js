/* @flow */

import { type ComposeOutputType, type ComposeInputType } from 'graphql-compose';
import { AwsParam, type Param } from './AwsParam';

export type ShapesMap = {
  [name: string]: Param,
};

export class AwsShapes<TContext> {
  shapes: ShapesMap;
  prefix: string;
  shapesInput: { [name: string]: ComposeInputType };
  shapesOutput: { [name: string]: ComposeOutputType<any, TContext> };

  constructor(shapes: ShapesMap, prefix: string) {
    this.shapes = shapes;
    this.prefix = prefix;
    this.shapesInput = {};
    this.shapesOutput = {};
  }

  getInputShape(name: string): ComposeInputType {
    if (!this.shapesInput[name]) {
      if (!this.shapes[name]) {
        throw new Error(`Shape with name '${name}' not found in service config ${this.prefix}`);
      }

      // store firstly as JSON, for solving recursion calls
      this.shapesInput[name] = 'JSON';
      this.shapesInput[name] = (AwsParam.convertParam(
        this.shapes[name],
        `${this.prefix}${name}`,
        true,
        this
      ): any);
    }

    return this.shapesInput[name];
  }

  getOutputShape(name: string): ComposeOutputType<any, TContext> {
    if (!this.shapesOutput[name]) {
      if (!this.shapes[name]) {
        throw new Error(`Shape with name '${name}' not found in service config ${this.prefix}`);
      }

      // store firstly as JSON, for solving recursion calls
      this.shapesOutput[name] = 'JSON';
      this.shapesOutput[name] = (AwsParam.convertParam(
        this.shapes[name],
        `${this.prefix}${name}`,
        false,
        this
      ): any);
    }

    return this.shapesOutput[name];
  }
}
