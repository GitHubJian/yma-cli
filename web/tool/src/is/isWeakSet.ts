import {toString} from './constant';
import {isObjectLike} from './isObjectLike';

export function isWeakSet(v) {
    return isObjectLike(v) && toString.call(v) == '[object WeakSet]';
}
