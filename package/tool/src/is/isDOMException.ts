export function isDOMException(value) {
    return Object.prototype.toString.call(value) === '[object DOMException]';
}
