/* @flow */

import fs from 'fs';
import path from 'path';
import { printSchema } from 'graphql';
import schema from '../fullApi/schema';

const output = path.resolve(__dirname, './schema.txt');
fs.writeFileSync(output, printSchema(schema));
