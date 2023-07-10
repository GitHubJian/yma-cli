import {toString} from './constant';
import {isObjectLike} from './isObjectLike';

export function isWeakMap(v) {
    return isObjectLike(v) && toString.call(v) == '[object WeakMap]';
}
