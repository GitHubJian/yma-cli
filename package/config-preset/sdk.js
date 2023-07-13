const deepmerge = require('deepmerge');
const normal = require('./normal');

module.exports = deepmerge(normal, {
    plugins: [
        'yma-config-plugin-sdk',
        {
            externals: ['vue', 'vue-router'],
        },
    ],
});
