const path = require('path');

module.exports = {
    chainWebpack: chain => {
        chain.resolve.alias.set('common', path.resolve(__dirname, '../common'));
    },
    plugins: [
        'yma-config-plugin-babel',
        'yma-config-plugin-typescript',
        ['yma-config-plugin-mono', {}],
    ],
};
