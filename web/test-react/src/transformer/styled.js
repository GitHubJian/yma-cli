const crypto = require('crypto');
const pkg = require('../../../package.json');

const srcDir = 'src';

module.exports = {
    canInstrument: true,
    process(src, path, config, transformOptions) {
        if (src.indexOf('@emotion/styled')) {
            console.log('ssss');
        }
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
