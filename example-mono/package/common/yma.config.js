const path = require('path');
const mono = require('./package.json').mono;

module.exports = {
    context: __dirname,
    page: {
        vendors: ['vue', 'vue-router', '@vue/composition-api', 'axios'],
        // base: path.resolve(__dirname, './src/export/base/index.ts'),
        // polyfill: path.resolve(__dirname, './src/export/polyfill/index.ts'),
        util: path.resolve(__dirname, './src/export/util/index.ts'),
    },
    plugins: [
        'yma-config-plugin-babel',
        'yma-config-plugin-typescript',
        ['yma-config-plugin-mono'],
    ],
};
