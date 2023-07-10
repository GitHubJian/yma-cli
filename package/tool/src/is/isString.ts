import {isArray} from './isArray';
import {toString} from './constant';

export function isString(v) {
    const type = typeof v;

    return (
        type === 'string' ||
        (type === 'object' &&
            v != null &&
            !isArray(v) &&
            toString.call(v) === '[object String]')
    );
}
