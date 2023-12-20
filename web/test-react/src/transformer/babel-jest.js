const babel = require('babel-jest').default;
const createBabelConfig = require('./create-babel-config');

const transformer = {
    ...babel.createTransformer(createBabelConfig()),
};

module.exports = transformer;
