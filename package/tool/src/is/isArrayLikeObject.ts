import {isObjectLike} from './isObjectLike';
import {isArrayLike} from './isArrayLike';

export function isArrayLikeObject(v): boolean {
    return isObjectLike(v) && isArrayLike(v);
}
