const {resolveMonoDependencies} = require('../dist');
const path = require('path');

const alias = resolveMonoDependencies(path.resolve(__dirname, 'core'));
console.log(alias);
