import {isObjectLike} from './isObjectLike';
import {isPlainObject} from './isPlainObject';

export function isElement(v) {
    return isObjectLike(v) && v.nodeType === 1 && !isPlainObject(v);
}
