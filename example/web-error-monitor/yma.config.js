// const normal = require('yma-config-preset');
const path = require('path');
const cwd = process.cwd();

module.exports = {
    presets: ['yma-config-preset/ts.js'],
    page: {
        index: {
            entry: path.resolve(__dirname, 'src/page/index/index.ts'),
            template: path.resolve(__dirname, 'public/index.html'),
            inject: 'head'
        },
    },
    chainWebpack: function (chain) {
        chain.resolve.alias.set(
            '@ErrorMinotor',
            path.resolve(cwd, '../../package/web-error-monitor')
        );
    },
};
