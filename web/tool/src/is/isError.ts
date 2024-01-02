import {isObjectLike} from './isObjectLike';
import {toString} from './constant';
import {isPlainObject} from './isPlainObject';

export function isError(v) {
    if (!isObjectLike(v)) {
        return false;
    }

    let tag = toString.call(v);
    return (
        tag == '[object Error]' ||
        tag == '[object DOMException]' ||
        (typeof v.message === 'string' && typeof v.name === 'string' && !isPlainObject(v))
    );
}
