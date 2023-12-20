import {isObjectLike} from './isObjectLike';
import {toString} from './constant';

export function isBoolean(v) {
    return v === true || v === false || (isObjectLike(v) && toString.call(v) == '[object Boolean]');
}
