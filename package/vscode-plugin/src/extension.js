const env = require('./env');
const lint = require('./lint');

exports.activate = function activate(context) {
    env(context);
    lint(context);
};
