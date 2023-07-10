export function isDOMError(value) {
    return Object.prototype.toString.call(value) === '[object DOMError]';
  }
  