import {isLength} from './isLength';

export function isArrayLike(v): boolean {
    return v != null && typeof v != 'function' && isLength(v.length);
}
