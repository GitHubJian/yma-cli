import {toString} from './constant';
import {isObjectLike} from './isObjectLike';

export function isRegExp(v) {
    return isObjectLike(v) && toString.call(v) == '[object RegExp]';
}
