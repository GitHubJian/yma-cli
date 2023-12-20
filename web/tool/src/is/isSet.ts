import {isObjectLike} from './isObjectLike';
import {toString} from './constant';

export function isSet(v) {
    return isObjectLike(v) && toString.call(v) == '[object Set]';
}
