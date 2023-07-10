import {isObjectLike} from './isObjectLike';
import {toString} from './constant';

export function isMap(v) {
    return isObjectLike(v) && toString.call(v) == '[object Map]';
}
