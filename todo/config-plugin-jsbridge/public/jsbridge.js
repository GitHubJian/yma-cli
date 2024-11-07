if (process.env.NODE_ENV === 'production') {
    module.exports = require('./jsbridge.prod.js');
} else {
    module.exports = require('./jsbridge.dev.js');
}
