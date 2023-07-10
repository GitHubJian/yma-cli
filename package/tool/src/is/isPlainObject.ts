import {toString} from './constant';

export function isPlainObject(v) {
    return toString.call(v) === '[object Object]';
}
