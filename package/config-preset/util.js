const deepmerge = require('deepmerge');

export function merge(x, y) {
    return deepmerge(x, y, {});
}
