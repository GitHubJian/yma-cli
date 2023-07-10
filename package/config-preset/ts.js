module.exports = {
    plugins: [
        [
            'yma-config-plugin-babel',
            {
                transpileDependencies: true,
            },
        ],
        'yam-config-plugin-typescript',
    ],
};
