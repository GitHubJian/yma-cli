import {toString} from './constant';

export function isFile(v) {
    return toString.call(v) === '[object File]';
}
