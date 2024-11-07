module.exports = {
    plugins: [
        ['yma-config-plugin-chunk'],
        [
            'yma-config-plugin-babel',
            {
                transpileDependencies: true,
            },
        ],
        ['yma-config-plugin-vconsole'],
    ],
};
