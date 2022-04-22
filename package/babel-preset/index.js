const path = require('path');
const {loadOptions} = require('yma-shared-util');

module.exports = function (context, options = {}) {
    const absoluteRuntime = path.dirname(
        require.resolve('@babel/runtime/package.json')
    );
    const version = require('@babel/runtime/package.json').version;
    const {useBuiltIns = 'usage'} = options;

    const browsers = loadOptions('browserslist.config.js', process.cwd());

    const presets = [
        [
            '@babel/preset-env',
            {
                modules: false,
                useBuiltIns: useBuiltIns,
                corejs: useBuiltIns
                    ? require('core-js/package.json').version
                    : false,
                debug: false,
                shippedProposals: true,
                targets: {
                    browsers,
                },
            },
        ],
    ];

    const plugins = [
        [
            '@babel/plugin-transform-runtime',
            {
                regenerator: useBuiltIns !== 'usage',
                corejs: false,
                helpers: useBuiltIns === 'usage',
                absoluteRuntime,
                version,
            },
        ],
        ['@babel/plugin-syntax-dynamic-import'],
        // ['@babel/plugin-transform-modules-commonjs'],
        [require.resolve('./util/chunkname-plugin')],
    ];

    return {
        sourceType: 'unambiguous',
        overrides: [
            {
                presets,
                plugins,
            },
        ],
    };
};
