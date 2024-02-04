const transform = require('./transform');

function loader(source, inputSourceMap) {
    const filename = this.resourcePath;

    const result = transform(filename, source);

    return result;
}

function makeLoader(callback) {
    const overrides = callback ? callback() : undefined;

    return function (source, inputSourceMap) {
        const callback = this.async();
        try {
            const result = loader.call(this, source, inputSourceMap, overrides);
            callback(null, ...result);
        } catch (err) {
            callback(err);
        }
    };
}

module.exports = makeLoader();
