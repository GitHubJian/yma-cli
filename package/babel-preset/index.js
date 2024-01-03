const path = require('path');
const semver = require('semver');
const {loadOptions} = require('yma-shared-util');

// 全局搜索 GLOBAL_BROWSERS_LIST，默认值
const GLOBAL_BROWSERS_LIST = [
    'Chrome >= 46',
    'Firefox >= 45',
    'Safari >= 10',
    'Edge >= 13',
    'iOS >= 10',
    'Electron >= 0.36',
];

module.exports = function (context, options = {}) {
    const absoluteRuntime = path.dirname(require.resolve('@babel/runtime/package.json'));
    const version = require('@babel/runtime/package.json').version;
    const {useBuiltIns = 'usage'} = options;

    const browsers = loadOptions('browserslist.config.js', process.cwd()) || GLOBAL_BROWSERS_LIST;

    const presets = [
        [
            '@babel/preset-env',
            {
                modules: false,
                useBuiltIns: useBuiltIns,
                corejs: useBuiltIns ? require('core-js/package.json').version : false,
                debug: false,
                shippedProposals: true,
                targets: {
                    browsers,
                },
                loose: true,
            },
        ],
    ];

    if (options.jsx !== false) {
        let jsxOptions = {};
        if (typeof options.jsx === 'object') {
            jsxOptions = options.jsx;
        }

        let vueVersion = 2;
        try {
            const Vue = require('vue');
            vueVersion = semver.major(Vue.version);
        } catch (e) {}

        if (vueVersion === 2) {
            presets.push([require('@vue/babel-preset-jsx'), jsxOptions]);
        } else if (vueVersion === 3) {
            plugins.push([require('@vue/babel-plugin-jsx'), jsxOptions]);
        }
    }

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

        ['@babel/plugin-proposal-export-default-from'],
        ['@babel/plugin-proposal-decorators', {legacy: true}],
        ['@babel/plugin-proposal-private-methods', {loose: true}],
        ['@babel/plugin-proposal-class-properties', {loose: true}],
        ['@babel/plugin-transform-private-property-in-object', {loose: true}],
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
