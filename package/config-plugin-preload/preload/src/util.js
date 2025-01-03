exports.hasOwn = function hasOwn(object, key) {
    const hasOwnProperty = Object.prototype.hasOwnProperty;

    return object != null && hasOwnProperty.call(object, key);
};

exports.noop = function noop(a, b, c) {};

exports.on = (function () {
    if (document.addEventListener) {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.addEventListener(event, handler, false);
            }
        };
    }
    return function (element, event, handler) {
        if (element && event && handler) {
            element.attachEvent('on' + event, handler);
        }
    };
})();

exports.off = (function () {
    if (document.removeEventListener) {
        return function (element, event, handler) {
            if (element && event) {
                element.removeEventListener(event, handler, false);
            }
        };
    }
    return function (element, event, handler) {
        if (element && event) {
            element.detachEvent('on' + event, handler);
        }
    };
})();

exports.ensureSlash = function ensureSlash(val) {
    return val.replace(/([^/])$/, '$1/');
};
