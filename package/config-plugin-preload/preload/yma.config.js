const path = require('path');

const config = {
    page: {
        preload: path.resolve(__dirname, './src/index.js'),
    },
    outputDir: path.resolve(__dirname, '../public'),
    filenameHashing: false,
    presets: ['yma-config-preset'],
    plugins: [
        [
            'yma-config-plugin-sdk',
            {
                name: 'preload',
            },
        ],
    ],
    css: {
        extract: false,
    },
    devServer: {
        host: '0.0.0.0',
        server: 'https',
        open: false,
        liveReload: true,
        hot: true,
        allowedHosts: 'all',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        devMiddleware: {
            // 热更新时生成的文件都写到硬盘中
            // writeToDisk: true,
        },
    },
    configureWebpack: function (config) {
        config.optimization.minimize = false;
    },
};

module.exports = config;
