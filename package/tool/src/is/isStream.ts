import {isFunction} from './isFunction';
import {isObject} from './isObject';

export function isStream(v) {
    return isObject(v) && isFunction(v.pipe);
}
