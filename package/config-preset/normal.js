module.exports = {
    plugins: [
        [
            'yma-config-plugin-babel',
            {
                transpileDependencies: true,
            },
        ],
        'yma-config-plugin-typescript',
    ],
};
