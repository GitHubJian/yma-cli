if (process.env.NODE_ENV === 'production') {
    module.exports = require('./public/jsbridge.prod.js');
} else {
    module.exports = require('./public/jsbridge.dev.js');
}
