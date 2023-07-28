const normal = require('./normal');
const {deepmerge} = require('yma-shared-util');

module.exports = deepmerge(normal, {
    plugins: ['yma-config-plugin-flexible'],
});
