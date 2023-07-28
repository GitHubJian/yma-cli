import fs from 'fs';
import path from 'path';
import vue from './base/vue';

const isTypescriptRepo = fs.existsSync(path.resolve(process.cwd(), 'tsconfig.json'));
const config = Object.assign({extends: ['./base/index']}, vue);
config.parserOptions = config.parserOptions || {};
config.parserOptions.parser = isTypescriptRepo ? '@typescript-eslint/parser' : '@babel/eslint-parser';

export = Object.assign({}, config);
