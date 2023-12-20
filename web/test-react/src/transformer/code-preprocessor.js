const crypto = require('crypto');
const {createTransformer} = require('babel-jest');
const createBabelConfig = require('./create-babel-config');
const pkg = require('../../../package.json');

const srcDir = 'src';

module.exports = {
    canInstrument: true,
    process(src, path, config, transformOptions) {
        const babelConfig = createBabelConfig();

        const babelSupport
            = path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.jsx');

        const babelJest = createTransformer(babelConfig);
        const fileName = babelSupport ? path : 'file.js';

        return babelJest.process(src, fileName, config, transformOptions);
    },

    getCacheKey() {
        return crypto
            .createHash('md5')
            .update('\0', 'utf8')
            .update(srcDir)
            .update('\0', 'utf8')
            .update(pkg.version)
            .digest('hex');
    },
};
