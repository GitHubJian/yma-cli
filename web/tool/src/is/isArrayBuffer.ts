import {toString} from './constant';

export function isArrayBuffer(v) {
    return toString.call(v) === '[object ArrayBuffer]';
}
