const normal = require('./normal');
import {merge} from './util';

module.exports = merge(normal, {
    plugins: [
        'yma-config-plugin-sdk',
        {
            externals: ['vue', 'vue-router'],
        },
    ],
});
