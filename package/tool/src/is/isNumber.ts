import {isObjectLike} from './isObjectLike';
import {toString} from './constant';

export function isNumber(v) {
    return typeof v == 'number' || (isObjectLike(v) && toString.call(v) == '[object Number]');
}
