import {isUndefined} from './isUndefined';

export function isBuffer(v) {
    return (
        v !== null &&
        !isUndefined(v) &&
        v.constructor !== null &&
        !isUndefined(v.constructor) &&
        typeof v.constructor.isBuffer === 'function' &&
        v.constructor.isBuffer(v)
    );
}
