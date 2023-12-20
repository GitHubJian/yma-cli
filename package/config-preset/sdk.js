const {deepmerge} = require('yma-shared-util');
const base = require('./base');

module.exports = deepmerge(base, {
    plugins: [
        'yma-config-plugin-sdk',
        {
            externals: ['vue', 'vue-router'],
        },
    ],
});
