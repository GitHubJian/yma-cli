const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    presets: ['yma-config-preset'],
    devServer: {
        proxy: {
            '/api': {
                target: 'http://120.92.35.96:8720',
                changeOrigin: true,
            },
        },
    },
    chainWebpack: function (chain) {
        chain.plugin('copywebpackplugin').use(CopyWebpackPlugin, [
            {
                patterns: [
                    {
                        from: 'public/favicon.ico',
                        to: '',
                    },
                ],
            },
        ]);
    },
};
