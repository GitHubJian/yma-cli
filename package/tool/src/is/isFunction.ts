import {isObject} from './isObject';
import {toString} from './constant';

export function isFunction(v) {
    if (!isObject(v)) {
        return false;
    }

    let tag = toString.call(v);
    return (
        tag == '[object Function]' ||
        tag == '[object AsyncFunction]' ||
        tag == '[object GeneratorFunction]' ||
        tag == '[object Proxy]'
    );
}
