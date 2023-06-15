const fs = require('fs');
const path = require('path');
const vue = require('@ecomfe/eslint-config/vue');

const isTypescriptRepo = fs.existsSync(path.resolve(process.cwd(), 'tsconfig.json'));
const config = Object.assign({extends: ['@ecomfe/eslint-config']}, vue);
config.parserOptions = config.parserOptions || {};
config.parserOptions.parser = isTypescriptRepo ? '@typescript-eslint/parser' : '@babel/eslint-parser';

export = Object.assign({}, config);
