import {toString} from './constant';
import {isObjectLike} from './isObjectLike';

export function isDate(v) {
    return isObjectLike(v) && toString.call(v) == '[object Date]';
}
