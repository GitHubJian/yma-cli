import {isArrayLike} from './isArrayLike';
import {isArray} from './isArray';
import {isBuffer} from './isBuffer';
import {isArguments} from './isArguments';
import {toString} from './constant';
import {isPrototype} from './isPrototype';

export function isEmpty(value) {
    if (value == null) {
        return true;
    }

    if (
        isArrayLike(value) &&
        (isArray(value) ||
            typeof value === 'string' ||
            typeof value.splice === 'function' ||
            isBuffer(value) ||
            // isTypedArray(value) || TODO:
            isArguments(value))
    ) {
        return !value.length;
    }

    const tag = toString.call(value);
    if (tag == '[object Map]' || tag == '[object Set]') {
        return !value.size;
    }

    if (isPrototype(value)) {
        return !Object.keys(value).length;
    }

    const hasOwnProperty = Object.prototype.hasOwnProperty;
    for (const key in value) {
        if (hasOwnProperty.call(value, key)) {
            return false;
        }
    }

    return true;
}
